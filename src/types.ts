export interface Track {
  id: string;
  title: string;
  artist: string;
  genre: string;
  bpm: number;
  duration: number;
  cover: string;
  accent: string;
  key: string;
  energy: number;
}

export interface ChatMessage {
  id: string;
  user: string;
  avatar: string;
  text: string;
  color: string;
  isGift?: boolean;
  giftEmoji?: string;
  ts: number;
}

export interface Gift {
  id: string;
  name: string;
  emoji: string;
  color: string;
  weight: number;
}

export interface GiftCombo {
  id: string;
  gift: Gift;
  count: number;
  from: string;
  key: number;
}

export interface QueueItem {
  track: Track;
  requestedBy: string;
  votes: number;
}

export interface PollOption {
  id: string;
  label: string;
  votes: number;
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
}
