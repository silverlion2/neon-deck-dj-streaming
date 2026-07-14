import { Disc3 } from "lucide-react";
import type { Track } from "@/types";
import { useSettingsStore } from "@/store/useSettingsStore";

interface TurntableProps {
  side: "A" | "B";
  track: Track;
  isPlaying: boolean;
  active: boolean;
  beat: number;
}

export function Turntable({ side, track, isPlaying, active, beat }: TurntableProps) {
  const theme = useSettingsStore((s) => s.theme);
  const color = side === "A" ? theme.primary : theme.secondary;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative flex h-28 w-28 items-center justify-center">
        <div
          className="absolute inset-0 rounded-full border"
          style={{
            borderColor: `${color}55`,
            boxShadow: active ? `0 0 24px ${color}66, inset 0 0 16px ${color}33` : "none",
          }}
        />
        <div
          className="relative h-24 w-24 overflow-hidden rounded-full border-2"
          style={{
            borderColor: color,
            animation: isPlaying ? "spinSlow 3s linear infinite" : "none",
            boxShadow: `0 0 16px ${color}55`,
          }}
        >
          <img src={track.cover} alt={track.title} className="h-full w-full object-cover opacity-80" />
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-transparent to-ink-900/50" />
          <div className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border bg-ink-900" style={{ borderColor: color }}>
            <Disc3 className="h-5 w-5" style={{ color }} />
          </div>
        </div>
        {active && (
          <div
            className="absolute -inset-1 rounded-full"
            style={{
              border: `1px solid ${color}`,
              transform: `scale(${1 + (beat % 2) * 0.06})`,
              opacity: 0.5,
            }}
          />
        )}
      </div>
      <div className="text-center">
        <div className="font-display text-[10px] font-bold" style={{ color }}>
          DECK {side}
        </div>
        <div className="max-w-[110px] truncate font-body text-[11px] text-white/70">
          {track.title}
        </div>
      </div>
    </div>
  );
}
