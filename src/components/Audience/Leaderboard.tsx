import { Trophy, Crown } from "lucide-react";
import { useAudienceStore } from "@/store/useAudienceStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { NeonPanel } from "@/components/shared/NeonPanel";
import { formatCount } from "@/utils/format";

const MEDALS = ["🥇", "🥈", "🥉"];
const RANK_COLORS = ["#FFC53D", "#C0C0C0", "#CD7F32"];

export function Leaderboard() {
  const leaderboard = useAudienceStore((s) => s.leaderboard);
  const theme = useSettingsStore((s) => s.theme);
  const top = leaderboard.slice(0, 6);

  return (
    <NeonPanel title="本场贡献榜" accent="gold" icon={<Trophy className="h-3.5 w-3.5" />}>
      <div className="space-y-1 p-2">
        {top.map((e, i) => {
          const isTop3 = i < 3;
          return (
            <div
              key={`${e.name}-${i}`}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5"
              style={
                isTop3
                  ? { background: `linear-gradient(90deg, ${RANK_COLORS[i]}22, transparent)` }
                  : undefined
              }
            >
              <span className="w-5 text-center font-display text-sm font-bold leading-none">
                {isTop3 ? (
                  <span className="text-base">{MEDALS[i]}</span>
                ) : (
                  <span className="text-white/40">{i + 1}</span>
                )}
              </span>
              <div className="relative shrink-0">
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-full font-display text-[10px] font-bold text-ink-900"
                  style={{ background: e.color, boxShadow: `0 0 8px ${e.color}88` }}
                >
                  {e.name.slice(0, 1)}
                </div>
                {e.isVip && (
                  <span className="absolute -right-1 -top-1 flex h-3 w-3 items-center justify-center rounded-full bg-ink-900">
                    <Crown className="h-2.5 w-2.5 text-neon-gold" />
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate font-body text-xs font-semibold text-white/90">
                  {e.name}
                </div>
                <div className="font-body text-[9px] uppercase tracking-wider text-white/40">
                  LV{e.level}
                </div>
              </div>
              <span
                className="font-display text-xs font-bold tabular-nums"
                style={{
                  color:
                    i === 0
                      ? theme.primary
                      : i === 1
                        ? theme.secondary
                        : i === 2
                          ? theme.accent
                          : "#ffffff",
                }}
              >
                {formatCount(e.contribution)}
              </span>
            </div>
          );
        })}
      </div>
    </NeonPanel>
  );
}
