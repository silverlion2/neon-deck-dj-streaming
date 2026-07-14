import { useEffect, useRef, useState } from "react";
import { Send, Gift as GiftIcon, Sparkles } from "lucide-react";
import { useChatStore } from "@/store/useChatStore";
import { NeonPanel } from "@/components/shared/NeonPanel";
import { GIFTS } from "@/data/gifts";
import type { Gift } from "@/types";

export function ChatPanel() {
  const messages = useChatStore((s) => s.messages);
  const sendChat = useChatStore((s) => s.sendChat);
  const pushGift = useChatStore((s) => s.pushGift);
  const [text, setText] = useState("");
  const [showGifts, setShowGifts] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const t = text.trim();
    if (!t) return;
    sendChat(t);
    setText("");
  };

  const handleGift = (gift: Gift) => {
    pushGift(gift, "你");
    setShowGifts(false);
  };

  return (
    <NeonPanel title="弹幕互动" accent="magenta" icon={<Sparkles className="h-3.5 w-3.5" />} className="h-full">
      <div className="flex h-full flex-col">
        <div className="scrollbar-thin flex-1 space-y-1 overflow-y-auto px-3 py-3">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-2 rounded-lg px-2 py-1 animate-slide-in ${
                m.isGift ? "bg-white/5" : ""
              }`}
              style={m.isGift ? { boxShadow: `inset 2px 0 0 ${m.color}` } : undefined}
            >
              <div
                className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-ink-900"
                style={{ background: m.avatar, boxShadow: `0 0 8px ${m.avatar}88` }}
              >
                {m.user.slice(0, 1)}
              </div>
              <div className="min-w-0 flex-1">
                <span
                  className="mr-1.5 font-body text-[11px] font-semibold"
                  style={{ color: m.color }}
                >
                  {m.user}
                </span>
                <span className="font-body text-xs text-white/85">{m.text}</span>
              </div>
              {m.isGift && m.giftEmoji && (
                <span className="text-lg" style={{ filter: `drop-shadow(0 0 6px ${m.color})` }}>
                  {m.giftEmoji}
                </span>
              )}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {showGifts && (
          <div className="grid grid-cols-5 gap-1.5 border-t border-white/5 px-3 py-2">
            {GIFTS.map((g) => (
              <button
                key={g.id}
                onClick={() => handleGift(g)}
                className="flex flex-col items-center gap-0.5 rounded-lg border border-white/10 bg-white/5 py-1.5 transition hover:scale-105 active:scale-95"
                style={{ boxShadow: `inset 0 0 0 1px ${g.color}33` }}
              >
                <span className="text-xl" style={{ filter: `drop-shadow(0 0 6px ${g.color})` }}>
                  {g.emoji}
                </span>
                <span className="font-body text-[9px]" style={{ color: g.color }}>
                  {g.name}
                </span>
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-1.5 border-t border-white/10 bg-ink-900/60 p-2">
          <button
            onClick={() => setShowGifts((v) => !v)}
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition active:scale-95 ${
              showGifts
                ? "border-neon-gold/60 bg-neon-gold/15 text-neon-gold"
                : "border-white/10 bg-white/5 text-white/60 hover:border-neon-gold/40"
            }`}
          >
            <GiftIcon className="h-4 w-4" />
          </button>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="发条弹幕助兴…"
            className="h-9 min-w-0 flex-1 rounded-lg border border-white/10 bg-ink-700/60 px-3 font-body text-sm text-white placeholder:text-white/30 focus:border-neon-cyan/50 focus:outline-none"
          />
          <button
            onClick={handleSend}
            className="flex h-9 shrink-0 items-center gap-1 rounded-lg bg-gradient-to-br from-neon-magenta to-neon-violet px-3 font-display text-[10px] font-bold uppercase tracking-widest text-white shadow-neon-magenta transition active:scale-95"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </NeonPanel>
  );
}
