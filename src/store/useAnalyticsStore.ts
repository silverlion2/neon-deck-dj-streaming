import { create } from "zustand";
import type { Track } from "@/types";

export interface HeatPoint {
  t: number;
  chat: number;
  gift: number;
  like: number;
}

export interface TrackStat {
  trackId: string;
  title: string;
  plays: number;
  avgHeat: number;
  gifts: number;
  reactions: "fire" | "warm" | "cool";
}

interface AnalyticsState {
  startTime: number;
  heatHistory: HeatPoint[];
  peakOnline: number;
  trackStats: Record<string, TrackStat>;
  playedTracks: { trackId: string; title: string; startedAt: number }[];
  recordHeat: (chat: number, gift: number, like: number) => void;
  setPeak: (n: number) => void;
  recordTrackStart: (track: Track) => void;
  recordGiftForTrack: (trackId: string, title: string) => void;
  snapshot: () => AnalyticsSnapshot;
}

export interface AnalyticsSnapshot {
  duration: number;
  peakOnline: number;
  avgOnline: number;
  totalChat: number;
  totalGift: number;
  totalLike: number;
  topTracks: TrackStat[];
  heatBuckets: number[];
}

const MAX_HEAT = 120;

export const useAnalyticsStore = create<AnalyticsState>((set, get) => ({
  startTime: Date.now(),
  heatHistory: [],
  peakOnline: 8420,
  trackStats: {},
  playedTracks: [],

  recordHeat: (chat, gift, like) =>
    set((s) => ({
      heatHistory: [
        ...s.heatHistory.slice(-(MAX_HEAT - 1)),
        { t: Date.now(), chat, gift, like },
      ],
    })),

  setPeak: (n) => set((s) => ({ peakOnline: Math.max(s.peakOnline, n) })),

  recordTrackStart: (track) =>
    set((s) => {
      const stat = s.trackStats[track.id] ?? {
        trackId: track.id,
        title: track.title,
        plays: 0,
        avgHeat: 0,
        gifts: 0,
        reactions: "cool",
      };
      return {
        trackStats: { ...s.trackStats, [track.id]: { ...stat, plays: stat.plays + 1 } },
        playedTracks: [...s.playedTracks, { trackId: track.id, title: track.title, startedAt: Date.now() }].slice(-20),
      };
    }),

  recordGiftForTrack: (trackId, title) =>
    set((s) => {
      const stat = s.trackStats[trackId] ?? {
        trackId,
        title,
        plays: 0,
        avgHeat: 0,
        gifts: 0,
        reactions: "cool",
      };
      const gifts = stat.gifts + 1;
      const reactions = gifts > 8 ? "fire" : gifts > 3 ? "warm" : "cool";
      return { trackStats: { ...s.trackStats, [trackId]: { ...stat, gifts, reactions } } };
    }),

  snapshot: () => {
    const s = get();
    const duration = (Date.now() - s.startTime) / 1000;
    const totalChat = s.heatHistory.reduce((a, h) => a + h.chat, 0);
    const totalGift = s.heatHistory.reduce((a, h) => a + h.gift, 0);
    const totalLike = s.heatHistory.reduce((a, h) => a + h.like, 0);
    const avgOnline = 8420;
    const topTracks = Object.values(s.trackStats)
      .sort((a, b) => b.gifts * 10 + b.plays - (a.gifts * 10 + a.plays))
      .slice(0, 5);
    const heatBuckets = s.heatHistory.map((h) => h.chat + h.gift * 3 + h.like * 0.1);
    return { duration, peakOnline: s.peakOnline, avgOnline, totalChat, totalGift, totalLike, topTracks, heatBuckets };
  },
}));
