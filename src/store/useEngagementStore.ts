import { create } from "zustand";
import { randInt, uid } from "@/utils/random";

export interface FlyingHeart {
  id: string;
  x: number;
  emoji: string;
  color: string;
}

interface EngagementState {
  online: number;
  likes: number;
  giftsCount: number;
  poll: {
    id: string;
    question: string;
    options: { id: string; label: string; votes: number }[];
  };
  hearts: FlyingHeart[];
  like: () => void;
  spawnHeart: (x?: number) => void;
  clearHeart: (id: string) => void;
  registerGift: () => void;
  fluctuateOnline: () => void;
  vote: (optionId: string) => void;
  autoVote: () => void;
}

const baseOnline = 8420;

export const useEngagementStore = create<EngagementState>((set, get) => ({
  online: baseOnline,
  likes: 36210,
  giftsCount: 1284,
  poll: {
    id: "p1",
    question: "下一首想来什么风格？",
    options: [
      { id: "a", label: "Techno 暴击", votes: 412 },
      { id: "b", label: "Trance 升空", votes: 287 },
      { id: "c", label: "Synthwave 复古", votes: 533 },
      { id: "d", label: "DnB 加速", votes: 198 },
    ],
  },
  hearts: [],

  like: () => set((s) => ({ likes: s.likes + 1 })),

  spawnHeart: (x = 50) => {
    const emojis = ["❤️", "💜", "💙", "💚", "🧡"];
    const colors = ["#FF2D95", "#9D4EDD", "#00F0FF", "#B6FF3C", "#FFC53D"];
    const idx = randInt(0, emojis.length - 1);
    const heart: FlyingHeart = {
      id: uid("h"),
      x: x + randInt(-12, 12),
      emoji: emojis[idx],
      color: colors[idx],
    };
    set((s) => ({ likes: s.likes + 1, hearts: [...s.hearts, heart] }));
    setTimeout(() => get().clearHeart(heart.id), 2200);
  },
  clearHeart: (id) =>
    set((s) => ({ hearts: s.hearts.filter((h) => h.id !== id) })),
  registerGift: () => set((s) => ({ giftsCount: s.giftsCount + 1 })),
  fluctuateOnline: () =>
    set((s) => {
      const delta = randInt(-24, 32);
      const next = Math.max(1200, s.online + delta);
      return { online: next };
    }),
  vote: (optionId) =>
    set((s) => ({
      poll: {
        ...s.poll,
        options: s.poll.options.map((o) =>
          o.id === optionId ? { ...o, votes: o.votes + 1 } : o
        ),
      },
    })),
  autoVote: () => {
    const { poll } = get();
    const weighted = poll.options.flatMap((o) =>
      Array.from({ length: Math.max(1, Math.round(o.votes / 120)) }, () => o.id)
    );
    get().vote(pick(weighted));
  },
}));

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
