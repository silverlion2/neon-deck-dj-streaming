import { useEffect, useRef } from "react";
import { useAnalyticsStore } from "@/store/useAnalyticsStore";
import { useSettingsStore } from "@/store/useSettingsStore";

const WINDOW_MS = 120_000;

export function HeatCurve() {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  const theme = useSettingsStore((s) => s.theme);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = () => {
      const t = useSettingsStore.getState().theme;
      const history = useAnalyticsStore.getState().heatHistory;
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (w === 0 || h === 0) {
        raf.current = requestAnimationFrame(render);
        return;
      }
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const now = Date.now();
      const minT = now - WINDOW_MS;
      const visible = history.filter((p) => p.t >= minT);
      const maxVal = visible.reduce(
        (m, p) => Math.max(m, p.chat, p.gift, p.like),
        1,
      );
      const padY = 4;
      const innerH = h - padY * 2;
      const xFor = (ts: number) =>
        visible.length <= 1 ? 0 : ((ts - minT) / WINDOW_MS) * w;
      const yFor = (v: number) => padY + innerH - (v / maxVal) * innerH;

      const drawSeries = (
        key: "chat" | "gift" | "like",
        color: string,
        fillAlpha: number,
      ) => {
        if (visible.length === 0) return;
        ctx.beginPath();
        ctx.moveTo(xFor(visible[0].t), yFor(visible[0][key]));
        for (let i = 1; i < visible.length; i++) {
          ctx.lineTo(xFor(visible[i].t), yFor(visible[i][key]));
        }
        ctx.save();
        ctx.shadowColor = color;
        ctx.shadowBlur = 6;
        ctx.strokeStyle = color;
        ctx.globalAlpha = 0.9;
        ctx.lineWidth = 1.25;
        ctx.stroke();
        ctx.restore();

        ctx.lineTo(xFor(visible[visible.length - 1].t), h);
        ctx.lineTo(xFor(visible[0].t), h);
        ctx.closePath();
        ctx.globalAlpha = fillAlpha;
        ctx.fillStyle = color;
        ctx.fill();
        ctx.globalAlpha = 1;
      };

      drawSeries("chat", t.primary, 0.18);
      drawSeries("gift", t.accent, 0.4);
      drawSeries("like", t.secondary, 0.18);

      ctx.beginPath();
      ctx.moveTo(w - 0.5, 0);
      ctx.lineTo(w - 0.5, h);
      ctx.strokeStyle = t.secondary;
      ctx.globalAlpha = 0.5;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(w - 0.5, 1.5, 2, 0, Math.PI * 2);
      ctx.fillStyle = t.secondary;
      ctx.globalAlpha = 0.9;
      ctx.fill();
      ctx.globalAlpha = 1;

      raf.current = requestAnimationFrame(render);
    };

    raf.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf.current);
  }, []);

  const legend = [
    { label: "弹幕", color: theme.primary },
    { label: "礼物", color: theme.accent },
    { label: "点赞", color: theme.secondary },
  ];

  return (
    <div className="flex h-[70px] flex-col">
      <div className="flex items-center justify-between px-1 pb-1">
        <span className="font-display text-[9px] font-bold uppercase tracking-widest text-white/50">
          实时热度
        </span>
        <div className="flex items-center gap-2.5">
          {legend.map((l) => (
            <span key={l.label} className="flex items-center gap-1">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: l.color }}
              />
              <span className="font-body text-[9px] text-white/40">{l.label}</span>
            </span>
          ))}
        </div>
      </div>
      <canvas ref={ref} className="min-h-0 w-full flex-1" />
    </div>
  );
}
