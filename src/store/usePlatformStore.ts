import { create } from "zustand";
import { PLATFORMS, PLAYLISTS, SEARCH_SAMPLES } from "@/data/platforms";
import type { PlatformDef, PlatformId, PlatformTrack } from "@/data/platforms";
import { useQueueStore } from "@/store/useQueueStore";
import type { Track } from "@/types";

interface PlatformState {
  platforms: PlatformDef[];
  playlists: typeof PLAYLISTS;
  searchResults: PlatformTrack[];
  query: string;
  searching: boolean;
  activePlatform: PlatformId | "all";
  connect: (id: PlatformId) => void;
  disconnect: (id: PlatformId) => void;
  setQuery: (q: string) => void;
  setActivePlatform: (id: PlatformId | "all") => void;
  search: () => void;
  importToQueue: (track: Track, from: string) => void;
  importPlaylist: (playlistId: string) => void;
}

export const usePlatformStore = create<PlatformState>((set, get) => ({
  platforms: PLATFORMS,
  playlists: PLAYLISTS,
  searchResults: [],
  query: "",
  searching: false,
  activePlatform: "all",

  connect: (id) =>
    set((s) => ({
      platforms: s.platforms.map((p) =>
        p.id === id ? { ...p, connected: true, account: p.account ?? "demo_user" } : p
      ),
    })),
  disconnect: (id) =>
    set((s) => ({
      platforms: s.platforms.map((p) =>
        p.id === id ? { ...p, connected: false, account: undefined } : p
      ),
    })),
  setQuery: (q) => set({ query: q }),
  setActivePlatform: (id) => set({ activePlatform: id }),

  search: () => {
    const { query, activePlatform } = get();
    set({ searching: true });
    setTimeout(() => {
      const q = query.trim().toLowerCase();
      const results = SEARCH_SAMPLES.filter((t) => {
        const matchQ =
          !q || t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q);
        const matchP = activePlatform === "all" || t.platform === activePlatform;
        return matchQ && matchP;
      }).slice(0, 12);
      set({ searchResults: results, searching: false });
    }, 500);
  },

  importToQueue: (track, from) => {
    useQueueStore.getState().addRequest(track, from);
  },
  importPlaylist: (playlistId) => {
    const pl = get().playlists.find((p) => p.id === playlistId);
    if (!pl) return;
    pl.tracks.forEach((t) => useQueueStore.getState().addRequest(t, `歌单:${pl.name}`));
  },
}));
