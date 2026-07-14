import { Star, Zap, Trash2 } from "lucide-react";
import { NeonPanel } from "@/components/shared/NeonPanel";
import {
  useMonetizationStore,
  type Highlight,
} from "@/store/useMonetizationStore";
import { useLiveStore } from "@/store/useLiveStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { formatTime } from "@/utils/format";
import { randInt } from "@/utils/random";

export function HighlightPanel() {
  const highlights = useMonetizationStore((s) => s.highlights);
  const markHighlight = useMonetizationStore((s) => s.markHighlight);
  const removeHighlight = useMonetizationStore((s) => s.removeHighlight);
  const currentTrack = useLiveStore((s) => s.currentTrack);
  const progress = useLiveStore((s) => s.progress);
  const theme = useSettingsStore((s) => s.theme);

  const handleMark = () => {
    markHighlight(currentTrack.title, progress, randInt(60, 100));
  };

  return (
    <NeonPanel
      accent="gold"
      title="精彩时刻"
      icon={<Star className="h-3.5 w-3.5" />}
      className="h-full"
    >
      <div className="flex h-full flex-col">
        <div className="border-b border-white/5 p-3">
          <button
            onClick={handleMark}
            className="flex w-full items-center justify-center gap-2 rounded-lg border py-2.5 font-display text-xs font-bold uppercase tracking-[0.2em] transition active:scale-[0.98]"
            style={{
              borderColor: `${theme.primary}80`,
              background: `${theme.primary}1F`,
              color: theme.primary,
              boxShadow: `0 0 14px ${theme.primary}55`,
            }}
          >
            <Zap className="h-4 w-4" />
            标记高光
          </button>
        </div>

        <div className="scrollbar-thin flex-1 overflow-y-auto p-3">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="font-display text-[9px] font-bold uppercase tracking-widest text-white/40">
              高光记录 · {highlights.length}
            </span>
          </div>

          {highlights.length === 0 ? (
            <div className="py-8 text-center font-body text-[11px] text-white/30">
              还没有标记，听到精彩段落时点击标记
            </div>
          ) : (
            <div className="space-y-2">
              {highlights.map((h) => (
                <HighlightItem
                  key={h.id}
                  highlight={h}
                  onRemove={removeHighlight}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </NeonPanel>
  );
}

function HighlightItem({
  highlight,
  onRemove,
}: {
  highlight: Highlight;
  onRemove: (id: string) => void;
}) {
  const theme = useSettingsStore((s) => s.theme);
  const heatPct = Math.min(100, Math.max(0, highlight.heat));

  return (
    <div className="group rounded-lg border border-white/5 bg-white/[0.02] px-2.5 py-2 transition hover:bg-white/[0.04]">
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <div className="font-body text-sm font-semibold text-white/90">
            {highlight.note}
          </div>
          <div className="mt-0.5 truncate font-body text-[10px] text-white/40">
            {highlight.trackTitle}
          </div>
        </div>
        <button
          onClick={() => onRemove(highlight.id)}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-white/30 transition hover:bg-white/10 hover:text-neon-magenta"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mt-2 flex items-center gap-2">
        <span className="font-display text-[9px] tabular-nums text-white/40">
          {formatTime(highlight.trackProgress)}
        </span>
        <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
          <div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              width: `${heatPct}%`,
              background: `linear-gradient(90deg, ${theme.secondary}, ${theme.primary})`,
              boxShadow: `0 0 8px ${theme.primary}88`,
            }}
          />
        </div>
        <span
          className="font-display text-[10px] font-bold tabular-nums"
          style={{ color: theme.primary }}
        >
          {highlight.heat}
        </span>
      </div>
    </div>
  );
}
