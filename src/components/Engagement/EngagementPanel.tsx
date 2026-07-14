import { Heart, BarChart3, Zap } from "lucide-react";
import { useEngagementStore } from "@/store/useEngagementStore";
import { NeonPanel } from "@/components/shared/NeonPanel";

const OPTION_COLORS = ["#FF2D95", "#00F0FF", "#B6FF3C", "#FFC53D"];

export function EngagementPanel() {
  const { poll, vote, spawnHeart, likes } = useEngagementStore();
  const total = poll.options.reduce((s, o) => s + o.votes, 0);

  const handleLike = (e: React.MouseEvent) => {
    const x = (e.clientX / window.innerWidth) * 100;
    spawnHeart(x);
  };

  return (
    <NeonPanel title="观众互动" accent="magenta" icon={<Zap className="h-3.5 w-3.5" />}>
      <div className="space-y-3 p-3">
        <div className="flex items-center gap-3">
          <button
            onClick={handleLike}
            className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-neon-magenta to-neon-violet shadow-neon-magenta transition active:scale-90"
          >
            <Heart className="h-6 w-6 fill-white text-white transition group-active:scale-125" />
            <span className="absolute inset-0 animate-ping rounded-full border border-neon-magenta/50" />
          </button>
          <div className="flex-1">
            <div className="font-display text-lg font-bold neon-text-magenta tabular-nums">
              {likes.toLocaleString()}
            </div>
            <div className="font-body text-[10px] uppercase tracking-widest text-white/40">
              点赞 · 长按连击
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="flex -space-x-1.5">
              {["#FF2D95", "#00F0FF", "#B6FF3C"].map((c) => (
                <span
                  key={c}
                  className="h-5 w-5 rounded-full border border-ink-900"
                  style={{ background: c }}
                />
              ))}
            </div>
            <span className="font-body text-[9px] text-white/30">气氛组在线</span>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-ink-900/50 p-3">
          <div className="mb-2 flex items-center gap-1.5">
            <BarChart3 className="h-3.5 w-3.5 text-neon-cyan" />
            <span className="font-display text-[10px] font-bold uppercase tracking-widest text-white/50">
              实时投票
            </span>
            <span className="ml-auto font-body text-[10px] text-white/35">
              {total} 票
            </span>
          </div>
          <p className="mb-2 font-body text-xs font-semibold text-white/85">
            {poll.question}
          </p>
          <div className="space-y-1.5">
            {poll.options.map((o, i) => {
              const pct = total > 0 ? (o.votes / total) * 100 : 0;
              const color = OPTION_COLORS[i % OPTION_COLORS.length];
              return (
                <button
                  key={o.id}
                  onClick={() => vote(o.id)}
                  className="group relative w-full overflow-hidden rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-left transition hover:border-white/20 active:scale-[0.99]"
                >
                  <div
                    className="absolute inset-y-0 left-0 rounded-lg transition-all"
                    style={{
                      width: `${pct}%`,
                      background: `linear-gradient(90deg, ${color}33, ${color}11)`,
                    }}
                  />
                  <div className="relative flex items-center justify-between">
                    <span className="font-body text-xs font-semibold text-white/85">
                      {o.label}
                    </span>
                    <span
                      className="font-display text-[10px] font-bold tabular-nums"
                      style={{ color }}
                    >
                      {pct.toFixed(0)}%
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </NeonPanel>
  );
}
