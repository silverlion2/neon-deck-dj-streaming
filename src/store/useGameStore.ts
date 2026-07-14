import { create } from "zustand";
import { TRACKS } from "@/data/tracks";
import { USER_NAMES, AVATAR_COLORS } from "@/data/chatSamples";
import { pick, uid } from "@/utils/random";
import { useChatStore } from "@/store/useChatStore";

export type GameType = "guessSong" | "guessBpm" | "luckyDraw";

export interface GameSession {
  id: string;
  type: GameType;
  title: string;
  question: string;
  options?: { id: string; label: string }[];
  answer?: string;
  participants: Record<string, { name: string; color: string; guess: string }>;
  reward: string;
  status: "active" | "ended";
  winner?: { name: string; color: string };
  startedAt: number;
}

interface GameState {
  activeGame: GameSession | null;
  history: GameSession[];
  startGuessSong: () => void;
  startGuessBpm: () => void;
  startLuckyDraw: () => void;
  endGame: (winnerName?: string, winnerColor?: string) => void;
  autoParticipate: () => void;
}

const makeSongGame = (): GameSession => {
  const track = pick(TRACKS);
  const wrong = TRACKS.filter((t) => t.id !== track.id)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);
  const options = [track, ...wrong]
    .sort(() => Math.random() - 0.5)
    .map((t) => ({ id: t.id, label: t.title }));
  return {
    id: uid("game"),
    type: "guessSong",
    title: "猜歌名",
    question: "听节奏，这首是？",
    options,
    answer: track.id,
    participants: {},
    reward: "👑 专属皇冠 + 优先点歌",
    status: "active",
    startedAt: Date.now(),
  };
};

const makeBpmGame = (): GameSession => {
  const track = pick(TRACKS);
  const correct = track.bpm;
  const options = [
    { id: `${correct}`, label: `${correct}` },
    { id: `${correct + 8}`, label: `${correct + 8}` },
    { id: `${correct - 6}`, label: `${correct - 6}` },
    { id: `${correct + 16}`, label: `${correct + 16}` },
  ].sort(() => Math.random() - 0.5);
  return {
    id: uid("game"),
    type: "guessBpm",
    title: "BPM 竞猜",
    question: `猜猜《${track.title}》的 BPM`,
    options,
    answer: `${correct}`,
    participants: {},
    reward: "💎 钻石 + DJ 点名感谢",
    status: "active",
    startedAt: Date.now(),
  };
};

const makeLuckyDraw = (): GameSession => {
  return {
    id: uid("game"),
    type: "luckyDraw",
    title: "弹幕抽奖",
    question: "发弹幕参与抽奖，随机抽1位幸运观众！",
    participants: {},
    reward: "🎁 神秘礼物 + 下首歌点歌权",
    status: "active",
    startedAt: Date.now(),
  };
};

export const useGameStore = create<GameState>((set, get) => ({
  activeGame: null,
  history: [],

  startGuessSong: () => set({ activeGame: makeSongGame() }),
  startGuessBpm: () => set({ activeGame: makeBpmGame() }),
  startLuckyDraw: () => set({ activeGame: makeLuckyDraw() }),

  endGame: (winnerName, winnerColor) => {
    const game = get().activeGame;
    if (!game) return;
    let winner: { name: string; color: string } | undefined;
    if (game.type === "luckyDraw") {
      const names = Object.values(game.participants);
      if (names.length > 0) winner = pick(names);
    } else if (winnerName && winnerColor) {
      winner = { name: winnerName, color: winnerColor };
    }
    const ended: GameSession = { ...game, status: "ended", winner };
    if (winner) {
      useChatStore.getState().sendChat(`🎉 恭喜 ${winner.name} 赢得「${game.title}」！${game.reward}`, true);
    }
    set((s) => ({ activeGame: null, history: [ended, ...s.history].slice(0, 5) }));
  },

  autoParticipate: () => {
    const game = get().activeGame;
    if (!game || game.status !== "active") return;
    const name = pick(USER_NAMES);
    const color = pick(AVATAR_COLORS);
    const guess = game.options ? pick(game.options).id : "join";
    set((s) => {
      if (!s.activeGame) return s;
      const participants = {
        ...s.activeGame.participants,
        [name]: { name, color, guess },
      };
      return { activeGame: { ...s.activeGame, participants } };
    });
  },
}));
