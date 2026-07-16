import { create } from "zustand";
import { PRESETS } from "@/audio/presets";
import type { PresetConfig, PresetId } from "@/audio/presets";
import { audioEngine } from "@/audio/AudioEngine";

export type VisualMode = "ring" | "wave" | "particles";

export interface ThemeTokens {
  id: string;
  name: string;
  label: string;
  bg: string;
  bg2: string;
  primary: string;
  secondary: string;
  accent: string;
  glow1: string;
  glow2: string;
  glow3: string;
}

export const THEMES: ThemeTokens[] = [
  {
    id: "neon",
    name: "霓虹紫青",
    label: "Neon",
    bg: "#05050C",
    bg2: "#0A0A18",
    primary: "#FF2D95",
    secondary: "#00F0FF",
    accent: "#B6FF3C",
    glow1: "rgba(255,45,149,0.18)",
    glow2: "rgba(0,240,255,0.16)",
    glow3: "rgba(157,78,221,0.14)",
  },
  {
    id: "aurora",
    name: "极光翠绿",
    label: "Aurora",
    bg: "#03100C",
    bg2: "#061A14",
    primary: "#00FFA3",
    secondary: "#3CF0FF",
    accent: "#B6FF3C",
    glow1: "rgba(0,255,163,0.18)",
    glow2: "rgba(60,240,255,0.16)",
    glow3: "rgba(182,255,60,0.12)",
  },
  {
    id: "lava",
    name: "熔岩暖橙",
    label: "Lava",
    bg: "#0C0503",
    bg2: "#180A06",
    primary: "#FF6B1A",
    secondary: "#FFC53D",
    accent: "#FF2D6B",
    glow1: "rgba(255,107,26,0.2)",
    glow2: "rgba(255,197,61,0.16)",
    glow3: "rgba(255,45,107,0.14)",
  },
  {
    id: "abyss",
    name: "深海蓝",
    label: "Abyss",
    bg: "#02060F",
    bg2: "#04101F",
    primary: "#2D7BFF",
    secondary: "#00E5FF",
    accent: "#9D4EDD",
    glow1: "rgba(45,123,255,0.2)",
    glow2: "rgba(0,229,255,0.16)",
    glow3: "rgba(157,78,221,0.14)",
  },
];

interface SettingsState {
  presetId: PresetId;
  preset: PresetConfig;
  visualMode: VisualMode;
  themeId: string;
  theme: ThemeTokens;
  muted: boolean;
  autoDj: boolean;
  volume: number;
  setPreset: (id: PresetId) => void;
  setVisualMode: (m: VisualMode) => void;
  setTheme: (id: string) => void;
  toggleMute: () => void;
  toggleAutoDj: () => void;
  setVolume: (v: number) => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  presetId: "TECHNO",
  preset: PRESETS[0],
  visualMode: "ring",
  themeId: "neon",
  theme: THEMES[0],
  muted: false,
  autoDj: true,
  volume: 78,

  setPreset: (id) => {
    const preset = PRESETS.find((p) => p.id === id) ?? PRESETS[0];
    audioEngine.setPreset(preset);
    set({ presetId: id, preset });
  },
  setVisualMode: (m) => set({ visualMode: m }),
  setTheme: (id) => {
    const theme = THEMES.find((t) => t.id === id) ?? THEMES[0];
    applyTheme(theme);
    set({ themeId: id, theme });
  },
  toggleMute: () => {
    const next = !get().muted;
    audioEngine.setMuted(next);
    set({ muted: next });
  },
  toggleAutoDj: () => set((s) => ({ autoDj: !s.autoDj })),
  setVolume: (v) => {
    audioEngine.setVolume(v / 100);
    set({ volume: v });
  },
}));

export function applyTheme(theme: ThemeTokens) {
  const root = document.documentElement;
  root.style.setProperty("--c-bg", theme.bg);
  root.style.setProperty("--c-bg2", theme.bg2);
  root.style.setProperty("--c-primary", theme.primary);
  root.style.setProperty("--c-secondary", theme.secondary);
  root.style.setProperty("--c-accent", theme.accent);
  root.style.setProperty("--c-glow1", theme.glow1);
  root.style.setProperty("--c-glow2", theme.glow2);
  root.style.setProperty("--c-glow3", theme.glow3);
}

audioEngine.setPreset(PRESETS[0]);
