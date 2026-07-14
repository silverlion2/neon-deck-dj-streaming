import { useEffect, useRef, useState } from "react";
import { Activity } from "lucide-react";
import { useLiveStore } from "@/store/useLiveStore";
import { useSettingsStore } from "@/store/useSettingsStore";

interface Band {
  id: string;
  label: string;
  speed: number;
  amp: number;
  base: number;
  phase: number;
}

const BANDS: Band[] = [
  { id: "low", label: "LOW", speed: 0.9, amp: 28, base: 55, phase: 0 },
  { id: "mid", label: "MID", speed: 1.7, amp: 34, base: 50, phase: 1.2 },
  { id: "high", label: "HIGH", speed: 2.6, amp: 40, base: 42, phase: 2.4 },
];

const PEAK_THRESHOLD = 85;
const PEAK_COLOR = "#FF6B6B";

export function LevelMeter() {
  const volume = useLiveStore((s) => s.volume);
  const beat = useLiveStore((s) => s.beat);
  const theme = useSettingsStore((s) => s.theme);
  const [levels, setLevels] = useState<number[]>(BANDS.map((b) => b.base));
  const rafRef = useRef<number>(0);
  const beatRef = useRef(0);

  useEffect(() => {
    beatRef.current = beat;
  }, [beat]);

  useEffect(() => {
    const volNorm = volume / 100;
    let t = 0;
    const loop = () => {
      t += 0.05;
      const next = BANDS.map((b, i) => {
        const beatPulse = beatRef.current % 2 === 0 && i === 0 ? 18 : 0;
        const sine = Math.sin(t * b.speed + b.phase) * b.amp;
        const noise = (Math.random() - 0.5) * b.amp * 0.6;
        const raw = b.base + sine + noise + beatPulse;
        return Math.max(0, Math.min(100, raw * volNorm + (1 - volNorm) * 4));
      });
      setLevels(next);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [volume]);

  const anyPeak = levels.some((l) => l > PEAK_THRESHOLD);

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-white/10 bg-ink-900/50 p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Activity className="h-3.5 w-3.5" style={{ color: theme.secondary }} />
          <span className="font-display text-[10px] font-bold uppercase tracking-widest text-white/50">
            电平监测
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="font-display text-sm font-bold tabular-nums"
            style={{ color: anyPeak ? PEAK_COLOR : theme.primary }}
          >
            {Math.round(volume)}
          </span>
          <span className="font-body text-[9px] uppercase tracking-widest text-white/30">
            dB
          </span>
        </div>
      </div>

      <div className="flex items-end justify-between gap-3 px-1">
        {BANDS.map((b, i) => {
          const level = levels[i];
          const isPeak = level > PEAK_THRESHOLD;
          const color = isPeak ? PEAK_COLOR : i === 0 ? theme.primary : i === 1 ? theme.secondary : theme.accent;
          return (
            <div key={b.id} className="flex flex-1 flex-col items-center gap-1">
              <div className="relative flex h-20 w-full items-end justify-center">
                <div
                  className="relative w-4 overflow-hidden rounded-sm transition-[height] duration-75"
                  style={{
                    height: `${level}%`,
                    background: `linear-gradient(180deg, ${color}, ${color}55)`,
                    boxShadow: `0 0 10px ${color}99`,
                  }}
                >
                  <div
                    className="absolute inset-0 opacity-40"
                    style={{
                      background:
                        "repeating-linear-gradient(180deg, rgba(0,0,0,0.4) 0 2px, transparent 2px 5px)",
                    }}
                  />
                </div>
                {isPeak && (
                  <span
                    className="absolute -top-0.5 animate-pulse font-display text-[8px] font-bold tracking-widest"
                    style={{ color: PEAK_COLOR, textShadow: `0 0 6px ${PEAK_COLOR}` }}
                  >
                    PEAK
                  </span>
                )}
              </div>
              <span
                className="font-display text-[8px] font-bold tracking-widest"
                style={{ color: isPeak ? PEAK_COLOR : "rgba(255,255,255,0.4)" }}
              >
                {b.label}
              </span>
            </div>
          );
        })}
      </div>

      {anyPeak && (
        <div
          className="flex items-center justify-center rounded-md border py-0.5 font-display text-[9px] font-bold uppercase tracking-widest"
          style={{
            borderColor: `${PEAK_COLOR}66`,
            background: `${PEAK_COLOR}1a`,
            color: PEAK_COLOR,
          }}
        >
          ⚠ PEAK WARNING
        </div>
      )}
    </div>
  );
}
