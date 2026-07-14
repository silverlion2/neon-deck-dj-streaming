import type { Track } from "@/types";
import { TRACKS } from "@/data/tracks";

export interface PlatformTrack {
  id: string;
  title: string;
  artist: string;
  platform: PlatformId;
  duration: number;
  cover: string;
  url: string;
}

export type PlatformId = "spotify" | "apple" | "netease" | "qqmusic" | "soundcloud";

export interface PlatformDef {
  id: PlatformId;
  name: string;
  short: string;
  color: string;
  icon: string;
  connected: boolean;
  account?: string;
}

export const PLATFORMS: PlatformDef[] = [
  { id: "spotify", name: "Spotify", short: "SP", color: "#1DB954", icon: "spotify", connected: false },
  { id: "apple", name: "Apple Music", short: "AM", color: "#FA243C", icon: "apple", connected: false },
  { id: "netease", name: "网易云音乐", short: "NE", color: "#C20C0C", icon: "netease", connected: true, account: "夜行者" },
  { id: "qqmusic", name: "QQ 音乐", short: "QQ", color: "#31C27C", icon: "qq", connected: false },
  { id: "soundcloud", name: "SoundCloud", short: "SC", color: "#FF5500", icon: "soundcloud", connected: true, account: "neonkid" },
];

export interface Playlist {
  id: string;
  name: string;
  platform: PlatformId;
  cover: string;
  count: number;
  tracks: Track[];
}

export const PLAYLISTS: Playlist[] = [
  {
    id: "pl1",
    name: "Midnight Techno Set",
    platform: "netease",
    cover: TRACKS[0].cover,
    count: 4,
    tracks: [TRACKS[0], TRACKS[3], TRACKS[7], TRACKS[2]],
  },
  {
    id: "pl2",
    name: "Acid & Bass Essentials",
    platform: "soundcloud",
    cover: TRACKS[2].cover,
    count: 3,
    tracks: [TRACKS[2], TRACKS[5], TRACKS[7]],
  },
  {
    id: "pl3",
    name: "Synthwave Dreams",
    platform: "netease",
    cover: TRACKS[6].cover,
    count: 3,
    tracks: [TRACKS[6], TRACKS[1], TRACKS[3]],
  },
];

export const SEARCH_SAMPLES: PlatformTrack[] = TRACKS.flatMap((t) =>
  (["spotify", "apple", "netease", "qqmusic", "soundcloud"] as PlatformId[]).map((p) => ({
    id: `${t.id}-${p}`,
    title: t.title,
    artist: t.artist,
    platform: p,
    duration: t.duration,
    cover: t.cover,
    url: `https://${p}.example.com/${t.id}`,
  }))
);
