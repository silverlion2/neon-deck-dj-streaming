import { create } from "zustand";
import { audioEngine } from "@/audio/AudioEngine";

export interface LoopClip {
  id: string;
  name: string;
  padIndex: number;
  bars: number;
  recording: boolean;
}

interface LoopState {
  loops: LoopClip[];
  isRecording: boolean;
  recordPad: number | null;
  keyboardMapping: Record<string, number>;
  startRecord: (padIndex: number) => void;
  stopRecord: () => void;
  triggerPad: (padIndex: number) => void;
  setKeyMap: (key: string, padIndex: number) => void;
}

const DEFAULT_KEYMAP: Record<string, number> = {
  "1": 0,
  "2": 1,
  "3": 2,
  "4": 3,
  q: 4,
  w: 5,
  e: 6,
  r: 7,
};

export const useLoopStore = create<LoopState>((set, get) => ({
  loops: [],
  isRecording: false,
  recordPad: null,
  keyboardMapping: DEFAULT_KEYMAP,

  startRecord: (padIndex) => {
    set({ isRecording: true, recordPad: padIndex });
    setTimeout(() => {
      if (get().recordPad === padIndex) {
        const clip: LoopClip = {
          id: `loop_${Date.now()}`,
          name: `Loop ${get().loops.length + 1}`,
          padIndex,
          bars: 4,
          recording: false,
        };
        set((s) => ({ loops: [clip, ...s.loops].slice(0, 6), isRecording: false, recordPad: null }));
      }
    }, 2000);
  },
  stopRecord: () => set({ isRecording: false, recordPad: null }),
  triggerPad: (padIndex) => {
    audioEngine.ensure();
    audioEngine.playPad(padIndex);
  },
  setKeyMap: (key, padIndex) =>
    set((s) => ({ keyboardMapping: { ...s.keyboardMapping, [key]: padIndex } })),
}));
