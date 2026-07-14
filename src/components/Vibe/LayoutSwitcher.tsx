import {
  LayoutGrid,
  MonitorPlay,
  MessageCircle,
  Circle,
  type LucideIcon,
} from "lucide-react";
import { LAYOUT_PRESETS } from "@/data/content";
import { useVibeStore, type LayoutId } from "@/store/useVibeStore";
import { useSettingsStore } from "@/store/useSettingsStore";

const ICON_MAP: Record<string, LucideIcon> = {
  LayoutGrid,
  MonitorPlay,
  MessageCircle,
  Circle,
};

export function LayoutSwitcher() {
  const layout = useVibeStore((s) => s.layout);
  const setLayout = useVibeStore((s) => s.setLayout);
  const theme = useSettingsStore((s) => s.theme);

  return (
    <div className="rounded-lg border border-white/10 bg-ink-900/50 p-2">
      <div className="mb-1.5 flex items-center gap-1.5">
        <LayoutGrid className="h-3.5 w-3.5" style={{ color: theme.secondary }} />
        <span className="font-display text-[10px] font-bold uppercase tracking-widest text-white/50">
          布局模式
        </span>
        <span className="ml-auto font-body text-[10px]" style={{ color: theme.primary }}>
          {LAYOUT_PRESETS.find((p) => p.id === layout)?.label}
        </span>
      </div>
      <div className="grid grid-cols-4 gap-1">
        {LAYOUT_PRESETS.map((preset) => {
          const active = preset.id === layout;
          const Icon = ICON_MAP[preset.icon] ?? Circle;
          return (
            <button
              key={preset.id}
              onClick={() => setLayout(preset.id as LayoutId)}
              className="flex flex-col items-center gap-1 rounded-md border py-2 transition active:scale-95"
              style={{
                borderColor: active ? theme.primary : "rgba(255,255,255,0.08)",
                background: active ? `${theme.primary}1a` : "rgba(255,255,255,0.03)",
                boxShadow: active
                  ? `0 0 12px ${theme.primary}55, inset 0 0 8px ${theme.primary}22`
                  : "none",
              }}
            >
              <Icon
                className="h-3.5 w-3.5"
                style={{ color: active ? theme.primary : "rgba(255,255,255,0.45)" }}
              />
              <span
                className="font-display text-[9px] font-bold tracking-wide"
                style={{ color: active ? theme.primary : "rgba(255,255,255,0.5)" }}
              >
                {preset.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
