import { BarChart3, Clock, Users, MessageSquare, Gift, Flame } from "lucide-react";
import { NeonPanel } from "@/components/shared/NeonPanel";
import { useAnalyticsStore, type TrackStat } from "@/store/useAnalyticsStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { formatTime, formatCount } from "@/utils/format";

const REACTION_EMOJI: Record<TrackStat["reactions"], string> = {
  fire: "🔥",
  warm: "🔥",
  cool: "💧",
};

export function AnalyticsPanel() {
  const { snapshot } = useAnalyticsStore();
  const theme = useSettingsStore((s) => s.theme);
  const snap = snapshot();

  const stats: { icon: React.ReactNode; label: string; value: string; color: string }[] = [
    { icon: <Clock className="h-3 w-3" />, label: "直播时长", value: formatTime(snap.duration), color: theme.secondary },
    { icon: <Users className="h-3 w-3" />, label: "峰值在线", value: formatCount(snap.peakOnline), color: theme.primary },
    { icon: <MessageSquare className="h-3 w-3" />, label: "累计弹幕", value: formatCount(snap.totalChat), color: theme.primary },
    { icon: <Gift className="h-3 w-3" />, label: "累计礼物", value: formatCount(snap.totalGift), color: theme.accent },
  ];

  return (
    <NeonPanel title="直播数据" accent="cyan" icon={<BarChart3 className="h-3.5 w-3.5" />}>
      <div className="space-y-3 p-3">
        <div className="grid grid-cols-2 gap-2">
          {stats.map((s) => (
            <StatCard key={s.label} icon={s.icon} label={s.label} value={s.value} color={s.color} />
          ))}
        </div>

        <div>
          <div className="mb-1.5 flex items-center gap-1.5">
            <Flame className="h-3 w-3 text-neon-gold" />
            <span className="font-display text-[9px] font-bold uppercase tracking-widest text-white/40">
              热门曲目
            </span>
          </div>
          {snap.topTracks.length === 0 ? (
            <div className="py-3 text-center font-body text-[11px] text-white/30">
              暂无曲目数据
            </div>
          ) : (
            <div className="space-y-1">
              {snap.topTracks.map((t, i) => (
                <div
                  key={t.trackId}
                  className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.02] px-2 py-1.5"
                >
                  <span
                    className="w-4 text-center font-display text-[10px] font-bold tabular-nums text-white/30"
                    style={i === 0 ? { color: theme.primary } : undefined}
                  >
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-body text-xs font-semibold text-white/85">
                      {t.title}
                    </div>
                    <div className="flex items-center gap-1.5 font-body text-[10px]">
                      <span style={{ color: theme.secondary }}>播放 {t.plays}</span>
                      <span className="text-white/25">·</span>
                      <span style={{ color: theme.accent }}>礼物 {t.gifts}</span>
                    </div>
                  </div>
                  <span className="text-sm leading-none">{REACTION_EMOJI[t.reactions]}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </NeonPanel>
  );
}

function StatCard({
  icon,
  value,
  label,
  color,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  color: string;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-ink-900/50 p-2.5">
      <div className="flex items-center gap-1">
        <span style={{ color }}>{icon}</span>
        <span className="font-body text-[9px] uppercase tracking-widest text-white/40">{label}</span>
      </div>
      <div className="mt-1 font-display text-lg font-bold tabular-nums" style={{ color }}>
        {value}
      </div>
    </div>
  );
}
