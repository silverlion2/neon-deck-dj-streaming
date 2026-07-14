import { create } from "zustand";
import { LIVE_PLATFORMS } from "@/data/livePlatforms";
import type { LivePlatform, PlatformTarget } from "@/data/livePlatforms";

interface StreamState {
  activePlatform: PlatformTarget;
  platform: LivePlatform;
  isExportMode: boolean;
  showSafeArea: boolean;
  exportScale: number;
  setPlatform: (id: PlatformTarget) => void;
  toggleExport: () => void;
  toggleSafeArea: () => void;
}

export const useStreamStore = create<StreamState>((set) => ({
  activePlatform: "douyin",
  platform: LIVE_PLATFORMS[0],
  isExportMode: false,
  showSafeArea: true,
  exportScale: 1,

  setPlatform: (id) => {
    const platform = LIVE_PLATFORMS.find((p) => p.id === id) ?? LIVE_PLATFORMS[0];
    set({ activePlatform: id, platform });
  },
  toggleExport: () => set((s) => ({ isExportMode: !s.isExportMode })),
  toggleSafeArea: () => set((s) => ({ showSafeArea: !s.showSafeArea })),
}));
