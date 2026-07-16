import { useRef, useState, useEffect, useCallback } from "react";
import {
  Play, Pause, SkipForward, SkipBack, Volume2, VolumeX,
  Upload, Music, Circle, Activity, Sparkles, X, ListMusic,
  Sliders, Monitor, Shuffle, RotateCcw,
} from "lucide-react";
import { useMusicPlayerStore, saveSession } from "@/store/useMusicPlayerStore";
import { useSettingsStore, type VisualMode } from "@/store/useSettingsStore";
import { useVisualizer } from "@/hooks/useVisualizer";
import { formatTime } from "@/utils/format";
import type { EqBands } from "@/audio/AudioEngine";

const VISUAL_MODES: { id: VisualMode; icon: typeof Circle; label: string }[] = [
  { id: "ring", icon: Circle, label: "环形" },
  { id: "wave", icon: Activity, label: "波形" },
  { id: "particles", icon: Sparkles, label: "粒子" },
];

const EQ_BANDS: { key: keyof EqBands; label: string; color: string }[] = [
  { key: "low", label: "LOW", color: "#FF2D95" },
  { key: "mid", label: "MID", color: "#00F0FF" },
  { key: "high", label: "HIGH", color: "#B6FF3C" },
];

export function StageShow({ onExit }: { onExit: () => void }) {
  const canvasRef = useVisualizer();
  const {
    playlist, currentIndex, playState, addFiles, playIndex, togglePlay,
    next, prev, seek, removeFile, eq, setEq, resetEq, autoMix, toggleAutoMix,
    obsMode, toggleObsMode, hydrate,
  } = useMusicPlayerStore();
  const {
    theme, muted, toggleMute, visualMode, setVisualMode, volume, setVolume,
    themeId, presetId,
  } = useSettingsStore();
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [showEq, setShowEq] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    const interval = setInterval(() => {
      saveSession({
        vibeThemeId: themeId,
        vibePresetId: presetId,
        volume,
        visualMode,
        autoMix,
        eq,
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [themeId, presetId, volume, visualMode, autoMix, eq]);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (files && files.length > 0) addFiles(files);
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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      } else if (e.code === "ArrowRight") {
        next();
      } else if (e.code === "ArrowLeft") {
        prev();
      } else if (e.key === "l" || e.key === "L") {
        setShowPlaylist((v) => !v);
      } else if (e.key === "e" || e.key === "E") {
        setShowEq((v) => !v);
      } else if (e.key === "o" || e.key === "O") {
        toggleObsMode();
      } else if (e.key === "m" || e.key === "M") {
        toggleMute();
      } else if (e.key === "1") setVisualMode("ring");
      else if (e.key === "2") setVisualMode("wave");
      else if (e.key === "3") setVisualMode("particles");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [togglePlay, next, prev, toggleObsMode, toggleMute, setVisualMode]);

  const hasMusic = playlist.length > 0;
  const currentFile = playlist[currentIndex];
  const progress = playState.duration > 0 ? (playState.currentTime / playState.duration) * 100 : 0;

  if (obsMode) {
    return (
      <ObsView
        canvasRef={canvasRef}
        playState={playState}
        theme={theme}
        currentFile={currentFile}
        onExit={toggleObsMode}
        onPrev={prev}
        onNext={next}
        onToggle={togglePlay}
      />
    );
  }

  return (
    <div
      className="relative h-screen w-screen overflow-hidden"
      style={{ background: theme.bg }}
      onDrop={handleDrop}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div
          className="relative flex h-32 w-32 items-center justify-center rounded-full border-2 bg-ink-900/40 backdrop-blur-md"
          style={{
            borderColor: `${theme.primary}44`,
            animation: playState.isPlaying ? "spinSlow 8s linear infinite" : "none",
            boxShadow: playState.isPlaying ? `0 0 60px ${theme.primary}44` : "none",
          }}
        >
          {currentFile ? (
            <Music className="h-12 w-12" style={{ color: theme.primary, filter: `drop-shadow(0 0 16px ${theme.primary})` }} />
          ) : (
            <Upload className="h-12 w-12 text-white/30" />
          )}
        </div>
      </div>

      {!hasMusic && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <div
            className={`pointer-events-auto flex flex-col items-center gap-4 rounded-3xl border-2 border-dashed p-12 transition ${dragOver ? "scale-105" : ""}`}
            style={{
              borderColor: dragOver ? theme.secondary : "rgba(255,255,255,0.15)",
              background: dragOver ? `${theme.secondary}11` : "rgba(10,10,20,0.6)",
              backdropFilter: "blur(12px)",
            }}
          >
            <Upload className="h-10 w-10" style={{ color: dragOver ? theme.secondary : theme.primary }} />
            <div className="text-center">
              <div className="font-display text-xl font-bold text-white">拖入音乐文件开始</div>
              <div className="mt-1 font-body text-sm text-white/40">支持 MP3 / WAV / FLAC · 可多选</div>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="rounded-xl px-6 py-2.5 font-display text-sm font-bold text-ink-900 transition active:scale-95"
              style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`, boxShadow: `0 0 24px ${theme.primary}66` }}
            >
              选择音乐文件
            </button>
          </div>
        </div>
      )}

      {dragOver && hasMusic && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="rounded-2xl border-2 border-dashed px-12 py-8" style={{ borderColor: theme.secondary, background: `${theme.secondary}11` }}>
            <Upload className="mx-auto h-8 w-8" style={{ color: theme.secondary }} />
            <div className="mt-2 font-display text-sm font-bold" style={{ color: theme.secondary }}>松开添加到播放列表</div>
          </div>
        </div>
      )}

      <div className="absolute left-6 top-6 flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`, boxShadow: `0 0 16px ${theme.primary}66` }}>
            <Music className="h-5 w-5 text-white" />
          </div>
          <div className="leading-none">
            <div className="font-display text-sm font-black tracking-widest text-white">
              NEON<span style={{ color: theme.primary }}>DECK</span>
            </div>
            <div className="font-body text-[9px] uppercase tracking-[0.3em] text-white/30">Live Stage</div>
          </div>
        </div>
        {playState.isPlaying && (
          <span className="flex items-center gap-1.5 rounded-full border px-3 py-1" style={{ borderColor: `${theme.primary}66`, background: `${theme.primary}1a` }}>
            <span className="h-2 w-2 animate-blink rounded-full" style={{ background: theme.primary, boxShadow: `0 0 8px ${theme.primary}` }} />
            <span className="font-display text-[10px] font-bold tracking-widest" style={{ color: theme.primary }}>LIVE</span>
          </span>
        )}
        {autoMix && (
          <span className="flex items-center gap-1 rounded-full border px-2 py-0.5" style={{ borderColor: `${theme.accent}44`, background: `${theme.accent}11` }}>
            <Shuffle className="h-3 w-3" style={{ color: theme.accent }} />
            <span className="font-display text-[9px] font-bold tracking-widest" style={{ color: theme.accent }}>AUTO MIX</span>
          </span>
        )}
      </div>

      <div className="absolute right-6 top-6 flex items-center gap-2">
        <div className="flex gap-1 rounded-lg border border-white/10 bg-ink-900/60 p-1 backdrop-blur-md">
          {VISUAL_MODES.map((m) => {
            const Icon = m.icon;
            const active = visualMode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setVisualMode(m.id)}
                title={`${m.label} (${VISUAL_MODES.indexOf(m) + 1})`}
                className="flex h-7 w-7 items-center justify-center rounded transition"
                style={{ background: active ? `${theme.secondary}33` : "transparent", color: active ? theme.secondary : "rgba(255,255,255,0.4)" }}
              >
                <Icon className="h-3.5 w-3.5" />
              </button>
            );
          })}
        </div>
        <button
          onClick={() => setShowEq((v) => !v)}
          title="EQ (E)"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-ink-900/60 backdrop-blur-md transition hover:text-white"
          style={{ color: showEq ? theme.accent : "rgba(255,255,255,0.5)" }}
        >
          <Sliders className="h-4 w-4" />
        </button>
        <button
          onClick={toggleAutoMix}
          title="自动混音"
          className="flex h-8 w-8 items-center justify-center rounded-lg border backdrop-blur-md transition"
          style={{ borderColor: autoMix ? `${theme.accent}55` : "rgba(255,255,255,0.1)", color: autoMix ? theme.accent : "rgba(255,255,255,0.4)" }}
        >
          <Shuffle className="h-4 w-4" />
        </button>
        <button
          onClick={toggleObsMode}
          title="OBS 导出 (O)"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-ink-900/60 backdrop-blur-md transition hover:text-white"
          style={{ color: obsMode ? theme.secondary : "rgba(255,255,255,0.5)" }}
        >
          <Monitor className="h-4 w-4" />
        </button>
        <button
          onClick={onExit}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-ink-900/60 text-white/50 backdrop-blur-md transition hover:text-white"
          title="返回控制台"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {showEq && (
        <div className="absolute right-6 top-20 w-48 rounded-2xl border border-white/10 bg-ink-800/95 p-4 shadow-panel backdrop-blur-xl">
          <div className="mb-3 flex items-center justify-between">
            <span className="font-display text-xs font-bold uppercase tracking-widest text-white/60">3-Band EQ</span>
            <button onClick={resetEq} className="text-white/30 hover:text-white" title="重置">
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="flex justify-between gap-2">
            {EQ_BANDS.map((band) => (
              <div key={band.key} className="flex flex-col items-center gap-2">
                <input
                  type="range"
                  min={-1}
                  max={1}
                  step={0.05}
                  value={eq[band.key]}
                  onChange={(e) => setEq(band.key, Number(e.target.value))}
                  className="h-24 w-2 cursor-pointer"
                  style={{ writingMode: "vertical-lr", direction: "rtl", accentColor: band.color }}
                />
                <span className="font-display text-[9px] font-bold tracking-wider" style={{ color: band.color }}>{band.label}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 text-center font-body text-[10px] text-white/30">±12dB · 实时调节</div>
        </div>
      )}

      {hasMusic && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-ink-900 via-ink-900/80 to-transparent p-6 pt-20">
          <div className="mx-auto max-w-4xl">
            <div className="mb-3 flex items-end gap-4">
              <div className="min-w-0 flex-1">
                {currentFile && (
                  <>
                    <div className="flex items-center gap-2">
                      <Music className="h-4 w-4 shrink-0" style={{ color: theme.secondary }} />
                      <span className="truncate font-display text-lg font-bold text-white">{currentFile.name}</span>
                    </div>
                    <div className="mt-0.5 font-body text-xs text-white/40">
                      {currentIndex + 1} / {playlist.length} 首
                      {playState.duration > 0 && ` · ${formatTime(playState.duration)}`}
                    </div>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowPlaylist((v) => !v)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/60 transition hover:text-white"
                  title="播放列表 (L)"
                >
                  <ListMusic className="h-4 w-4" />
                </button>
                <button
                  onClick={toggleMute}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/60 transition hover:text-white"
                  title="静音 (M)"
                >
                  {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </button>
                <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5">
                  <Volume2 className="h-3.5 w-3.5 text-white/40" />
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="w-20"
                    style={{ accentColor: theme.secondary }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={prev}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:text-white active:scale-95"
                title="上一首 (←)"
              >
                <SkipBack className="h-4 w-4" />
              </button>
              <button
                onClick={togglePlay}
                className="flex h-14 w-14 items-center justify-center rounded-full text-ink-900 transition active:scale-95"
                style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`, boxShadow: `0 0 24px ${theme.primary}88` }}
                title="播放/暂停 (空格)"
              >
                {playState.isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
              </button>
              <button
                onClick={next}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:text-white active:scale-95"
                title="下一首 (→)"
              >
                <SkipForward className="h-4 w-4" />
              </button>
              <span className="ml-2 font-display text-xs tabular-nums text-white/50">{formatTime(playState.currentTime)}</span>
              <div
                className="group relative h-1.5 flex-1 cursor-pointer overflow-hidden rounded-full bg-white/10"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pct = (e.clientX - rect.left) / rect.width;
                  seek(pct * playState.duration);
                }}
              >
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-all"
                  style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${theme.primary}, ${theme.secondary})`, boxShadow: `0 0 10px ${theme.primary}` }}
                />
              </div>
              <span className="font-display text-xs tabular-nums text-white/30">{formatTime(playState.duration)}</span>
            </div>
          </div>
        </div>
      )}

      {showPlaylist && hasMusic && (
        <div className="absolute bottom-32 right-6 w-80 rounded-2xl border border-white/10 bg-ink-800/95 p-3 shadow-panel backdrop-blur-xl">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-display text-xs font-bold uppercase tracking-widest text-white/60">播放列表</span>
            <button onClick={() => setShowPlaylist(false)} className="text-white/30 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="scrollbar-thin max-h-64 space-y-0.5 overflow-y-auto">
            {playlist.map((f, i) => (
              <div
                key={f.id}
                className={`group flex items-center gap-2 rounded-lg px-2 py-1.5 transition ${i === currentIndex ? "bg-white/10" : "hover:bg-white/5"}`}
              >
                <button onClick={() => playIndex(i)} className="flex min-w-0 flex-1 items-center gap-2 text-left">
                  <span className="w-4 text-center font-display text-[10px] font-bold" style={{ color: i === currentIndex ? theme.primary : "rgba(255,255,255,0.3)" }}>
                    {i === currentIndex && playState.isPlaying ? "♪" : i + 1}
                  </span>
                  <span className="truncate font-body text-xs" style={{ color: i === currentIndex ? "#fff" : "rgba(255,255,255,0.6)" }}>
                    {f.name}
                  </span>
                </button>
                <button onClick={() => removeFile(f.id)} className="text-white/20 opacity-0 transition hover:text-neon-magenta group-hover:opacity-100">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-white/15 py-2 font-body text-xs text-white/40 transition hover:border-white/30 hover:text-white/70"
          >
            <Upload className="h-3.5 w-3.5" />
            添加更多
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <div className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 font-body text-[9px] text-white/15">
        空格 播放/暂停 · ← → 切歌 · L 列表 · E EQ · O OBS · M 静音 · 1/2/3 可视化
      </div>
    </div>
  );
}

function ObsView({
  canvasRef, playState, theme, currentFile, onExit, onPrev, onNext, onToggle,
}: {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  playState: { isPlaying: boolean; currentTime: number; duration: number };
  theme: { primary: string; secondary: string };
  currentFile?: { name: string };
  onExit: () => void;
  onPrev: () => void;
  onNext: () => void;
  onToggle: () => void;
}) {
  const progress = playState.duration > 0 ? (playState.currentTime / playState.duration) * 100 : 0;
  return (
    <div className="relative h-screen w-screen overflow-hidden" style={{ background: "#000" }}>
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      <div className="pointer-events-none absolute left-6 top-6 flex items-center gap-2">
        <span className="flex items-center gap-1.5 rounded-full border px-3 py-1" style={{ borderColor: `${theme.primary}66`, background: `${theme.primary}1a` }}>
          <span className="h-2 w-2 animate-blink rounded-full" style={{ background: theme.primary }} />
          <span className="font-display text-[10px] font-bold tracking-widest" style={{ color: theme.primary }}>LIVE</span>
        </span>
        <span className="font-display text-xs font-bold text-white/40">OBS CAPTURE MODE</span>
      </div>

      <button
        onClick={onExit}
        className="absolute right-6 top-6 flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-black/40 text-white/50 backdrop-blur-md transition hover:text-white"
        title="退出 OBS 模式 (O)"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 pt-12">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <span className="truncate font-display text-sm font-bold text-white/80">{currentFile?.name ?? ""}</span>
          <div className="ml-auto flex items-center gap-2 opacity-30 transition hover:opacity-100">
            <button onClick={onPrev} className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white">
              <SkipBack className="h-3.5 w-3.5" />
            </button>
            <button onClick={onToggle} className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white">
              {playState.isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            </button>
            <button onClick={onNext} className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white">
              <SkipForward className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        <div className="mx-auto mt-2 h-0.5 max-w-2xl overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: theme.secondary }} />
        </div>
      </div>
    </div>
  );
}
