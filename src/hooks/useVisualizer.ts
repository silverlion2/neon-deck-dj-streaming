import { useEffect, useRef } from "react";
import { useSettingsStore } from "@/store/useSettingsStore";
import { audioEngine } from "@/audio/AudioEngine";

const BARS = 80;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  size: number;
  color: string;
}

export function useVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dataRef = useRef<number[]>(new Array(BARS).fill(0));
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);
  const beatRef = useRef(0);
  const lastBeatTime = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = () => {
      const settings = useSettingsStore.getState();
      const mode = settings.visualMode;
      const theme = settings.theme;

      const dpr = window.devicePixelRatio || 1;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const analyser = audioEngine.getAnalyser();
      let freqData: Uint8Array | null = null;
      let bassEnergy = 0;
      let midEnergy = 0;
      let highEnergy = 0;
      let totalEnergy = 0;

      if (analyser) {
        freqData = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(freqData);
        const bins = freqData.length;
        const bassEnd = Math.floor(bins * 0.1);
        const midEnd = Math.floor(bins * 0.4);
        for (let i = 0; i < bassEnd; i++) bassEnergy += freqData[i];
        for (let i = bassEnd; i < midEnd; i++) midEnergy += freqData[i];
        for (let i = midEnd; i < bins; i++) highEnergy += freqData[i];
        bassEnergy /= bassEnd * 255;
        midEnergy /= (midEnd - bassEnd) * 255;
        highEnergy /= (bins - midEnd) * 255;
        totalEnergy = (bassEnergy + midEnergy + highEnergy) / 3;
      }

      const now = performance.now();
      let beatPulse = 0;
      if (bassEnergy > 0.55 && now - lastBeatTime.current > 250) {
        lastBeatTime.current = now;
        beatRef.current++;
        beatPulse = 1;
      }

      const data = dataRef.current;
      const hasAudio = totalEnergy > 0.01;

      for (let i = 0; i < BARS; i++) {
        let target: number;
        if (hasAudio && freqData) {
          const idx = Math.floor((i / BARS) * freqData.length * 0.7);
          target = freqData[idx] / 255;
        } else {
          const center = 1 - Math.abs(i - BARS / 2) / (BARS / 2);
          target = 0.03 + Math.sin(now / 800 + i * 0.3) * 0.02 + center * 0.03;
        }
        data[i] += (target - data[i]) * 0.4;
      }

      const cx = w / 2;
      const cy = h / 2;

      if (mode === "ring") drawRing(ctx, data, cx, cy, w, h, theme.primary, theme.secondary, beatPulse, bassEnergy);
      else if (mode === "wave") drawWave(ctx, data, w, h, theme.primary, theme.secondary, beatPulse, totalEnergy);
      else drawParticles(ctx, data, particlesRef.current, cx, cy, w, h, theme.primary, theme.secondary, beatPulse, bassEnergy);

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return canvasRef;
}

function drawRing(
  ctx: CanvasRenderingContext2D,
  data: number[],
  cx: number,
  cy: number,
  w: number,
  h: number,
  accent: string,
  accent2: string,
  beatPulse: number,
  bassEnergy: number
) {
  const baseR = Math.min(w, h) * 0.13 + bassEnergy * 30;
  const maxLen = Math.min(w, h) * 0.32;

  for (let i = 0; i < data.length; i++) {
    const angle = (i / data.length) * Math.PI * 2 - Math.PI / 2;
    const len = data[i] * maxLen;
    const x1 = cx + Math.cos(angle) * baseR;
    const y1 = cy + Math.sin(angle) * baseR;
    const x2 = cx + Math.cos(angle) * (baseR + len);
    const y2 = cy + Math.sin(angle) * (baseR + len);
    const grad = ctx.createLinearGradient(x1, y1, x2, y2);
    grad.addColorStop(0, accent);
    grad.addColorStop(1, accent2);
    ctx.strokeStyle = grad;
    ctx.lineWidth = 3 + bassEnergy * 2;
    ctx.lineCap = "round";
    ctx.shadowColor = accent;
    ctx.shadowBlur = 8 + beatPulse * 20 + bassEnergy * 15;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
  ctx.shadowBlur = 0;

  if (beatPulse > 0 || bassEnergy > 0.3) {
    const pulseR = baseR + beatPulse * 40 + bassEnergy * 20;
    const ringGrad = ctx.createRadialGradient(cx, cy, pulseR * 0.3, cx, cy, pulseR * 1.5);
    ringGrad.addColorStop(0, "rgba(0,0,0,0)");
    ringGrad.addColorStop(0.6, hexA(accent, 0.15 + bassEnergy * 0.2));
    ringGrad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = ringGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, pulseR * 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawWave(
  ctx: CanvasRenderingContext2D,
  data: number[],
  w: number,
  h: number,
  accent: string,
  accent2: string,
  beatPulse: number,
  energy: number
) {
  const cy = h / 2;
  for (let layer = 0; layer < 3; layer++) {
    ctx.beginPath();
    const amp = (h * 0.22) * (1 - layer * 0.25) * (0.5 + energy);
    const phase = performance.now() / (300 - layer * 50);
    for (let x = 0; x <= w; x += 3) {
      const idx = Math.floor((x / w) * data.length);
      const v = data[idx] ?? 0;
      const y = cy + Math.sin(x / 40 + phase + layer * 1.5) * amp * (v + 0.1) * (1 + beatPulse * 0.5);
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    const grad = ctx.createLinearGradient(0, 0, w, 0);
    grad.addColorStop(0, accent);
    grad.addColorStop(0.5, accent2);
    grad.addColorStop(1, accent);
    ctx.strokeStyle = grad;
    ctx.lineWidth = 3 - layer;
    ctx.globalAlpha = 1 - layer * 0.3;
    ctx.shadowColor = accent;
    ctx.shadowBlur = 12 + beatPulse * 18;
    ctx.lineCap = "round";
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
}

function drawParticles(
  ctx: CanvasRenderingContext2D,
  data: number[],
  particles: Particle[],
  cx: number,
  cy: number,
  w: number,
  h: number,
  accent: string,
  accent2: string,
  beatPulse: number,
  bassEnergy: number
) {
  if (beatPulse > 0) {
    const count = 12 + Math.floor(bassEnergy * 20);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
      const speed = 2 + Math.random() * 4 + bassEnergy * 3;
      particles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        size: 2 + Math.random() * 4,
        color: Math.random() > 0.5 ? accent : accent2,
      });
    }
  }
  if (particles.length > 300) particles.splice(0, particles.length - 300);

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= 0.97;
    p.vy *= 0.97;
    p.life -= 0.01;
    if (p.life <= 0 || p.x < -20 || p.x > w + 20 || p.y < -20 || p.y > h + 20) {
      particles.splice(i, 1);
      continue;
    }
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;

  const energy = data.reduce((s, d) => s + d, 0) / data.length;
  const coreR = 30 + energy * 80 + bassEnergy * 40 + beatPulse * 25;
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR);
  grad.addColorStop(0, hexA(accent, 0.4 + bassEnergy * 0.3));
  grad.addColorStop(0.5, hexA(accent2, 0.15));
  grad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
  ctx.fill();
}

function hexA(hex: string, a: number) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}
