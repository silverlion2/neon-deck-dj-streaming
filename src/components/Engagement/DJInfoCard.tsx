import { Heart, Users, Gift, BadgeCheck } from "lucide-react";
import { useEngagementStore } from "@/store/useEngagementStore";
import { DJ } from "@/data/tracks";
import { formatCount } from "@/utils/format";

export function DJInfoCard() {
  const online = useEngagementStore((s) => s.online);
  const likes = useEngagementStore((s) => s.likes);
  const giftsCount = useEngagementStore((s) => s.giftsCount);

  return (
    <div className="neon-panel noise shrink-0 overflow-hidden">
      <div className="flex items-center gap-3 p-3">
        <div className="relative">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-neon-magenta to-neon-violet font-display text-lg font-black text-white shadow-neon-magenta">
            NX
          </div>
          <BadgeCheck className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-ink-900 text-neon-cyan" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <span className="font-display text-sm font-bold text-white">{DJ.name}</span>
            <span className="rounded bg-neon-gold/15 px-1 font-display text-[9px] font-bold text-neon-gold">
              LV{DJ.level}
            </span>
          </div>
          <div className="font-body text-[11px] text-white/45">
            {DJ.tag} · 粉丝 {formatCount(DJ.followers)}
          </div>
        </div>
        <button className="rounded-lg bg-gradient-to-r from-neon-magenta to-neon-violet px-3 py-1.5 font-display text-[10px] font-bold uppercase tracking-widest text-white shadow-neon-magenta transition active:scale-95">
          关注
        </button>
      </div>
      <div className="grid grid-cols-3 border-t border-white/5">
        <MiniStat icon={<Users className="h-3 w-3" />} value={formatCount(online)} label="在线" color="cyan" />
        <MiniStat icon={<Heart className="h-3 w-3" />} value={formatCount(likes)} label="点赞" color="magenta" />
        <MiniStat icon={<Gift className="h-3 w-3" />} value={formatCount(giftsCount)} label="礼物" color="gold" />
      </div>
    </div>
  );
}

function MiniStat({
  icon,
  value,
  label,
  color,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  color: "cyan" | "magenta" | "gold";
}) {
  const colors = {
    cyan: "text-neon-cyan",
    magenta: "text-neon-magenta",
    gold: "text-neon-gold",
  };
  return (
    <div className="flex flex-col items-center gap-0.5 py-2">
      <div className={`flex items-center gap-1 ${colors[color]}`}>
        {icon}
        <span className="font-display text-sm font-bold tabular-nums">{value}</span>
      </div>
      <span className="font-body text-[9px] uppercase tracking-widest text-white/35">{label}</span>
    </div>
  );
}
