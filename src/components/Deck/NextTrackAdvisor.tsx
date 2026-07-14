import { useMemo } from "react";
import { Lightbulb, Play } from "lucide-react";
import { NeonPanel } from "@/components/shared/NeonPanel";
import { useLiveStore } from "@/store/useLiveStore";
import { useQueueStore } from "@/store/useQueueStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { TRACKS } from "@/data/tracks";
import { matchTracks, LEVEL_COLOR } from "@/utils/harmonic";

export function NextTrackAdvisor() {
  const currentTrack = useLiveStore((s) => s.currentTrack);
  const playTrack = useLiveStore((s) => s.playTrack);
  const addRequest = useQueueStore((s) => s.addRequest);
  const theme = useSettingsStore((s) => s.theme);

  const matches = useMemo(
    () => matchTracks(currentTrack, TRACKS).slice(0, 5),
    [currentTrack]
  );

  const handlePick = (trackId: string) => {
    const track = TRACKS.find((t) => t.id === trackId);
    if (!track) return;
    playTrack(track);
    addRequest(track);
  };

  return (
    <NeonPanel
      title="智能选曲"
      accent="lime"
      icon={<Lightbulb className="h-3.5 w-3.5" />}
      className="h-full"
      action={
        <span className="font-display text-[9px] uppercase tracking-widest text-white/30">
          {currentTrack.bpm}BPM · {currentTrack.key}
        </span>
      }
    >
      <div className="scrollbar-thin flex h-full flex-col overflow-y-auto px-3 py-2">
        {matches.map((m, i) => {
          const delta = m.track.bpm - currentTrack.bpm;
          const color = LEVEL_COLOR[m.level];
          return (
            <button
              key={m.track.id}
              onClick={() => handlePick(m.track.id)}
              className="group mb-1 flex w-full items-center gap-2 rounded-lg px-1.5 py-1.5 text-left transition hover:bg-white/5"
            >
              <span className="w-3 shrink-0 text-center font-display text-[10px] font-bold text-white/25">
                {i + 1}
              </span>
              <img
                src={m.track.cover}
                alt=""
                className="h-9 w-9 shrink-0 rounded object-cover"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="truncate font-body text-xs font-semibold text-white/85">
                    {m.track.title}
                  </span>
                  <span
                    className="flex h-4 min-w-[14px] shrink-0 items-center justify-center rounded px-1 font-display text-[9px] font-bold"
                    style={{
                      color: "#05050C",
                      backgroundColor: color,
                      boxShadow: `0 0 8px ${color}99`,
                    }}
                  >
                    {m.label}
                  </span>
                </div>
                <div className="truncate font-body text-[10px] text-white/40">
                  {m.track.artist}
                </div>
                <div className="truncate font-body text-[9px]" style={{ color }}>
                  {m.reason}
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-0.5">
                <div className="flex items-baseline gap-1 font-display text-[11px] font-bold tabular-nums text-white/80">
                  {m.track.bpm}
                  <span
                    className="text-[9px]"
                    style={{
                      color: delta === 0 ? theme.accent : theme.secondary,
                    }}
                  >
                    {delta > 0 ? `+${delta}` : delta}
                  </span>
                </div>
                <div
                  className="font-display text-[9px] font-bold"
                  style={{ color: theme.primary }}
                >
                  {m.track.key}
                </div>
              </div>
              <Play className="h-3 w-3 shrink-0 text-neon-lime opacity-0 transition group-hover:opacity-100" />
            </button>
          );
        })}
      </div>
    </NeonPanel>
  );
}
