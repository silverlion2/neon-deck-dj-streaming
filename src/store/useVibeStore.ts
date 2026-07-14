import { create } from "zustand";
import { THEME_NIGHTS } from "@/data/content";
import type { ThemeNight } from "@/data/content";
import { useSettingsStore } from "@/store/useSettingsStore";
import { LAYOUT_PRESETS } from "@/data/content";
import type { LayoutPreset } from "@/data/content";

export type LayoutId = "full" | "stage" | "chat" | "minimal";

interface VibeState {
  activeNight: ThemeNight | null;
  layout: LayoutId;
  coldWarning: boolean;
  lastHeatLevel: number;
  applyNight: (night: ThemeNight) => void;
  clearNight: () => void;
  setLayout: (id: LayoutId) => void;
  updateHeatLevel: (level: number) => void;
  dismissColdWarning: () => void;
}

export const useVibeStore = create<VibeState>((set, get) => ({
  activeNight: null,
  layout: "full",
  coldWarning: false,
  lastHeatLevel: 1,

  applyNight: (night) => {
    const settings = useSettingsStore.getState();
    settings.setTheme(night.themeId);
    settings.setPreset(night.presetId);
    set({ activeNight: night });
  },
  clearNight: () => set({ activeNight: null }),

  setLayout: (id) => set({ layout: id }),

  updateHeatLevel: (level) => {
    const prev = get().lastHeatLevel;
    if (level < 0.3 && prev >= 0.3) {
      set({ coldWarning: true, lastHeatLevel: level });
    } else {
      set({ lastHeatLevel: level, coldWarning: level < 0.3 ? get().coldWarning : false });
    }
  },
  dismissColdWarning: () => set({ coldWarning: false }),
}));

export { THEME_NIGHTS, LAYOUT_PRESETS };
export type { ThemeNight, LayoutPreset };
