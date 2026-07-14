import { useEffect } from "react";
import { Gamepad2, Check } from "lucide-react";
import { useVibeStore } from "@/store/useVibeStore";

const WARN_COLOR = "#FFC53D";

export function ColdWarning() {
  const coldWarning = useVibeStore((s) => s.coldWarning);
  const dismissColdWarning = useVibeStore((s) => s.dismissColdWarning);

  useEffect(() => {
    if (!coldWarning) return;
    const timer = window.setTimeout(() => {
      dismissColdWarning();
    }, 10000);
    return () => window.clearTimeout(timer);
  }, [coldWarning, dismissColdWarning]);

  if (!coldWarning) return null;

  return (
    <div className="fixed left-1/2 top-16 z-50 -translate-x-1/2 px-4">
      <div
        className="relative flex w-80 items-center gap-3 overflow-hidden rounded-2xl border px-4 py-3 backdrop-blur-xl"
        style={{
          borderColor: `${WARN_COLOR}66`,
          background: "rgba(12,8,2,0.92)",
          boxShadow: `0 0 24px ${WARN_COLOR}44, inset 0 0 16px ${WARN_COLOR}1a`,
        }}
      >
        <span
          className="absolute inset-0 animate-pulse rounded-2xl"
          style={{ boxShadow: `0 0 18px ${WARN_COLOR}66` }}
        />
        <div
          className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-base"
          style={{
            background: `${WARN_COLOR}22`,
            boxShadow: `0 0 10px ${WARN_COLOR}66`,
          }}
        >
          ⚠️
        </div>
        <p
          className="relative flex-1 font-body text-xs font-semibold leading-snug"
          style={{ color: WARN_COLOR }}
        >
          气氛有点冷，试试互动游戏或暖场音效！
        </p>
        <div className="relative flex shrink-0 gap-1.5">
          <button
            onClick={dismissColdWarning}
            className="flex items-center gap-1 rounded-lg border px-2 py-1 font-display text-[9px] font-bold uppercase tracking-widest transition active:scale-95"
            style={{
              color: WARN_COLOR,
              borderColor: `${WARN_COLOR}55`,
              background: `${WARN_COLOR}1a`,
            }}
          >
            <Gamepad2 className="h-3 w-3" />
            开始游戏
          </button>
          <button
            onClick={dismissColdWarning}
            className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1 font-display text-[9px] font-bold uppercase tracking-widest text-white/70 transition active:scale-95"
          >
            <Check className="h-3 w-3" />
            知道了
          </button>
        </div>
      </div>
    </div>
  );
}
