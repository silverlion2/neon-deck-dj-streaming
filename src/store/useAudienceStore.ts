import { create } from "zustand";
import { USER_NAMES, AVATAR_COLORS } from "@/data/chatSamples";
import { pick, randInt, uid, clamp } from "@/utils/random";

export interface Viewer {
  id: string;
  name: string;
  color: string;
  level: number;
  isVip: boolean;
  isNew: boolean;
  enteredAt: number;
  contribution: number;
}

export interface LeaderEntry {
  name: string;
  color: string;
  contribution: number;
  level: number;
  isVip: boolean;
}

interface AudienceState {
  viewers: Viewer[];
  recentEntries: Viewer[];
  leaderboard: LeaderEntry[];
  welcomeQueue: Viewer[];
  spawnViewer: () => void;
  addContribution: (name: string, amount: number) => void;
  dismissWelcome: (id: string) => void;
  tickEntries: () => void;
}

const MAX_VIEWERS = 30;
const MAX_WELCOME = 3;

const makeViewer = (forceNew = false): Viewer => {
  const isNew = forceNew || Math.random() < 0.4;
  const isVip = !isNew && Math.random() < 0.25;
  return {
    id: uid("v"),
    name: pick(USER_NAMES),
    color: pick(AVATAR_COLORS),
    level: isNew ? 1 : randInt(3, 48),
    isVip,
    isNew,
    enteredAt: Date.now(),
    contribution: isVip ? randInt(50, 500) : isNew ? 0 : randInt(0, 80),
  };
};

export const useAudienceStore = create<AudienceState>((set, get) => ({
  viewers: Array.from({ length: 12 }, () => makeViewer()),
  recentEntries: [],
  leaderboard: Array.from({ length: 6 }, () => {
    const v = makeViewer();
    return {
      name: v.name,
      color: v.color,
      contribution: randInt(200, 3000),
      level: v.level,
      isVip: v.isVip,
    };
  }).sort((a, b) => b.contribution - a.contribution),
  welcomeQueue: [],

  spawnViewer: () => {
    const v = makeViewer(true);
    set((s) => {
      const viewers = [v, ...s.viewers].slice(0, MAX_VIEWERS);
      const welcome = [...s.welcomeQueue, v].slice(-MAX_WELCOME);
      return { viewers, welcomeQueue: welcome, recentEntries: [v, ...s.recentEntries].slice(0, 10) };
    });
  },

  addContribution: (name, amount) =>
    set((s) => {
      const leaderboard = [...s.leaderboard];
      const idx = leaderboard.findIndex((e) => e.name === name);
      if (idx >= 0) {
        leaderboard[idx] = { ...leaderboard[idx], contribution: leaderboard[idx].contribution + amount };
      } else {
        const v = s.viewers.find((x) => x.name === name);
        if (v) {
          leaderboard.push({
            name: v.name,
            color: v.color,
            contribution: amount,
            level: v.level,
            isVip: v.isVip,
          });
        }
      }
      leaderboard.sort((a, b) => b.contribution - a.contribution);
      return { leaderboard: leaderboard.slice(0, 8) };
    }),

  dismissWelcome: (id) =>
    set((s) => ({ welcomeQueue: s.welcomeQueue.filter((w) => w.id !== id) })),

  tickEntries: () => {
    const { welcomeQueue } = get();
    if (welcomeQueue.length === 0) return;
    const now = Date.now();
    const stale = welcomeQueue.filter((w) => now - w.enteredAt > 5000);
    if (stale.length > 0) {
      set((s) => ({
        welcomeQueue: s.welcomeQueue.filter((w) => now - w.enteredAt <= 5000),
      }));
    }
  },
}));

void clamp;
