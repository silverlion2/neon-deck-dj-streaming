import { useEffect, useState } from "react";
import { Gamepad2, Music2, Gauge, Gift, Square } from "lucide-react";
import { NeonPanel } from "@/components/shared/NeonPanel";
import { useGameStore } from "@/store/useGameStore";
import { useSettingsStore } from "@/store/useSettingsStore";

const GAME_DURATION = 60;

export function GamePanel() {
  const { activeGame, history, startGuessSong, startGuessBpm, startLuckyDraw, endGame } =
    useGameStore();
  const theme = useSettingsStore((s) => s.theme);
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!activeGame) return;
    const id = setInterval(() => {
      useGameStore.getState().autoParticipate();
    }, 2500);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeGame?.id]);

  useEffect(() => {
    if (!activeGame) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeGame?.id]);

  const elapsed = activeGame ? (Date.now() - activeGame.startedAt) / 1000 : 0;
  const remaining = Math.max(0, GAME_DURATION - elapsed);
  const progress = (remaining / GAME_DURATION) * 100;

  const handleOption = (optionId: string) => {
    if (!activeGame) return;
    if (optionId === activeGame.answer) endGame("你", theme.primary);
    else endGame();
  };

  const games = [
    { label: "猜歌名", Icon: Music2, color: theme.primary, start: startGuessSong },
    { label: "BPM竞猜", Icon: Gauge, color: theme.secondary, start: startGuessBpm },
    { label: "弹幕抽奖", Icon: Gift, color: theme.accent, start: startLuckyDraw },
  ];

  return (
    <NeonPanel title="互动游戏" accent="lime" icon={<Gamepad2 className="h-3.5 w-3.5" />}>
      <div className="scrollbar-thin h-full overflow-y-auto p-3">
        {!activeGame ? (
          <div className="grid grid-cols-3 gap-2">
            {games.map((g) => (
              <button
                key={g.label}
                onClick={() => g.start()}
                className="flex flex-col items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-2 py-3 transition hover:border-white/25 hover:bg-white/5 active:scale-95"
              >
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-lg"
                  style={{ background: `${g.color}1a`, color: g.color, boxShadow: `0 0 10px ${g.color}33` }}
                >
                  <g.Icon className="h-4 w-4" />
                </span>
                <span className="font-display text-[10px] font-bold uppercase tracking-wider text-white/80">
                  {g.label}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <div>
              <div
                className="font-display text-[9px] font-bold uppercase tracking-widest"
                style={{ color: theme.accent }}
              >
                {activeGame.title}
              </div>
              <p className="mt-0.5 font-body text-xs font-semibold text-white/90">
                {activeGame.question}
              </p>
            </div>

            {activeGame.type === "luckyDraw" ? (
              <div className="flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] py-3 font-body text-xs text-white/55">
                <Gift className="h-3.5 w-3.5 animate-blink" style={{ color: theme.accent }} />
                等待弹幕参与中...
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-1.5">
                {activeGame.options?.map((o) => (
                  <button
                    key={o.id}
                    onClick={() => handleOption(o.id)}
                    className="truncate rounded-lg border border-white/10 bg-white/[0.03] px-2 py-2 text-left font-body text-[11px] font-semibold text-white/85 transition hover:border-white/25 hover:bg-white/5 active:scale-[0.98]"
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between font-body text-[10px]">
              <span className="text-white/40">
                参与{" "}
                <span className="font-bold tabular-nums" style={{ color: theme.secondary }}>
                  {Object.keys(activeGame.participants).length}
                </span>{" "}
                人
              </span>
              <span className="truncate text-white/50">奖励：{activeGame.reward}</span>
            </div>

            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${progress}%`,
                  background: `linear-gradient(90deg, ${theme.primary}, ${theme.secondary})`,
                }}
              />
            </div>

            <button
              onClick={() => endGame()}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-neon-magenta/30 bg-neon-magenta/5 py-1.5 font-display text-[10px] font-bold uppercase tracking-widest text-neon-magenta transition hover:bg-neon-magenta/15 active:scale-95"
            >
              <Square className="h-3 w-3 fill-current" />
              结束游戏
            </button>
          </div>
        )}

        {history.length > 0 && (
          <div className="mt-3 border-t border-white/5 pt-2">
            <div className="mb-1 font-display text-[9px] font-bold uppercase tracking-widest text-white/30">
              历史记录
            </div>
            <div className="space-y-0.5">
              {history.map((g) => (
                <div
                  key={g.id}
                  className="flex items-center gap-1.5 font-body text-[10px] text-white/45"
                >
                  <span style={{ color: theme.accent }}>·</span>
                  <span className="font-semibold text-white/65">{g.title}</span>
                  <span className="truncate">
                    {g.winner ? `🏆 ${g.winner.name}` : "无人中奖"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </NeonPanel>
  );
}
