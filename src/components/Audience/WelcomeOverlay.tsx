import { useEffect, useRef } from "react";
import { Crown } from "lucide-react";
import { useAudienceStore } from "@/store/useAudienceStore";
import type { Viewer } from "@/store/useAudienceStore";

export function WelcomeOverlay() {
  const welcomeQueue = useAudienceStore((s) => s.welcomeQueue);
  const dismissWelcome = useAudienceStore((s) => s.dismissWelcome);
  const scheduled = useRef<Set<string>>(new Set());

  useEffect(() => {
    welcomeQueue.forEach((v) => {
      if (scheduled.current.has(v.id)) return;
      scheduled.current.add(v.id);
      const remaining = Math.max(0, 5000 - (Date.now() - v.enteredAt));
      window.setTimeout(() => {
        dismissWelcome(v.id);
        scheduled.current.delete(v.id);
      }, remaining);
    });
  }, [welcomeQueue, dismissWelcome]);

  return (
    <div className="pointer-events-none fixed bottom-4 left-4 z-50 flex w-72 flex-col gap-2">
      {welcomeQueue.map((v) => (
        <WelcomeBanner key={v.id} viewer={v} />
      ))}
    </div>
  );
}

function WelcomeBanner({ viewer }: { viewer: Viewer }) {
  const { name, color, level, isVip, isNew } = viewer;
  return (
    <div
      className={`animate-slide-in flex items-center gap-2.5 rounded-xl border px-3 py-2 backdrop-blur-md ${
        isVip ? "border-neon-gold/60 bg-ink-900/85" : "border-white/10 bg-ink-900/70"
      }`}
      style={{
        boxShadow: isVip
          ? `inset 3px 0 0 ${color}, 0 0 14px rgba(255,197,61,0.35)`
          : `inset 3px 0 0 ${color}, 0 0 10px ${color}33`,
      }}
    >
      <div className="relative shrink-0">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-full font-display text-sm font-bold text-ink-900"
          style={{ background: color, boxShadow: `0 0 8px ${color}` }}
        >
          {name.slice(0, 1)}
        </div>
        {isVip && (
          <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-ink-900">
            <Crown className="h-3 w-3 text-neon-gold" />
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-body text-xs text-white/85">
          欢迎 <span className="font-semibold" style={{ color }}>{name}</span> 进入直播间
        </p>
        <div className="mt-0.5 flex items-center gap-1">
          {isNew && (
            <span className="rounded bg-neon-lime/15 px-1 font-display text-[8px] font-bold uppercase tracking-wider text-neon-lime">
              新人
            </span>
          )}
          {level >= 26 && (
            <span
              className="rounded px-1 font-display text-[8px] font-bold tracking-wider"
              style={{
                color: level >= 41 ? "#FFC53D" : "#FF2D95",
                background: level >= 41 ? "rgba(255,197,61,0.15)" : "rgba(255,45,149,0.15)",
              }}
            >
              LV{level}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
