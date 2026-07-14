import { create } from "zustand";
import { TRACKS } from "@/data/tracks";
import type { QueueItem, Track } from "@/types";
import { randInt, pick } from "@/utils/random";
import { USER_NAMES } from "@/data/chatSamples";

interface QueueState {
  queue: QueueItem[];
  hot: Track[];
  addRequest: (track: Track, by?: string) => void;
  removeRequest: (id: string) => void;
  vote: (id: string) => void;
  consumeNext: () => Track | null;
  autoRequest: () => void;
}

export const useQueueStore = create<QueueState>((set, get) => ({
  queue: [
    { track: TRACKS[1], requestedBy: pick(USER_NAMES), votes: 12 },
    { track: TRACKS[3], requestedBy: pick(USER_NAMES), votes: 7 },
    { track: TRACKS[5], requestedBy: pick(USER_NAMES), votes: 3 },
  ],
  hot: [...TRACKS].sort(() => Math.random() - 0.5).slice(0, 5),

  addRequest: (track, by = "你") =>
    set((s) => {
      if (s.queue.some((q) => q.track.id === track.id)) return s;
      return { queue: [...s.queue, { track, requestedBy: by, votes: 1 }] };
    }),
  removeRequest: (id) =>
    set((s) => ({ queue: s.queue.filter((q) => q.track.id !== id) })),
  vote: (id) =>
    set((s) => ({
      queue: s.queue.map((q) =>
        q.track.id === id ? { ...q, votes: q.votes + 1 } : q
      ),
    })),
  consumeNext: () => {
    const { queue } = get();
    if (queue.length === 0) return null;
    const [first, ...rest] = queue;
    set({ queue: rest });
    return first.track;
  },
  autoRequest: () => {
    const track = pick(TRACKS);
    const by = pick(USER_NAMES);
    get().addRequest(track, by);
    set((s) => ({
      queue: s.queue.map((q) =>
        q.track.id === track.id ? { ...q, votes: randInt(1, 8) } : q
      ),
    }));
  },
}));
