export type PresetId = "TECHNO" | "ACID" | "TRAP" | "SYNTHWAVE";

export interface PresetConfig {
  id: PresetId;
  name: string;
  label: string;
  color: string;
  kick: { freqStart: number; freqEnd: number; decay: number; gain: number; click: boolean };
  snare: { tone: number; decay: number; noiseGain: number; toneGain: number };
  hat: { freq: number; decay: number; gain: number };
  clap: { decay: number; gain: number };
  bass: { type: OscillatorType; freq: number; resonance: number; decay: number };
  fx: { sweepFrom: number; sweepTo: number; decay: number };
}

export const PRESETS: PresetConfig[] = [
  {
    id: "TECHNO",
    name: "Techno",
    label: "工业四四拍",
    color: "#FF2D95",
    kick: { freqStart: 150, freqEnd: 45, decay: 0.45, gain: 1.0, click: true },
    snare: { tone: 200, decay: 0.18, noiseGain: 0.5, toneGain: 0.35 },
    hat: { freq: 8000, decay: 0.05, gain: 0.35 },
    clap: { decay: 0.16, gain: 0.5 },
    bass: { type: "sawtooth", freq: 55, resonance: 6, decay: 0.3 },
    fx: { sweepFrom: 200, sweepTo: 6000, decay: 0.6 },
  },
  {
    id: "ACID",
    name: "Acid",
    label: "303 共振贝斯",
    color: "#B6FF3C",
    kick: { freqStart: 170, freqEnd: 50, decay: 0.4, gain: 0.95, click: true },
    snare: { tone: 240, decay: 0.2, noiseGain: 0.45, toneGain: 0.3 },
    hat: { freq: 9500, decay: 0.04, gain: 0.3 },
    clap: { decay: 0.14, gain: 0.45 },
    bass: { type: "sawtooth", freq: 82, resonance: 14, decay: 0.5 },
    fx: { sweepFrom: 120, sweepTo: 8000, decay: 0.8 },
  },
  {
    id: "TRAP",
    name: "Trap",
    label: "808 重低音",
    color: "#9D4EDD",
    kick: { freqStart: 160, freqEnd: 38, decay: 0.7, gain: 1.1, click: false },
    snare: { tone: 180, decay: 0.16, noiseGain: 0.55, toneGain: 0.25 },
    hat: { freq: 10000, decay: 0.03, gain: 0.28 },
    clap: { decay: 0.2, gain: 0.5 },
    bass: { type: "sine", freq: 41, resonance: 4, decay: 0.9 },
    fx: { sweepFrom: 300, sweepTo: 4000, decay: 0.5 },
  },
  {
    id: "SYNTHWAVE",
    name: "Synthwave",
    label: "复古模拟",
    color: "#00F0FF",
    kick: { freqStart: 140, freqEnd: 48, decay: 0.5, gain: 0.9, click: true },
    snare: { tone: 220, decay: 0.22, noiseGain: 0.4, toneGain: 0.4 },
    hat: { freq: 7000, decay: 0.06, gain: 0.32 },
    clap: { decay: 0.18, gain: 0.48 },
    bass: { type: "square", freq: 65, resonance: 5, decay: 0.4 },
    fx: { sweepFrom: 150, sweepTo: 5000, decay: 0.7 },
  },
];
