import { useEffect, useRef } from "react";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useLiveStore } from "@/store/useLiveStore";

interface P {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  a: number;
}

export function ParticleField() {
  const ref = useRef<HTMLCanvasElement>(null);
  const theme = useSettingsStore((s) => s.theme);
  const raf = useRef(0);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let particles: P[] = [];
    const init = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const count = Math.min(60, Math.floor((w * h) / 22000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: 1 + Math.random() * 2,
        a: 0.2 + Math.random() * 0.4,
      }));
    };

    const render = () => {
      const t = useSettingsStore.getState().theme;
      const live = useLiveStore.getState();
      const beatBoost = live.beat % 2 === 0 ? 1 : 0;
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        init();
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      for (const p of particles) {
        p.x += p.vx * (1 + beatBoost);
        p.y += p.vy * (1 + beatBoost);
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * (1 + beatBoost * 0.5), 0, Math.PI * 2);
        ctx.fillStyle = t.secondary;
        ctx.globalAlpha = p.a * (0.6 + beatBoost * 0.4);
        ctx.shadowColor = t.secondary;
        ctx.shadowBlur = 8;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf.current = requestAnimationFrame(render);
    };

    init();
    raf.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf.current);
  }, []);

  void theme;
  return <canvas ref={ref} className="pointer-events-none fixed inset-0 -z-[5] h-full w-full" />;
}
