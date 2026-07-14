import { create } from "zustand";
import { LIVE_PLATFORMS } from "@/data/livePlatforms";
import type { LivePlatform, PlatformTarget, ConnState } from "@/data/livePlatforms";
import { useChatStore } from "@/store/useChatStore";
import { useEngagementStore } from "@/store/useEngagementStore";

export interface PlatformConn {
  platformId: PlatformTarget;
  connState: ConnState;
  account: string | null;
  token: string | null;
  roomId: string | null;
  streamKey: string;
  isLive: boolean;
  liveDuration: number;
  viewerCount: number;
  danmakuSync: boolean;
  giftSync: boolean;
  dataSync: boolean;
  blockedCount: number;
  connectedAt: number | null;
}

interface IntegrationState {
  connections: Record<PlatformTarget, PlatformConn>;
  activePlatform: PlatformTarget;
  platform: LivePlatform;
  isExportMode: boolean;
  authorize: (id: PlatformTarget) => void;
  disconnect: (id: PlatformTarget) => void;
  goLive: (id: PlatformTarget) => void;
  stopLive: (id: PlatformTarget) => void;
  setStreamKey: (id: PlatformTarget, key: string) => void;
  toggleDanmakuSync: (id: PlatformTarget) => void;
  toggleGiftSync: (id: PlatformTarget) => void;
  toggleDataSync: (id: PlatformTarget) => void;
  setPlatform: (id: PlatformTarget) => void;
  toggleExport: () => void;
  tickLive: () => void;
  filterDanmaku: (text: string) => { blocked: boolean; reason: string };
}

const initialConn = (id: PlatformTarget): PlatformConn => ({
  platformId: id,
  connState: "disconnected",
  account: null,
  token: null,
  roomId: null,
  streamKey: "",
  isLive: false,
  liveDuration: 0,
  viewerCount: 0,
  danmakuSync: false,
  giftSync: false,
  dataSync: false,
  blockedCount: 0,
  connectedAt: null,
});

const initialConnections = () => {
  const conns = {} as Record<PlatformTarget, PlatformConn>;
  LIVE_PLATFORMS.forEach((p) => {
    conns[p.id] = initialConn(p.id);
  });
  return conns;
};

export const useIntegrationStore = create<IntegrationState>((set, get) => ({
  connections: initialConnections(),
  activePlatform: "douyin",
  platform: LIVE_PLATFORMS[0],
  isExportMode: false,

  authorize: (id) => {
    set((s) => ({
      connections: {
        ...s.connections,
        [id]: { ...s.connections[id], connState: "authorizing" },
      },
    }));
    setTimeout(() => {
      const platform = LIVE_PLATFORMS.find((p) => p.id === id);
      set((s) => ({
        connections: {
          ...s.connections,
          [id]: {
            ...s.connections[id],
            connState: "connected",
            account: `demo_${id}_user`,
            token: `tok_${Date.now().toString(36)}`,
            roomId: `${Math.floor(Math.random() * 9000000) + 1000000}`,
            danmakuSync: true,
            giftSync: platform?.giftSystem ?? false,
            dataSync: true,
            connectedAt: Date.now(),
          },
        },
      }));
    }, 1800);
  },

  disconnect: (id) =>
    set((s) => ({
      connections: { ...s.connections, [id]: initialConn(id) },
    })),

  goLive: (id) =>
    set((s) => {
      const conn = s.connections[id];
      if (conn.connState !== "connected") return s;
      return {
        connections: {
          ...s.connections,
          [id]: {
            ...conn,
            isLive: true,
            connState: "live",
            liveDuration: 0,
            viewerCount: Math.floor(Math.random() * 200) + 50,
          },
        },
      };
    }),

  stopLive: (id) =>
    set((s) => ({
      connections: {
        ...s.connections,
        [id]: { ...s.connections[id], isLive: false, connState: "connected", liveDuration: 0 },
      },
    })),

  setStreamKey: (id, key) =>
    set((s) => ({
      connections: { ...s.connections, [id]: { ...s.connections[id], streamKey: key } },
    })),

  toggleDanmakuSync: (id) =>
    set((s) => ({
      connections: {
        ...s.connections,
        [id]: { ...s.connections[id], danmakuSync: !s.connections[id].danmakuSync },
      },
    })),
  toggleGiftSync: (id) =>
    set((s) => ({
      connections: {
        ...s.connections,
        [id]: { ...s.connections[id], giftSync: !s.connections[id].giftSync },
      },
    })),
  toggleDataSync: (id) =>
    set((s) => ({
      connections: {
        ...s.connections,
        [id]: { ...s.connections[id], dataSync: !s.connections[id].dataSync },
      },
    })),

  setPlatform: (id) => {
    const platform = LIVE_PLATFORMS.find((p) => p.id === id) ?? LIVE_PLATFORMS[0];
    set({ activePlatform: id, platform });
  },
  toggleExport: () => set((s) => ({ isExportMode: !s.isExportMode })),

  tickLive: () => {
    const conns = get().connections;
    let updated = false;
    const next = { ...conns };
    (Object.keys(next) as PlatformTarget[]).forEach((id) => {
      const c = next[id];
      if (c.isLive) {
        next[id] = {
          ...c,
          liveDuration: c.liveDuration + 1,
          viewerCount: Math.max(10, c.viewerCount + Math.floor(Math.random() * 15) - 5),
        };
        updated = true;
      }
    });
    if (updated) set({ connections: next });
  },

  filterDanmaku: (text) => {
    const platform = get().platform;
    const rules = platform.compliance;
    if (text.length > rules.maxDanmakuLength) {
      return { blocked: true, reason: `超过${rules.maxDanmakuLength}字限制` };
    }
    for (const word of rules.sensitiveWords) {
      if (text.includes(word)) {
        set((s) => ({
          connections: {
            ...s.connections,
            [platform.id]: {
              ...s.connections[platform.id],
              blockedCount: s.connections[platform.id].blockedCount + 1,
            },
          },
        }));
        return { blocked: true, reason: `含敏感词「${word}」` };
      }
    }
    return { blocked: false, reason: "" };
  },
}));

void useChatStore;
void useEngagementStore;
