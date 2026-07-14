import { create } from "zustand";
import {
  CHAT_SAMPLES,
  MENTION_MESSAGES,
  USER_NAMES,
  AVATAR_COLORS,
} from "@/data/chatSamples";
import { pickWeighted, pick, uid } from "@/utils/random";
import { GIFTS } from "@/data/gifts";
import type { ChatMessage, Gift } from "@/types";
import { useEngagementStore } from "@/store/useEngagementStore";

interface ChatState {
  messages: ChatMessage[];
  sendChat: (text: string, asHost?: boolean) => void;
  pushRandom: () => void;
  pushGift: (gift?: Gift, from?: string) => void;
}

const MAX = 60;

const makeMessage = (partial: Partial<ChatMessage>): ChatMessage => ({
  id: uid("msg"),
  user: pick(USER_NAMES),
  avatar: pick(AVATAR_COLORS),
  text: pick(CHAT_SAMPLES),
  color: pick(AVATAR_COLORS),
  ts: Date.now(),
  ...partial,
});

export const useChatStore = create<ChatState>((set, get) => ({
  messages: Array.from({ length: 8 }, () => makeMessage({})),

  sendChat: (text, asHost = false) => {
    const msg = makeMessage({
      text,
      user: asHost ? "DJ NEON-X" : "你",
      avatar: "#FF2D95",
      color: "#00F0FF",
    });
    set((s) => ({ messages: [...s.messages.slice(-(MAX - 1)), msg] }));
  },

  pushRandom: () => {
    const roll = Math.random();
    if (roll < 0.12) {
      get().pushGift();
      return;
    }
    const text =
      Math.random() < 0.18 ? pick(MENTION_MESSAGES) : pick(CHAT_SAMPLES);
    const msg = makeMessage({ text });
    set((s) => ({ messages: [...s.messages.slice(-(MAX - 1)), msg] }));
  },

  pushGift: (gift, from) => {
    const g = gift ?? pickWeighted(GIFTS);
    const sender = from ?? pick(USER_NAMES);
    const msg = makeMessage({
      user: sender,
      text: `送出 ${g.emoji} ${g.name}`,
      color: g.color,
      isGift: true,
      giftEmoji: g.emoji,
    });
    useEngagementStore.getState().registerGift();
    set((s) => ({ messages: [...s.messages.slice(-(MAX - 1)), msg] }));
  },
}));
