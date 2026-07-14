import { create } from "zustand";
import { uid, randInt } from "@/utils/random";

export interface Highlight {
  id: string;
  trackTitle: string;
  note: string;
  timestamp: number;
  trackProgress: number;
  heat: number;
}

interface MonetizationState {
  giftTarget: number;
  giftCurrent: number;
  targetReward: string;
  highlights: Highlight[];
  paidQueueCount: number;
  addGift: (amount: number) => void;
  setTarget: (target: number, reward: string) => void;
  markHighlight: (trackTitle: string, progress: number, heat: number, note?: string) => void;
  removeHighlight: (id: string) => void;
  recordPaidRequest: () => void;
}

const QUICK_NOTES = ["🔥 高能段落", "💥 Drop 炸场", "🎵 旋律高潮", "⚡ 节奏爆发", "✨ 氛围顶点"];

export const useMonetizationStore = create<MonetizationState>((set) => ({
  giftTarget: 5000,
  giftCurrent: 2340,
  targetReward: "解锁 30 分钟特别 Deep Set",
  highlights: [],
  paidQueueCount: 0,

  addGift: (amount) =>
    set((s) => ({ giftCurrent: Math.min(s.giftTarget, s.giftCurrent + amount) })),

  setTarget: (target, reward) => set({ giftTarget: target, giftCurrent: 0, targetReward: reward }),

  markHighlight: (trackTitle, progress, heat, note) =>
    set((s) => ({
      highlights: [
        {
          id: uid("hl"),
          trackTitle,
          note: note ?? pick(QUICK_NOTES),
          timestamp: Date.now(),
          trackProgress: progress,
          heat,
        },
        ...s.highlights,
      ].slice(0, 20),
    })),

  removeHighlight: (id) =>
    set((s) => ({ highlights: s.highlights.filter((h) => h.id !== id) })),

  recordPaidRequest: () => set((s) => ({ paidQueueCount: s.paidQueueCount + 1 })),
}));

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
void randInt;
