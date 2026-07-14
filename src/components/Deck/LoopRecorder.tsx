import { Repeat, Play, Circle, Keyboard } from "lucide-react";
import { NeonPanel } from "@/components/shared/NeonPanel";
import { useLoopStore } from "@/store/useLoopStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { PAD_ORDER } from "@/audio/AudioEngine";

const KEY_ROWS = [
  ["1", "2", "3", "4"],
  ["q", "w", "e", "r"],
];

export function LoopRecorder() {
  const loops = useLoopStore((s) => s.loops);
  const isRecording = useLoopStore((s) => s.isRecording);
  const recordPad = useLoopStore((s) => s.recordPad);
  const startRecord = useLoopStore((s) => s.startRecord);
  const triggerPad = useLoopStore((s) => s.triggerPad);
  const keyboardMapping = useLoopStore((s) => s.keyboardMapping);
  const theme = useSettingsStore((s) => s.theme);

  return (
    <NeonPanel
      title="Loop 录制"
      accent="cyan"
      icon={<Repeat className="h-3.5 w-3.5" />}
      className="h-full"
      action={
        <button
          onClick={() => startRecord(0)}
          disabled={isRecording}
          className="flex items-center gap-1.5 rounded-md border px-2 py-1 transition active:scale-95 disabled:cursor-not-allowed"
          style={{
            borderColor: isRecording ? "rgba(255,45,80,0.6)" : "rgba(0,240,255,0.4)",
            background: isRecording ? "rgba(255,45,80,0.18)" : "rgba(0,240,255,0.1)",
            color: isRecording ? "#FF2D55" : theme.secondary,
            boxShadow: isRecording
              ? "0 0 12px rgba(255,45,80,0.5)"
              : "0 0 10px rgba(0,240,255,0.3)",
          }}
        >
          <Circle
            className={`h-2.5 w-2.5 fill-current ${isRecording ? "animate-pulse" : ""}`}
          />
          <span className="font-display text-[9px] font-bold uppercase tracking-widest">
            {isRecording ? "录制中..." : "录制"}
          </span>
        </button>
      }
    >
      <div className="scrollbar-thin flex h-full flex-col gap-2.5 overflow-y-auto px-3 py-2.5">
        {isRecording && (
          <div
            className="flex items-center gap-2 rounded-md border px-2 py-1.5"
            style={{
              borderColor: "rgba(255,45,80,0.4)",
              background: "rgba(255,45,80,0.08)",
            }}
          >
            <Circle className="h-2.5 w-2.5 animate-pulse fill-current text-red-500" />
            <span className="font-body text-[10px] text-red-300/80">
              正在录制到 PAD {recordPad}...
            </span>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          {loops.length === 0 ? (
            <div className="rounded-lg border border-dashed border-white/10 px-3 py-4 text-center">
              <span className="font-body text-[10px] text-white/30">
                暂无录制的 Loop,点击「录制」开始
              </span>
            </div>
          ) : (
            loops.map((clip) => (
              <div
                key={clip.id}
                className="flex items-center gap-2 rounded-lg border px-2 py-1.5 transition"
                style={{
                  borderColor: "rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.03)",
                }}
              >
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded font-display text-[9px] font-bold"
                  style={{
                    color: theme.secondary,
                    background: `${theme.secondary}1a`,
                    border: `1px solid ${theme.secondary}55`,
                  }}
                >
                  {clip.padIndex}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-body text-[11px] font-semibold text-white/85">
                    {clip.name}
                  </div>
                  <div className="font-display text-[9px] uppercase tracking-wider text-white/35">
                    PAD {clip.padIndex} · {clip.bars} BARS
                  </div>
                </div>
                <button
                  onClick={() => triggerPad(clip.padIndex)}
                  className="flex items-center gap-1 rounded-md border px-2 py-1 transition active:scale-95"
                  style={{
                    borderColor: `${theme.accent}66`,
                    background: `${theme.accent}1a`,
                    color: theme.accent,
                  }}
                >
                  <Play className="h-2.5 w-2.5 fill-current" />
                  <span className="font-display text-[9px] font-bold uppercase tracking-widest">
                    播放
                  </span>
                </button>
              </div>
            ))
          )}
        </div>

        <div className="flex items-start gap-1.5 rounded-md border border-white/5 bg-white/[0.02] px-2 py-1.5">
          <Keyboard className="mt-0.5 h-3 w-3 shrink-0" style={{ color: theme.secondary }} />
          <span className="font-body text-[9px] leading-relaxed text-white/45">
            按 <span className="font-bold" style={{ color: theme.primary }}>1-4</span> 触发
            <span className="font-bold text-white/70"> KICK/SNARE/HAT/CLAP</span>,
            <span className="font-bold" style={{ color: theme.secondary }}> Q-R</span> 触发
            <span className="font-bold text-white/70"> BASS/RISER/VOCAL/FX</span>
          </span>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="font-display text-[9px] font-bold uppercase tracking-widest text-white/30">
            键位映射
          </span>
          {KEY_ROWS.map((row, ri) => (
            <div key={ri} className="grid grid-cols-4 gap-1.5">
              {row.map((key) => {
                const padIndex = keyboardMapping[key];
                const padName = padIndex !== undefined ? PAD_ORDER[padIndex] : "";
                const color = ri === 0 ? theme.primary : theme.secondary;
                return (
                  <div
                    key={key}
                    className="flex flex-col items-center justify-center rounded-md border py-1"
                    style={{
                      borderColor: `${color}44`,
                      background: `${color}0d`,
                    }}
                  >
                    <span className="font-display text-[11px] font-bold" style={{ color }}>
                      {key.toUpperCase()}
                    </span>
                    <span className="font-display text-[8px] font-bold uppercase tracking-wider text-white/40">
                      {padName}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </NeonPanel>
  );
}
