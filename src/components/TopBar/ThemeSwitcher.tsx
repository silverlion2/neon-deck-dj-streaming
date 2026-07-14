import { useState } from "react";
import { Palette, Check } from "lucide-react";
import { useSettingsStore, THEMES } from "@/store/useSettingsStore";

export function ThemeSwitcher() {
  const { themeId, setTheme } = useSettingsStore();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-8 items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2 transition hover:border-white/30 active:scale-95"
      >
        <Palette className="h-3.5 w-3.5 text-white/70" />
        <span className="h-3 w-3 rounded-full" style={{ background: "var(--c-primary)" }} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-1 w-44 rounded-xl border border-white/10 bg-ink-800/95 p-2 shadow-panel backdrop-blur-xl">
            <div className="mb-1.5 flex items-center gap-1.5 px-1">
              <Palette className="h-3 w-3 text-white/40" />
              <span className="font-display text-[9px] font-bold uppercase tracking-widest text-white/40">
                主题配色
              </span>
            </div>
            {THEMES.map((t) => {
              const active = t.id === themeId;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setTheme(t.id);
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 transition hover:bg-white/5"
                  style={{ background: active ? `${t.primary}1a` : "transparent" }}
                >
                  <span className="flex gap-0.5">
                    <span className="h-4 w-2 rounded-sm" style={{ background: t.primary }} />
                    <span className="h-4 w-2 rounded-sm" style={{ background: t.secondary }} />
                    <span className="h-4 w-2 rounded-sm" style={{ background: t.accent }} />
                  </span>
                  <span className="flex-1 text-left font-body text-xs text-white/80">{t.name}</span>
                  {active && <Check className="h-3.5 w-3.5" style={{ color: t.primary }} />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
