import type { Track } from "@/types";

export type MatchLevel = "perfect" | "good" | "ok" | "warn";

export interface TrackMatch {
  track: Track;
  level: MatchLevel;
  score: number;
  bpmDelta: number;
  keyMatch: boolean;
  label: string;
  reason: string;
}

const parseKey = (key: string): { num: number; letter: string } => ({
  num: parseInt(key, 10),
  letter: key.slice(-1),
});

export function keyCompatible(a: string, b: string): boolean {
  if (a === b) return true;
  const ka = parseKey(a);
  const kb = parseKey(b);
  if (ka.letter === kb.letter && Math.abs(ka.num - kb.num) === 1) return true;
  if (ka.num === kb.num && ka.letter !== kb.letter) return true;
  const opp = ka.letter === "A" ? "B" : "A";
  const adj = ka.num === 12 ? 1 : ka.num + 1;
  const adjDown = ka.num === 1 ? 12 : ka.num - 1;
  if (kb.num === adj && kb.letter === ka.letter) return true;
  if (kb.num === adjDown && kb.letter === ka.letter) return true;
  if (kb.num === ka.num && kb.letter === opp) return true;
  void adj;
  void adjDown;
  return false;
}

export function matchTracks(current: Track, pool: Track[]): TrackMatch[] {
  return pool
    .filter((t) => t.id !== current.id)
    .map((t) => {
      const bpmDelta = Math.abs(t.bpm - current.bpm);
      const km = keyCompatible(current.key, t.key);
      let score = 0;
      let level: MatchLevel = "warn";
      let label = "✗";
      let reason = "";

      if (km) score += 50;
      if (bpmDelta <= 2) {
        score += 40;
      } else if (bpmDelta <= 5) {
        score += 25;
      } else if (bpmDelta <= 8) {
        score += 12;
      } else if (bpmDelta <= 15) {
        score += 5;
      }

      const energyDelta = Math.abs(t.energy - current.energy);
      if (energyDelta <= 0.1) score += 10;
      else if (energyDelta <= 0.2) score += 5;

      if (km && bpmDelta <= 2) {
        level = "perfect";
        label = "√";
        reason = "完美匹配 · 同调同速";
      } else if (km && bpmDelta <= 5) {
        level = "good";
        label = "≈";
        reason = "推荐过渡 · 调性兼容";
      } else if (km || bpmDelta <= 5) {
        level = "ok";
        label = "≈";
        reason = "可过渡 · 微调BPM";
      } else if (bpmDelta <= 15) {
        level = "warn";
        label = "!";
        reason = "需大调速 · 慎用";
      } else {
        level = "warn";
        label = "✗";
        reason = "不建议 · BPM差距大";
      }

      return { track: t, level, score, bpmDelta, keyMatch: km, label, reason };
    })
    .sort((a, b) => b.score - a.score);
}

export const LEVEL_COLOR: Record<MatchLevel, string> = {
  perfect: "#B6FF3C",
  good: "#00F0FF",
  ok: "#FFC53D",
  warn: "#FF6B6B",
};
