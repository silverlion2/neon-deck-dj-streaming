import { useState } from "react";
import { MessageSquareText, Send } from "lucide-react";
import { NeonPanel } from "@/components/shared/NeonPanel";
import { useChatStore } from "@/store/useChatStore";
import { useSettingsStore } from "@/store/useSettingsStore";

const PRESET_REPLIES = [
  "马上安排🎶",
  "感谢支持❤️",
  "下一首就来",
  "气氛组就位🔥",
  "点歌走起",
  "感谢打赏老板",
  "BPM拉满",
  "安可安可",
];

export function QuickReplies() {
  const sendChat = useChatStore((s) => s.sendChat);
  const theme = useSettingsStore((s) => s.theme);
  const [text, setText] = useState("");

  const handlePreset = (reply: string) => {
    sendChat(reply, true);
  };

  const handleSend = () => {
    const t = text.trim();
    if (!t) return;
    sendChat(t, true);
    setText("");
  };

  return (
    <NeonPanel
      title="快捷话术"
      accent="magenta"
      icon={<MessageSquareText className="h-3.5 w-3.5" />}
      className="h-full"
    >
      <div className="flex h-full flex-col">
        <div className="scrollbar-thin flex-1 overflow-y-auto p-3">
          <div className="mb-2 font-display text-[9px] font-bold uppercase tracking-widest text-white/40">
            预设话术 · 点击发送
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {PRESET_REPLIES.map((reply) => (
              <button
                key={reply}
                onClick={() => handlePreset(reply)}
                className="group relative overflow-hidden rounded-full border px-2.5 py-1.5 font-body text-[11px] font-semibold transition hover:scale-[1.03] active:scale-95"
                style={{
                  borderColor: `${theme.primary}66`,
                  background: `${theme.primary}14`,
                  color: theme.primary,
                }}
              >
                <span
                  className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
                  style={{
                    background: `linear-gradient(90deg, ${theme.primary}22, ${theme.secondary}22)`,
                  }}
                />
                <span className="relative truncate">{reply}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1.5 border-t border-white/10 bg-ink-900/60 p-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="自定义话术…回车发送"
            className="h-9 min-w-0 flex-1 rounded-lg border border-white/10 bg-ink-700/60 px-3 font-body text-xs text-white placeholder:text-white/30 focus:outline-none"
            style={{ borderColor: `${theme.primary}40` }}
          />
          <button
            onClick={handleSend}
            className="flex h-9 shrink-0 items-center gap-1 rounded-lg px-3 font-display text-[10px] font-bold uppercase tracking-widest text-white transition active:scale-95"
            style={{
              background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
              boxShadow: `0 0 12px ${theme.primary}66`,
            }}
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </NeonPanel>
  );
}
