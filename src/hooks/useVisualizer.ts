import { useEffect, useRef } from "react";
import { useLiveStore } from "@/store/useLiveStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { audioEngine } from "@/audio/AudioEngine";

const BARS = 72;

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
  const lastBeat = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = () => {
      const live = useLiveStore.getState();
      const { isPlaying, beat, currentTrack } = live;
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

      const beatPulse = beat !== lastBeat.current ? 1 : 0;
      lastBeat.current = beat;

      const analyser = audioEngine.getAnalyser();
      let realFreq: Uint8Array | null = null;
      if (analyser) {
        realFreq = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(realFreq);
      }

      const data = dataRef.current;
      const intensityBase = isPlaying ? 0.35 + beatPulse * 0.5 : 0.08;
      const accent = theme.primary;
      const accent2 = theme.secondary;

      for (let i = 0; i < BARS; i++) {
        const center = 1 - Math.abs(i - BARS / 2) / (BARS / 2);
        const real = realFreq ? realFreq[Math.floor((i / BARS) * realFreq.length)] / 255 : 0;
        const target = isPlaying
          ? Math.max(
              0.05,
              intensityBase * center +
                real * 0.6 +
                Math.random() * 0.3 * center +
                beatPulse * 0.3 * center
            )
          : 0.04 + Math.random() * 0.03;
        data[i] += (target - data[i]) * 0.35;
      }

      const cx = w / 2;
      const cy = h / 2;

      if (mode === "ring") drawRing(ctx, data, cx, cy, w, h, accent, accent2, beatPulse);
      else if (mode === "wave") drawWave(ctx, data, w, h, accent, accent2, beatPulse);
      else drawParticles(ctx, data, particlesRef.current, cx, cy, w, h, accent, accent2, beatPulse, currentTrack.bpm);

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
  beatPulse: number
) {
  const baseR = Math.min(w, h) * 0.16;
  const maxLen = Math.min(w, h) * 0.3;
  ctx.save();
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
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.shadowColor = accent;
    ctx.shadowBlur = 12 + beatPulse * 18;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
  ctx.restore();

  ctx.save();
  const pulseR = baseR + beatPulse * 18 + Math.sin(Date.now() / 300) * 4;
  const ringGrad = ctx.createRadialGradient(cx, cy, pulseR * 0.4, cx, cy, pulseR);
  ringGrad.addColorStop(0, "rgba(0,0,0,0)");
  ringGrad.addColorStop(0.7, hexA(accent, 0.18));
  ringGrad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = ringGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, pulseR, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawWave(
  ctx: CanvasRenderingContext2D,
  data: number[],
  w: number,
  h: number,
  accent: string,
  accent2: string,
  beatPulse: number
) {
  const cy = h / 2;
  ctx.save();
  for (let layer = 0; layer < 3; layer++) {
    ctx.beginPath();
    const amp = (h * 0.25) * (1 - layer * 0.25);
    for (let x = 0; x <= w; x += 4) {
      const idx = Math.floor((x / w) * data.length);
      const v = data[idx] ?? 0;
      const y = cy + Math.sin(x / 30 + Date.now() / 200 + layer) * amp * v * (1 + beatPulse * 0.4);
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
    ctx.shadowBlur = 14 + beatPulse * 16;
    ctx.lineCap = "round";
    ctx.stroke();
  }
  ctx.restore();
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
  bpm: number
) {
  if (beatPulse > 0) {
    const count = 10;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const speed = 2 + Math.random() * 3;
      particles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        size: 2 + Math.random() * 3,
        color: Math.random() > 0.5 ? accent : accent2,
      });
    }
  }
  if (particles.length > 220) particles.splice(0, particles.length - 220);

  ctx.save();
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= 0.98;
    p.vy *= 0.98;
    p.life -= 0.012;
    if (p.life <= 0 || p.x < 0 || p.x > w || p.y < 0 || p.y > h) {
      particles.splice(i, 1);
      continue;
    }
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  const energy = data.reduce((s, d) => s + d, 0) / data.length;
  const coreR = 40 + energy * 60 + beatPulse * 20;
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR);
  grad.addColorStop(0, hexA(accent, 0.5));
  grad.addColorStop(0.6, hexA(accent2, 0.18));
  grad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.save();
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  void bpm;
}

function hexA(hex: string, a: number) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}
