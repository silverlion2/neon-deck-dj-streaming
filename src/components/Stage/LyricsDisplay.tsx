import { getLyrics } from "@/data/content";
import { useLiveStore } from "@/store/useLiveStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { cn } from "@/lib/utils";

const LINE_SPACING = 46;

export function LyricsDisplay() {
  const currentTrack = useLiveStore((s) => s.currentTrack);
  const progress = useLiveStore((s) => s.progress);
  const theme = useSettingsStore((s) => s.theme);

  const lines = getLyrics(currentTrack.id);

  let currentIndex = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].t <= progress) currentIndex = i;
    else break;
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-36 z-[5] flex justify-center">
      <div className="relative flex h-[140px] w-full max-w-2xl flex-col items-center justify-center px-6">
        {lines.map((line, i) => {
          const offset = i - currentIndex;
          const isActive = offset === 0;
          const isNear = Math.abs(offset) === 1;
          const visible = Math.abs(offset) <= 1;
          const glow = isActive && line.highlight;

          return (
            <div
              key={`${line.t}-${i}`}
              className={cn(
                "absolute flex w-full items-center justify-center px-4 text-center transition-all duration-500 ease-out",
                !visible && "pointer-events-none",
              )}
              style={{
                transform: `translateY(${offset * LINE_SPACING}px) scale(${isActive ? 1 : 0.9})`,
                opacity: isActive ? 1 : isNear ? 0.32 : 0,
                filter: isActive ? "none" : "blur(1px)",
              }}
            >
              <span
                className={cn(
                  "leading-tight",
                  line.highlight
                    ? cn("font-display font-bold", isActive ? "text-2xl" : "text-lg")
                    : cn("font-body font-medium tracking-[0.2em]", isActive ? "text-base" : "text-sm"),
                )}
                style={
                  glow
                    ? {
                        color: theme.primary,
                        textShadow: `0 0 14px ${theme.primary}CC, 0 0 30px ${theme.primary}66`,
                      }
                    : line.highlight && isActive
                      ? { color: "rgba(255,255,255,0.85)" }
                      : { color: "rgba(255,255,255,0.32)" }
                }
              >
                {line.text}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
