import { Disc3, Music2, Pause, Play, SkipBack, SkipForward, Circle, Activity, Sparkles } from "lucide-react";
import { useLiveStore } from "@/store/useLiveStore";
import { useSettingsStore, type VisualMode } from "@/store/useSettingsStore";
import { useVisualizer } from "@/hooks/useVisualizer";
import { formatTime } from "@/utils/format";
import { Danmaku } from "./Danmaku";
import { GiftLayer } from "./GiftLayer";
import { LyricsDisplay } from "./LyricsDisplay";

const VISUAL_MODES: { id: VisualMode; icon: typeof Circle; label: string }[] = [
  { id: "ring", icon: Circle, label: "环形频谱" },
  { id: "wave", icon: Activity, label: "波形" },
  { id: "particles", icon: Sparkles, label: "粒子" },
];

export function Stage() {
  const canvasRef = useVisualizer();
  const { currentTrack, nextTrack, progress, isPlaying, toggle, next, prev, beat, transitioning } =
    useLiveStore();
  const { visualMode, setVisualMode, theme } = useSettingsStore();
  const pct = (progress / currentTrack.duration) * 100;

  return (
    <div className="relative flex-1 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-ink-700/80 to-ink-900/90">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div
          className="relative flex h-[120px] w-[120px] items-center justify-center rounded-full border-2 border-white/10 bg-ink-900/60 backdrop-blur-sm"
          style={{ animation: "spinSlow 6s linear infinite" }}
        >
          <Disc3
            className="h-16 w-16"
            style={{ color: theme.primary, filter: `drop-shadow(0 0 12px ${theme.primary})` }}
          />
          <div
            className="absolute inset-0 rounded-full border"
            style={{ borderColor: `${theme.secondary}66`, boxShadow: `0 0 30px ${theme.secondary}4D` }}
          />
        </div>
      </div>

      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ transform: `translate(-50%, -50%) scale(${1 + (beat % 2) * 0.04})` }}
      >
        <div
          className="h-[200px] w-[200px] rounded-full"
          style={{
            background: `radial-gradient(circle, ${currentTrack.accent}22 0%, transparent 70%)`,
            animation: "beat 0.5s ease-in-out infinite",
          }}
        />
      </div>

      <Danmaku />
      <GiftLayer />
      <LyricsDisplay />

      <div className="absolute left-4 top-4 flex items-center gap-2">
        <span
          className="flex items-center gap-1.5 rounded-full border px-2.5 py-1"
          style={{ borderColor: `${theme.primary}80`, background: `${theme.primary}26` }}
        >
          <span
            className="h-1.5 w-1.5 animate-blink rounded-full"
            style={{ background: theme.primary }}
          />
          <span
            className="font-display text-[10px] font-black tracking-widest"
            style={{ color: theme.primary }}
          >
            LIVE
          </span>
        </span>
        <span className="rounded-full border border-white/10 bg-ink-900/60 px-2.5 py-1 font-body text-[10px] uppercase tracking-widest text-white/50">
          {currentTrack.genre}
        </span>
        {transitioning && (
          <span className="flex items-center gap-1 rounded-full border border-neon-lime/50 bg-neon-lime/10 px-2 py-1 font-display text-[9px] font-bold tracking-widest text-neon-lime">
            <span className="h-1 w-1 animate-blink rounded-full bg-neon-lime" />
            AUTO MIX
          </span>
        )}
      </div>

      <div className="absolute right-4 top-4 flex flex-col items-end gap-2">
        <div className="text-right">
          <div className="font-wave text-2xl" style={{ color: theme.secondary }}>
            {currentTrack.bpm}
          </div>
          <div className="font-body text-[9px] uppercase tracking-[0.3em] text-white/40">BPM</div>
        </div>
        <div className="flex gap-1 rounded-lg border border-white/10 bg-ink-900/60 p-0.5">
          {VISUAL_MODES.map((m) => {
            const Icon = m.icon;
            const active = visualMode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setVisualMode(m.id)}
                title={m.label}
                className="flex h-6 w-6 items-center justify-center rounded transition"
                style={{
                  background: active ? `${theme.secondary}33` : "transparent",
                  color: active ? theme.secondary : "rgba(255,255,255,0.4)",
                }}
              >
                <Icon className="h-3.5 w-3.5" />
              </button>
            );
          })}
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-900 via-ink-900/80 to-transparent p-4 pt-10">
        <div className="mb-3 flex items-end gap-3">
          <img
            src={currentTrack.cover}
            alt={currentTrack.title}
            className="h-14 w-14 rounded-lg border border-white/10 object-cover"
            style={{ boxShadow: `0 0 16px ${currentTrack.accent}88` }}
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <Music2 className="h-3 w-3" style={{ color: theme.secondary }} />
              <span className="truncate font-display text-base font-bold text-white">
                {currentTrack.title}
              </span>
            </div>
            <div className="flex items-center gap-2 font-body text-xs text-white/50">
              <span>{currentTrack.artist}</span>
              <span className="text-white/20">·</span>
              <span className="text-white/30">下一首 {nextTrack.title}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={prev}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/70 transition hover:border-white/30 hover:text-white active:scale-95"
            >
              <SkipBack className="h-4 w-4" />
            </button>
            <button
              onClick={toggle}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-white transition active:scale-95"
              style={{
                background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                boxShadow: `0 0 16px ${theme.primary}88`,
              }}
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </button>
            <button
              onClick={next}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/70 transition hover:border-white/30 hover:text-white active:scale-95"
            >
              <SkipForward className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-display text-[10px] tabular-nums text-white/50">
            {formatTime(progress)}
          </span>
          <div className="group relative h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
            <div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{
                width: `${pct}%`,
                background: `linear-gradient(90deg, ${currentTrack.accent}, ${theme.secondary})`,
                boxShadow: `0 0 10px ${currentTrack.accent}`,
              }}
            />
          </div>
          <span className="font-display text-[10px] tabular-nums text-white/30">
            {formatTime(currentTrack.duration)}
          </span>
        </div>
      </div>
    </div>
  );
}
