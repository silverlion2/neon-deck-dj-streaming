import { Crown } from "lucide-react";
import { useAudienceStore } from "@/store/useAudienceStore";

function levelBorder(level: number) {
  if (level >= 41) return "border-neon-gold";
  if (level >= 26) return "border-neon-magenta";
  if (level >= 11) return "border-neon-cyan";
  return "border-white/60";
}

export function ViewerBadges() {
  const viewers = useAudienceStore((s) => s.viewers);
  const list = viewers.slice(0, 12);

  return (
    <div
      className="scrollbar-thin flex items-center gap-1.5 overflow-x-auto"
      style={{ height: 36 }}
    >
      {list.map((v) => (
        <div
          key={v.id}
          className="relative shrink-0"
          title={`${v.name} · LV${v.level}`}
        >
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-full border-2 font-display text-[10px] font-bold text-ink-900 ${levelBorder(v.level)}`}
            style={{ background: v.color, boxShadow: `0 0 6px ${v.color}66` }}
          >
            {v.name.slice(0, 1)}
          </div>
          {v.isVip && (
            <span className="absolute -right-1 -top-1 flex h-3 w-3 items-center justify-center rounded-full bg-ink-900">
              <Crown className="h-2.5 w-2.5 text-neon-gold" />
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
