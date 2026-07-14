import { useEffect, useRef, useState } from "react";
import { useChatStore } from "@/store/useChatStore";
import { randInt } from "@/utils/random";

interface DanmakuItem {
  id: string;
  text: string;
  user: string;
  color: string;
  lane: number;
  isGift: boolean;
  giftEmoji?: string;
  duration: number;
}

const LANES = 5;
const LANE_HEIGHT = 34;
const TOP_OFFSET = 12;

export function Danmaku() {
  const messages = useChatStore((s) => s.messages);
  const [items, setItems] = useState<DanmakuItem[]>([]);
  const seen = useRef<Set<string>>(new Set());
  const laneCursor = useRef(0);

  useEffect(() => {
    if (seen.current.size === 0) {
      messages.forEach((m) => seen.current.add(m.id));
      return;
    }
    const fresh = messages.filter((m) => !seen.current.has(m.id));
    if (fresh.length === 0) return;
    fresh.forEach((m) => seen.current.add(m.id));

    const spawned: DanmakuItem[] = fresh.map((m) => {
      const lane = laneCursor.current % LANES;
      laneCursor.current += 1;
      return {
        id: m.id,
        text: m.text,
        user: m.user,
        color: m.color,
        lane,
        isGift: !!m.isGift,
        giftEmoji: m.giftEmoji,
        duration: randInt(7, 11),
      };
    });
    setItems((prev) => [...prev, ...spawned]);

    fresh.forEach((m) => {
      setTimeout(() => {
        setItems((prev) => prev.filter((i) => i.id !== m.id));
      }, 11000);
    });
  }, [messages]);

  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
      {items.map((item) => (
        <div
          key={item.id}
          className="absolute flex max-w-[60%] items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1 backdrop-blur-sm"
          style={{
            top: TOP_OFFSET + item.lane * LANE_HEIGHT,
            left: "100%",
            animation: `danmakuFly ${item.duration}s linear forwards`,
            borderColor: item.isGift ? `${item.color}99` : "rgba(255,255,255,0.1)",
            background: item.isGift
              ? `${item.color}22`
              : "rgba(10,10,24,0.55)",
            boxShadow: item.isGift ? `0 0 16px ${item.color}66` : "none",
          }}
        >
          {item.isGift && item.giftEmoji && (
            <span className="text-base" style={{ filter: `drop-shadow(0 0 6px ${item.color})` }}>
              {item.giftEmoji}
            </span>
          )}
          <span
            className="font-body text-xs font-semibold"
            style={{ color: item.color }}
          >
            {item.user}
          </span>
          <span className="font-body text-xs text-white/90">{item.text}</span>
        </div>
      ))}
    </div>
  );
}
