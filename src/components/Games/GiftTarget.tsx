import { Target } from "lucide-react";
import { useMonetizationStore } from "@/store/useMonetizationStore";
import { useSettingsStore } from "@/store/useSettingsStore";

const QUICK_TARGETS = [
  { value: 5000, reward: "解锁 30 分钟特别 Deep Set" },
  { value: 10000, reward: "解锁 1 小时豪华 Live Mix" },
];

export function GiftTarget() {
  const { giftTarget, giftCurrent, targetReward, setTarget } = useMonetizationStore();
  const theme = useSettingsStore((s) => s.theme);
  const pct = Math.min(100, (giftCurrent / giftTarget) * 100);
  const reached = pct >= 100;
  const nearTarget = pct >= 75;

  return (
    <div className="relative flex h-[100px] flex-col justify-between overflow-hidden rounded-xl border border-white/10 bg-ink-800/70 p-2.5 backdrop-blur-xl">
      <div>
        <div className="mb-1 flex items-center justify-between font-body text-[10px]">
          <span className="flex items-center gap-1 uppercase tracking-widest text-white/40">
            <Target className="h-3 w-3" style={{ color: theme.primary }} />
            礼物目标
          </span>
          <span
            className="font-display text-xs font-bold tabular-nums"
            style={{ color: theme.primary }}
          >
            {pct.toFixed(0)}%
          </span>
        </div>
        <div
          className="relative h-3 w-full overflow-hidden rounded-full bg-white/10"
          style={nearTarget ? { boxShadow: `0 0 12px ${theme.primary}aa` } : undefined}
        >
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${pct}%`,
              background: `linear-gradient(90deg, ${theme.primary}, ${theme.secondary})`,
              boxShadow: `0 0 8px ${theme.secondary}88`,
            }}
          />
        </div>
        <div className="mt-1 flex items-center justify-between font-body text-[10px] text-white/45">
          <span
            className="font-display font-bold tabular-nums"
            style={{ color: theme.secondary }}
          >
            {giftCurrent.toLocaleString()} / {giftTarget.toLocaleString()} 礼物
          </span>
          {reached ? (
            <span
              className="animate-beat font-display text-[11px] font-bold"
              style={{ color: theme.accent, textShadow: `0 0 8px ${theme.accent}aa` }}
            >
              🎉 目标达成！
            </span>
          ) : (
            <span className="truncate">目标：{targetReward}</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        {QUICK_TARGETS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTarget(t.value, t.reward)}
            className="flex-1 rounded-md border border-white/10 bg-white/[0.03] py-1 font-display text-[10px] font-bold tabular-nums text-white/70 transition hover:border-white/25 hover:bg-white/5 active:scale-95"
          >
            {t.value.toLocaleString()}
          </button>
        ))}
      </div>
    </div>
  );
}
