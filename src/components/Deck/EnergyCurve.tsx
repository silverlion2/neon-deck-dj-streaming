import { useEffect, useRef } from "react";
import { TrendingUp } from "lucide-react";
import { useLiveStore } from "@/store/useLiveStore";
import { useQueueStore } from "@/store/useQueueStore";
import { useAnalyticsStore } from "@/store/useAnalyticsStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { TRACKS } from "@/data/tracks";
import type { Track } from "@/types";

function hexA(hex: string, a: number) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

export function EnergyCurve() {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  const currentTrack = useLiveStore((s) => s.currentTrack);
  const theme = useSettingsStore((s) => s.theme);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = () => {
      const t = useSettingsStore.getState().theme;
      const live = useLiveStore.getState();
      const queue = useQueueStore.getState().queue;
      const played = useAnalyticsStore.getState().playedTracks;

      const past: Track[] = played
        .slice(-8)
        .map((p) => TRACKS.find((tr) => tr.id === p.trackId))
        .filter((tr): tr is Track => Boolean(tr) && tr.id !== live.currentTrack.id);
      const future: Track[] = queue.map((q) => q.track);
      const seq: Track[] = [...past, live.currentTrack, ...future];
      const currentIdx = past.length;

      const dpr = window.devicePixelRatio || 1;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const padTop = 10;
      const padBottom = 14;
      const padX = 6;
      const plotW = Math.max(1, w - padX * 2);
      const plotH = Math.max(1, h - padTop - padBottom);
      const n = seq.length;
      const xAt = (i: number) =>
        n <= 1 ? w / 2 : padX + (i / (n - 1)) * plotW;
      const energyY = (e: number) => padTop + (1 - e) * plotH;

      const bpms = seq.map((tr) => tr.bpm);
      const minB = Math.min(...bpms);
      const maxB = Math.max(...bpms);
      const bpmY = (b: number) =>
        maxB === minB
          ? padTop + plotH / 2
          : padTop + (1 - (b - minB) / (maxB - minB)) * plotH;

      ctx.save();
      ctx.strokeStyle = "rgba(255,255,255,0.05)";
      ctx.lineWidth = 1;
      for (let gi = 0; gi <= 2; gi++) {
        const y = padTop + (gi / 2) * plotH;
        ctx.beginPath();
        ctx.moveTo(padX, y);
        ctx.lineTo(w - padX, y);
        ctx.stroke();
      }
      ctx.restore();

      if (n > 0) {
        ctx.save();
        for (let i = 0; i < n; i++) {
          ctx.fillStyle = hexA(t.secondary, i === currentIdx ? 0.9 : 0.4);
          ctx.beginPath();
          ctx.arc(xAt(i), bpmY(seq[i].bpm), i === currentIdx ? 3 : 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(xAt(0), padTop + plotH);
        ctx.lineTo(xAt(0), energyY(seq[0].energy));
        for (let i = 1; i < n; i++) {
          const xc = (xAt(i - 1) + xAt(i)) / 2;
          const yc = (energyY(seq[i - 1].energy) + energyY(seq[i].energy)) / 2;
          ctx.quadraticCurveTo(xAt(i - 1), energyY(seq[i - 1].energy), xc, yc);
        }
        ctx.lineTo(xAt(n - 1), energyY(seq[n - 1].energy));
        ctx.lineTo(xAt(n - 1), padTop + plotH);
        ctx.closePath();
        const grad = ctx.createLinearGradient(0, padTop, 0, padTop + plotH);
        grad.addColorStop(0, hexA(t.primary, 0.32));
        grad.addColorStop(1, hexA(t.primary, 0));
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(xAt(0), energyY(seq[0].energy));
        for (let i = 1; i < n; i++) {
          const xc = (xAt(i - 1) + xAt(i)) / 2;
          const yc = (energyY(seq[i - 1].energy) + energyY(seq[i].energy)) / 2;
          ctx.quadraticCurveTo(xAt(i - 1), energyY(seq[i - 1].energy), xc, yc);
        }
        ctx.lineTo(xAt(n - 1), energyY(seq[n - 1].energy));
        ctx.strokeStyle = t.primary;
        ctx.lineWidth = 2;
        ctx.lineJoin = "round";
        ctx.shadowColor = t.primary;
        ctx.shadowBlur = 8;
        ctx.stroke();
        ctx.restore();

        const cx = xAt(currentIdx);
        const cy = energyY(seq[currentIdx].energy);
        ctx.save();
        ctx.strokeStyle = hexA(t.primary, 0.3);
        ctx.setLineDash([2, 3]);
        ctx.beginPath();
        ctx.moveTo(cx, padTop);
        ctx.lineTo(cx, padTop + plotH);
        ctx.stroke();
        ctx.restore();

        ctx.save();
        ctx.shadowColor = t.primary;
        ctx.shadowBlur = 16;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = t.primary;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
      }

      raf.current = requestAnimationFrame(render);
    };

    raf.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf.current);
  }, []);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-1 pb-1">
        <div className="flex items-center gap-1.5">
          <TrendingUp className="h-3 w-3 text-neon-lime" />
          <span className="font-display text-[9px] font-bold uppercase tracking-[0.25em] text-neon-lime">
            能量曲线
          </span>
        </div>
        <div className="flex items-center gap-2 font-display text-[9px] tabular-nums">
          <span style={{ color: theme.primary }}>
            E{Math.round(currentTrack.energy * 100)}
          </span>
          <span style={{ color: theme.secondary }}>{currentTrack.bpm}BPM</span>
        </div>
      </div>
      <canvas ref={ref} className="h-20 w-full" />
    </div>
  );
}
