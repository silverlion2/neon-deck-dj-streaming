import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { Cast, Play, Square, Gauge, Users, Activity, Clock } from "lucide-react";
import { NeonPanel } from "@/components/shared/NeonPanel";
import { useIntegrationStore } from "@/store/useIntegrationStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { LIVE_PLATFORMS } from "@/data/livePlatforms";
import { formatCount, formatTime } from "@/utils/format";

const MAIN_PLATFORMS = LIVE_PLATFORMS.filter((p) => p.id !== "generic");

function AnimatedNumber({ value, className, style }: { value: number; className?: string; style?: CSSProperties }) {
  const [display, setDisplay] = useState(value);
  const ref = useRef(value);
  useEffect(() => {
    const start = ref.current;
    const delta = value - start;
    if (delta === 0) return;
    const t0 = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / 450);
      const eased = 1 - Math.pow(1 - k, 3);
      const cur = Math.round(start + delta * eased);
      setDisplay(cur);
      ref.current = cur;
      if (k < 1) raf = requestAnimationFrame(step);
      else ref.current = value;
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <span className={className} style={style}>{formatCount(display)}</span>;
}

export function SimulcastDashboard() {
  const connections = useIntegrationStore((s) => s.connections);
  const goLive = useIntegrationStore((s) => s.goLive);
  const stopLive = useIntegrationStore((s) => s.stopLive);
  const theme = useSettingsStore((s) => s.theme);

  const connected = MAIN_PLATFORMS.filter((p) => connections[p.id].connState === "connected" || connections[p.id].connState === "live");
  const livePlatforms = connected.filter((p) => connections[p.id].isLive);
  const totalViewers = livePlatforms.reduce((s, p) => s + connections[p.id].viewerCount, 0);

  const [health, setHealth] = useState<Record<string, number>>({});
  useEffect(() => {
    const tick = () => {
      const next: Record<string, number> = {};
      MAIN_PLATFORMS.forEach((p) => { next[p.id] = Math.floor(Math.random() * 15) + 85; });
      setHealth(next);
    };
    tick();
    const id = setInterval(tick, 3000);
    return () => clearInterval(id);
  }, []);

  const goLiveAll = () => connected.forEach((p) => goLive(p.id));
  const stopAll = () => livePlatforms.forEach((p) => stopLive(p.id));

  return (
    <NeonPanel accent="magenta" title="多平台同播" icon={<Cast className="h-3.5 w-3.5" />} className="h-full">
      <div className="flex h-full flex-col">
        <div className="border-b border-white/5 p-3" style={{ background: `linear-gradient(135deg, ${theme.primary}18, transparent)` }}>
          <div className="flex items-end justify-between gap-2">
            <div>
              <div className="flex items-center gap-1 font-display text-[9px] font-bold uppercase tracking-widest text-white/40">
                <Users className="h-3 w-3" />
                合计观看
              </div>
              <AnimatedNumber value={totalViewers} className="font-display text-3xl font-black leading-none" style={{ color: theme.primary, textShadow: `0 0 18px ${theme.primary}66` }} />
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="font-body text-[10px] text-white/50">已连接 {connected.length}/4 平台</span>
              <span className="flex items-center gap-1 font-body text-[10px]" style={{ color: livePlatforms.length > 0 ? "#FF3B3B" : "rgba(255,255,255,0.4)" }}>
                <span className={`h-1.5 w-1.5 rounded-full ${livePlatforms.length > 0 ? "animate-pulse" : ""}`} style={{ background: livePlatforms.length > 0 ? "#FF3B3B" : "rgba(255,255,255,0.3)" }} />
                正在直播 {livePlatforms.length} 个
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-1.5 border-b border-white/5 p-2">
          <button onClick={goLiveAll} className="flex flex-1 items-center justify-center gap-1 rounded-lg border py-1.5 font-display text-[10px] font-bold uppercase tracking-widest transition active:scale-95" style={{ borderColor: `${theme.accent}66`, background: `${theme.accent}1a`, color: theme.accent }}>
            <Play className="h-3 w-3" />
            全部开播
          </button>
          <button onClick={stopAll} className="flex flex-1 items-center justify-center gap-1 rounded-lg border py-1.5 font-display text-[10px] font-bold uppercase tracking-widest transition active:scale-95" style={{ borderColor: "rgba(255,59,59,0.5)", background: "rgba(255,59,59,0.12)", color: "#FF6B6B" }}>
            <Square className="h-3 w-3" />
            全部下播
          </button>
        </div>

        <div className="scrollbar-thin flex-1 overflow-y-auto p-2">
          {connected.length === 0 && (
            <div className="flex h-full items-center justify-center font-body text-[11px] text-white/30">尚未连接任何平台</div>
          )}
          {connected.map((p) => {
            const conn = connections[p.id];
            const hp = health[p.id] ?? 90;
            const healthColor = hp >= 90 ? "#3CFF8A" : "#FFD23C";
            return (
              <div key={p.id} className="mb-1.5 rounded-lg border px-2.5 py-2" style={{ borderColor: `${p.color}33`, background: `${p.color}0d` }}>
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${conn.isLive ? "animate-pulse" : ""}`} style={{ background: p.color, boxShadow: conn.isLive ? `0 0 8px ${p.color}` : "none" }} />
                  <span className="font-display text-[11px] font-bold" style={{ color: p.color }}>{p.short}</span>
                  {conn.isLive ? (
                    <span className="flex items-center gap-1 rounded-full bg-red-500/20 px-1.5 py-0.5 font-display text-[8px] font-bold uppercase tracking-widest text-red-400">
                      <span className="h-1 w-1 animate-pulse rounded-full bg-red-400" />
                      LIVE
                    </span>
                  ) : (
                    <span className="font-body text-[10px] text-white/40">待开播</span>
                  )}
                  <div className="ml-auto">
                    {conn.isLive ? (
                      <button onClick={() => stopLive(p.id)} className="rounded-md border border-red-500/30 bg-red-500/10 p-1 text-red-400 transition hover:bg-red-500/20 active:scale-95">
                        <Square className="h-3 w-3" />
                      </button>
                    ) : (
                      <button onClick={() => goLive(p.id)} className="flex items-center gap-0.5 rounded-md px-2 py-0.5 font-display text-[9px] font-bold uppercase tracking-widest text-ink-900 transition active:scale-95" style={{ background: p.color }}>
                        <Play className="h-3 w-3" />
                        开播
                      </button>
                    )}
                  </div>
                </div>
                {conn.isLive && (
                  <>
                    <div className="mt-1.5 grid grid-cols-3 gap-1.5">
                      <Stat label="观看" color={p.color} icon={<Users className="h-2.5 w-2.5" />} value={<AnimatedNumber value={conn.viewerCount} />} />
                      <Stat label="时长" color={p.color} icon={<Clock className="h-2.5 w-2.5" />} value={formatTime(conn.liveDuration)} />
                      <Stat label="码率" color={p.color} icon={<Gauge className="h-2.5 w-2.5" />} value={`${p.stream.bitrate}k`} />
                    </div>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <Activity className="h-3 w-3" style={{ color: healthColor }} />
                      <span className="font-display text-[8px] font-bold uppercase tracking-widest text-white/40">网络</span>
                      <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${hp}%`, background: healthColor, boxShadow: `0 0 6px ${healthColor}` }} />
                      </div>
                      <span className="font-body text-[10px] tabular-nums" style={{ color: healthColor }}>{hp}%</span>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </NeonPanel>
  );
}

function Stat({ label, value, color, icon }: { label: string; value: ReactNode; color: string; icon: ReactNode }) {
  return (
    <div className="rounded-md border border-white/5 bg-ink-900/40 px-1.5 py-1">
      <div className="flex items-center gap-0.5" style={{ color }}>
        {icon}
        <span className="font-display text-[8px] font-bold uppercase tracking-widest opacity-80">{label}</span>
      </div>
      <div className="mt-0.5 truncate font-body text-[11px] font-semibold tabular-nums text-white/90">{value}</div>
    </div>
  );
}
