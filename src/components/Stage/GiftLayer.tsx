import { useEffect, useRef, useState } from "react";
import { useChatStore } from "@/store/useChatStore";
import { randInt } from "@/utils/random";

interface Burst {
  id: string;
  emoji: string;
  color: string;
  x: number;
  y: number;
}

export function GiftLayer() {
  const messages = useChatStore((s) => s.messages);
  const [bursts, setBursts] = useState<Burst[]>([]);
  const seen = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (seen.current.size === 0) {
      messages.forEach((m) => seen.current.add(m.id));
      return;
    }
    const fresh = messages.filter((m) => !seen.current.has(m.id) && m.isGift);
    if (fresh.length === 0) return;
    fresh.forEach((m) => seen.current.add(m.id));

    const newBursts: Burst[] = fresh.map((m) => ({
      id: m.id,
      emoji: m.giftEmoji ?? "🎁",
      color: m.color,
      x: randInt(20, 80),
      y: randInt(25, 70),
    }));
    setBursts((prev) => [...prev, ...newBursts]);

    fresh.forEach((m) => {
      setTimeout(() => {
        setBursts((prev) => prev.filter((b) => b.id !== m.id));
      }, 700);
    });
  }, [messages]);

  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
      {bursts.map((b) => (
        <div key={b.id} className="absolute" style={{ left: `${b.x}%`, top: `${b.y}%` }}>
          <div
            className="absolute -inset-8 rounded-full animate-burst"
            style={{ background: `radial-gradient(circle, ${b.color}55, transparent 70%)` }}
          />
          <div
            className="relative text-5xl animate-burst"
            style={{ filter: `drop-shadow(0 0 18px ${b.color})` }}
          >
            {b.emoji}
          </div>
        </div>
      ))}
    </div>
  );
}
