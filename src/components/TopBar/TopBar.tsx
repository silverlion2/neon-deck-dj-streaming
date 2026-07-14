import { Radio, Users, Heart, Gift, Settings, Share2 } from "lucide-react";
import { useLiveStore } from "@/store/useLiveStore";
import { useEngagementStore } from "@/store/useEngagementStore";
import { useChatStore } from "@/store/useChatStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { formatCount } from "@/utils/format";
import { ThemeSwitcher } from "./ThemeSwitcher";

export function TopBar() {
  const { currentTrack, bpm, isPlaying, toggle } = useLiveStore();
  const online = useEngagementStore((s) => s.online);
  const likes = useEngagementStore((s) => s.likes);
  const giftsCount = useEngagementStore((s) => s.giftsCount);
  const messages = useChatStore((s) => s.messages);
  const { theme, muted, toggleMute } = useSettingsStore();

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/10 bg-ink-900/80 px-4 backdrop-blur-xl">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-lg"
            style={{
              background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`,
              boxShadow: `0 0 16px ${theme.primary}88`,
            }}
          >
            <Radio className="h-5 w-5 text-white" />
          </div>
          <div className="leading-none">
            <div className="font-display text-sm font-black tracking-widest text-white">
              NEON<span style={{ color: theme.primary }}>DECK</span>
            </div>
            <div className="font-body text-[10px] uppercase tracking-[0.3em] text-white/40">
              DJ Streaming
            </div>
          </div>
        </div>

        <div
          className="hidden items-center gap-1.5 rounded-full border px-3 py-1 md:flex"
          style={{ borderColor: `${theme.primary}66`, background: `${theme.primary}1a` }}
        >
          <span
            className="h-2 w-2 animate-blink rounded-full"
            style={{ background: theme.primary, boxShadow: `0 0 8px ${theme.primary}` }}
          />
          <span
            className="font-display text-[10px] font-bold tracking-widest"
            style={{ color: theme.primary }}
          >
            LIVE
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-hidden">
        <div className="hidden min-w-0 items-center gap-2 rounded-lg border border-white/10 bg-ink-700/60 px-3 py-1.5 lg:flex">
          <span className="font-body text-[10px] uppercase tracking-widest text-white/40">NOW</span>
          <span className="truncate font-display text-xs font-bold text-white">
            {currentTrack.title}
          </span>
          <span className="text-[10px]" style={{ color: theme.secondary }}>
            {currentTrack.artist}
          </span>
        </div>
        <Stat icon={<Users className="h-3.5 w-3.5" />} value={formatCount(online)} color={theme.secondary} />
        <Stat icon={<Heart className="h-3.5 w-3.5" />} value={formatCount(likes)} color={theme.primary} />
        <Stat icon={<Gift className="h-3.5 w-3.5" />} value={formatCount(giftsCount)} color={theme.accent} />
        <Stat icon={<Radio className="h-3.5 w-3.5" />} value={`${bpm}`} color={theme.accent} suffix="BPM" />
      </div>

      <div className="flex items-center gap-1.5">
        <span className="hidden font-body text-[10px] uppercase tracking-widest text-white/40 sm:inline">
          {messages.length} 弹幕
        </span>
        <IconBtn onClick={toggleMute}>
          <span style={{ color: muted ? "rgba(255,255,255,0.3)" : theme.secondary }}>
            {muted ? "🔇" : "🔊"}
          </span>
        </IconBtn>
        <IconBtn>
          <Settings className="h-4 w-4" />
        </IconBtn>
        <ThemeSwitcher />
        <IconBtn>
          <Share2 className="h-4 w-4" />
        </IconBtn>
        <button
          onClick={toggle}
          className="ml-1 rounded-lg border px-3 py-1.5 font-display text-[10px] font-bold uppercase tracking-widest transition active:scale-95"
          style={{
            borderColor: `${theme.secondary}80`,
            background: `${theme.secondary}1a`,
            color: theme.secondary,
          }}
        >
          {isPlaying ? "Pause" : "Play"}
        </button>
      </div>
    </header>
  );
}

function Stat({
  icon,
  value,
  color,
  suffix,
}: {
  icon: React.ReactNode;
  value: string;
  color: string;
  suffix?: string;
}) {
  return (
    <div
      className="hidden items-center gap-1.5 rounded-lg border px-2.5 py-1.5 sm:flex"
      style={{ borderColor: `${color}4D`, background: `${color}0d`, color }}
    >
      {icon}
      <span className="font-display text-xs font-bold tabular-nums">{value}</span>
      {suffix && <span className="text-[9px] opacity-60">{suffix}</span>}
    </div>
  );
}

function IconBtn({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/60 transition hover:border-white/30 hover:text-white active:scale-95"
    >
      {children}
    </button>
  );
}
