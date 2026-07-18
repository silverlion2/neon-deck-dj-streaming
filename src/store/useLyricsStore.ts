import { create } from "zustand";
import { parseLrc, findCurrentLine, type LrcLine } from "@/utils/lrcParser";

interface LyricsState {
  lines: LrcLine[];
  currentIndex: number;
  lrcFileName: string | null;
  visible: boolean;
  loadLrc: (content: string, fileName: string) => void;
  clearLrc: () => void;
  updateCurrentTime: (time: number) => void;
  toggleVisible: () => void;
}

export const useLyricsStore = create<LyricsState>((set, get) => ({
  lines: [],
  currentIndex: -1,
  lrcFileName: null,
  visible: false,

  loadLrc: (content, fileName) => {
    const lines = parseLrc(content);
    set({ lines, lrcFileName: fileName, currentIndex: -1, visible: true });
  },

  clearLrc: () => {
    set({ lines: [], lrcFileName: null, currentIndex: -1 });
  },

  updateCurrentTime: (time) => {
    const { lines, currentIndex } = get();
    const next = findCurrentLine(lines, time);
    if (next !== currentIndex) {
      set({ currentIndex: next });
    }
  },

  toggleVisible: () => {
    set((s) => ({ visible: !s.visible }));
  },
}));
