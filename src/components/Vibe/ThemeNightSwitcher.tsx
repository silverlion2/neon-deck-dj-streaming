import { Moon, Check, X } from "lucide-react";
import { NeonPanel } from "@/components/shared/NeonPanel";
import { THEME_NIGHTS } from "@/data/content";
import { useVibeStore } from "@/store/useVibeStore";

export function ThemeNightSwitcher() {
  const activeNight = useVibeStore((s) => s.activeNight);
  const applyNight = useVibeStore((s) => s.applyNight);
  const clearNight = useVibeStore((s) => s.clearNight);

  return (
    <NeonPanel
      title="主题夜"
      accent="magenta"
      icon={<Moon className="h-3.5 w-3.5" />}
      action={
        <button
          onClick={clearNight}
          disabled={!activeNight}
          className="flex items-center gap-1 rounded-md border border-white/10 px-2 py-1 font-display text-[9px] font-bold uppercase tracking-widest transition active:scale-95 disabled:opacity-30"
          style={{
            color: activeNight ? "#FF2D95" : "rgba(255,255,255,0.4)",
            borderColor: activeNight ? "rgba(255,45,149,0.4)" : "rgba(255,255,255,0.1)",
            background: activeNight ? "rgba(255,45,149,0.1)" : "rgba(255,255,255,0.03)",
          }}
        >
          <X className="h-3 w-3" />
          清除
        </button>
      }
    >
      <div className="grid grid-cols-2 gap-2 p-3">
        {THEME_NIGHTS.map((night) => {
          const active = activeNight?.id === night.id;
          return (
            <button
              key={night.id}
              onClick={() => applyNight(night)}
              className="group relative overflow-hidden rounded-xl border p-2.5 text-left transition active:scale-[0.98]"
              style={{
                borderColor: active ? night.color : "rgba(255,255,255,0.08)",
                background: active ? `${night.color}1a` : "rgba(255,255,255,0.03)",
                boxShadow: active
                  ? `0 0 16px ${night.color}66, inset 0 0 12px ${night.color}22`
                  : "none",
              }}
            >
              <span
                className="absolute left-0 top-0 h-full w-1 transition-all"
                style={{
                  background: night.color,
                  boxShadow: active ? `0 0 10px ${night.color}` : "none",
                }}
              />
              <div className="flex items-start justify-between pl-1.5">
                <div className="min-w-0">
                  <div
                    className="truncate font-display text-xs font-bold tracking-wide"
                    style={{ color: active ? night.color : "rgba(255,255,255,0.85)" }}
                  >
                    {night.name}
                  </div>
                  <div className="mt-0.5 font-body text-[10px] text-white/40">
                    {night.label}
                  </div>
                </div>
                {active && (
                  <span
                    className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full"
                    style={{
                      background: night.color,
                      boxShadow: `0 0 8px ${night.color}`,
                    }}
                  >
                    <Check className="h-2.5 w-2.5 text-ink-900" />
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </NeonPanel>
  );
}
