import { useRef, useState, useCallback, useEffect } from "react";
import { Upload, Music, Zap, ArrowRight, Sparkles, Monitor } from "lucide-react";
import { useSettingsStore, THEMES } from "@/store/useSettingsStore";
import { useMusicPlayerStore, loadSession } from "@/store/useMusicPlayerStore";
import { PRESETS } from "@/audio/presets";
import type { PresetId } from "@/audio/presets";
import { audioEngine } from "@/audio/AudioEngine";

interface QuickStartProps {
  onEnterStage: () => void;
  onEnterConsole: () => void;
  onEnterObsGuide: () => void;
}

const VIBE_PRESETS = [
  { themeId: "neon", presetId: "TECHNO" as const, name: "霓虹 Techno", color: "#FF2D95", desc: "工业四四拍 · 深空紫青" },
  { themeId: "lava", presetId: "SYNTHWAVE" as const, name: "复古 Synthwave", color: "#FFC53D", desc: "蒸汽波 · 熔岩暖橙" },
  { themeId: "aurora", presetId: "ACID" as const, name: "极光 Acid", color: "#B6FF3C", desc: "303 共振 · 翠绿" },
  { themeId: "abyss", presetId: "TRAP" as const, name: "深海 Chill", color: "#2D7BFF", desc: "808 低音 · 深蓝" },
];

export function QuickStart({ onEnterStage, onEnterConsole, onEnterObsGuide }: QuickStartProps) {
  const { theme, setTheme, setPreset, setVolume, setVisualMode } = useSettingsStore();
  const { playlist, addFiles } = useMusicPlayerStore();
  const [dragOver, setDragOver] = useState(false);
  const [selectedVibe, setSelectedVibe] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const session = loadSession();
    if (session) {
      const vibeIdx = VIBE_PRESETS.findIndex(
        (v) => v.themeId === session.vibeThemeId && v.presetId === session.vibePresetId
      );
      if (vibeIdx >= 0) {
        setSelectedVibe(vibeIdx);
        setTheme(session.vibeThemeId);
        setPreset(session.vibePresetId as PresetId);
      }
      if (session.volume) setVolume(session.volume);
      if (session.visualMode) setVisualMode(session.visualMode as "ring" | "wave" | "particles");
      audioEngine.ensure();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (files && files.length > 0) {
        addFiles(files);
      }
    },
    [addFiles]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const pickVibe = (i: number) => {
    setSelectedVibe(i);
    const vibe = VIBE_PRESETS[i];
    setTheme(vibe.themeId);
    setPreset(vibe.presetId);
    audioEngine.ensure();
  };

  const canGoLive = playlist.length > 0;

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-6"
      style={{ background: theme.bg }}
      onDrop={handleDrop}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
    >
      <div
        className="pointer-events-none absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full blur-[120px]"
        style={{ background: theme.glow1 }}
      />
      <div
        className="pointer-events-none absolute -right-40 bottom-0 h-[500px] w-[500px] rounded-full blur-[120px]"
        style={{ background: theme.glow2 }}
      />

      <div className="relative z-10 w-full max-w-2xl">
        <div className="mb-10 text-center">
          <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`, boxShadow: `0 0 32px ${theme.primary}66` }}>
            <Music className="h-7 w-7 text-white" />
          </div>
          <h1 className="font-display text-4xl font-black tracking-tight text-white">
            NEON<span style={{ color: theme.primary }}>DECK</span>
          </h1>
          <p className="mt-2 font-body text-sm text-white/40">三步开播 · 拖入音乐 · 点亮舞台</p>
        </div>

        <div className="mb-6">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-ink-900" style={{ background: theme.secondary }}>1</span>
            <span className="font-display text-sm font-bold uppercase tracking-widest text-white/80">选择氛围</span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {VIBE_PRESETS.map((v, i) => {
              const active = selectedVibe === i;
              return (
                <button
                  key={v.themeId}
                  onClick={() => pickVibe(i)}
                  className="group relative overflow-hidden rounded-xl border p-3 text-left transition active:scale-95"
                  style={{
                    borderColor: active ? v.color : "rgba(255,255,255,0.08)",
                    background: active ? `${v.color}1a` : "rgba(255,255,255,0.03)",
                    boxShadow: active ? `0 0 20px ${v.color}44` : "none",
                  }}
                >
                  <div className="mb-2 h-8 w-8 rounded-lg" style={{ background: `linear-gradient(135deg, ${v.color}, ${theme.secondary})` }} />
                  <div className="font-display text-xs font-bold text-white">{v.name}</div>
                  <div className="mt-0.5 font-body text-[10px] text-white/35">{v.desc}</div>
                  {active && (
                    <div className="absolute right-2 top-2 h-2 w-2 rounded-full" style={{ background: v.color, boxShadow: `0 0 8px ${v.color}` }} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mb-6">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-ink-900" style={{ background: theme.secondary }}>2</span>
            <span className="font-display text-sm font-bold uppercase tracking-widest text-white/80">拖入音乐</span>
            {playlist.length > 0 && (
              <span className="ml-auto rounded-full px-2 py-0.5 font-body text-[10px]" style={{ background: `${theme.accent}22`, color: theme.accent }}>
                {playlist.length} 首已就绪
              </span>
            )}
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className={`flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-8 transition ${dragOver ? "scale-[1.02]" : ""}`}
            style={{
              borderColor: dragOver ? theme.secondary : "rgba(255,255,255,0.12)",
              background: dragOver ? `${theme.secondary}11` : "rgba(255,255,255,0.02)",
            }}
          >
            <Upload className="h-8 w-8" style={{ color: dragOver ? theme.secondary : theme.primary }} />
            <div className="text-center">
              <div className="font-display text-base font-bold text-white">
                {dragOver ? "松开导入" : "拖入 MP3 / WAV / FLAC"}
              </div>
              <div className="mt-0.5 font-body text-xs text-white/35">或点击选择文件 · 支持多选</div>
            </div>
          </button>
          <input ref={fileInputRef} type="file" accept="audio/*" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />

          {playlist.length > 0 && (
            <div className="mt-2 space-y-1">
              {playlist.slice(0, 3).map((f, i) => (
                <div key={f.id} className="flex items-center gap-2 rounded-lg bg-white/[0.03] px-3 py-1.5">
                  <Music className="h-3 w-3 shrink-0" style={{ color: theme.secondary }} />
                  <span className="truncate font-body text-xs text-white/70">{f.name}</span>
                  {i === 0 && <span className="ml-auto font-display text-[9px] font-bold" style={{ color: theme.primary }}>即将播放</span>}
                </div>
              ))}
              {playlist.length > 3 && (
                <div className="px-3 font-body text-[10px] text-white/30">+{playlist.length - 3} 首</div>
              )}
            </div>
          )}
        </div>

        <div className="mb-6">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-ink-900" style={{ background: theme.secondary }}>3</span>
            <span className="font-display text-sm font-bold uppercase tracking-widest text-white/80">开始</span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onEnterStage}
              disabled={!canGoLive}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl py-4 font-display text-base font-bold text-ink-900 transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
              style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`, boxShadow: canGoLive ? `0 0 32px ${theme.primary}66` : "none" }}
            >
              <Zap className="h-5 w-5" />
              进入舞台
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={onEnterConsole}
              className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-4 font-display text-sm font-bold text-white/60 transition hover:text-white active:scale-95"
            >
              <Sparkles className="h-4 w-4" />
              控制台
            </button>
          </div>
          {!canGoLive && (
            <p className="mt-2 text-center font-body text-xs text-white/30">先拖入音乐文件，即可进入舞台开播</p>
          )}
          <button
            onClick={onEnterObsGuide}
            className="mx-auto mt-3 flex items-center gap-1.5 font-body text-xs text-white/40 transition hover:text-white/70"
          >
            <Monitor className="h-3.5 w-3.5" />
            OBS 推流配置指南
          </button>
        </div>
      </div>

      <input ref={fileInputRef} type="file" accept="audio/*" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
    </div>
  );
}

void THEMES;
void PRESETS;
