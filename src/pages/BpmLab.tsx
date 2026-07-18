import { useRef, useState, useEffect, useCallback } from "react";
import { ArrowLeft, Upload, Music, Activity, Download, Loader2, AlertCircle, Play } from "lucide-react";
import { useSettingsStore } from "@/store/useSettingsStore";
import { audioEngine } from "@/audio/AudioEngine";
import { detectBpm, pickNextByBpm, type BpmCandidate } from "@/audio/bpmDetect";

type TrackStatus = "pending" | "analyzing" | "done" | "error";

interface BpmTrack {
  id: string;
  name: string;
  size: number;
  bpm: number;
  confidence: number;
  status: TrackStatus;
}

export function BpmLab({ onBack }: { onBack: () => void }) {
  const { theme } = useSettingsStore();
  const [tracks, setTracks] = useState<BpmTrack[]>([]);
  const [currentIdx, setCurrentIdx] = useState(-1);
  const [recommendedIdx, setRecommendedIdx] = useState(-1);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);

  const analyzeFile = useCallback(async (file: File, id: string) => {
    setTracks((prev) => prev.map((t) => (t.id === id ? { ...t, status: "analyzing" } : t)));
    const res = await detectBpm(file);
    setTracks((prev) =>
      prev.map((t) =>
        t.id === id
          ? res.bpm > 0
            ? { ...t, bpm: res.bpm, confidence: res.confidence, status: "done" }
            : { ...t, status: "error" }
          : t
      )
    );
  }, []);

  const handleFiles = useCallback(
    (files: FileList | File[] | null) => {
      if (!files) return;
      const audioFiles = Array.from(files).filter((f) => f.type.startsWith("audio/"));
      const newTracks: BpmTrack[] = audioFiles.map((f) => ({
        id: `b_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        name: f.name,
        size: f.size,
        bpm: 0,
        confidence: 0,
        status: "pending" as TrackStatus,
      }));
      setTracks((prev) => [...prev, ...newTracks]);
      audioFiles.forEach((f, i) => void analyzeFile(f, newTracks[i].id));
    },
    [analyzeFile]
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
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const analyser = audioEngine.getAnalyser();
      if (!analyser) {
        ctx.fillStyle = "rgba(255,255,255,0.25)";
        ctx.font = "12px Rajdhani, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("拖入音频并在主舞台播放后，此处显示频谱", w / 2, h / 2);
        rafRef.current = requestAnimationFrame(render);
        return;
      }

      const freqData = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(freqData);
      const bars = 64;
      const barW = w / bars;
      const lowCutoff = Math.floor(bars * 0.15);
      for (let i = 0; i < bars; i++) {
        const idx = Math.floor((i / bars) * freqData.length * 0.7);
        const v = freqData[idx] / 255;
        const barH = v * h * 0.9;
        const isLow = i < lowCutoff;
        const grad = ctx.createLinearGradient(0, h, 0, h - barH);
        grad.addColorStop(0, isLow ? theme.primary : theme.secondary);
        grad.addColorStop(1, isLow ? theme.accent : theme.primary);
        ctx.fillStyle = grad;
        ctx.shadowColor = isLow ? theme.primary : theme.secondary;
        ctx.shadowBlur = isLow ? 12 : 6;
        ctx.fillRect(i * barW + 1, h - barH, barW - 2, barH);
      }
      ctx.shadowBlur = 0;
      ctx.fillStyle = `${theme.primary}55`;
      ctx.fillRect(0, h - 1, w, 1);
      rafRef.current = requestAnimationFrame(render);
    };
    rafRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafRef.current);
  }, [theme]);

  const doneTracks = tracks.filter((t) => t.status === "done");
  const bpmValues = doneTracks.map((t) => t.bpm).filter((b) => b > 0);
  const minBpm = bpmValues.length ? Math.min(...bpmValues) : 0;
  const maxBpm = bpmValues.length ? Math.max(...bpmValues) : 0;
  const avgConf = doneTracks.length
    ? doneTracks.reduce((s, t) => s + t.confidence, 0) / doneTracks.length
    : 0;

  const simulateNext = () => {
    if (currentIdx < 0) return;
    const current = tracks[currentIdx];
    if (current.bpm <= 0) return;
    const candidates: BpmCandidate[] = tracks
      .map((t, i) => ({ bpm: t.bpm, index: i }))
      .filter((c) => c.bpm > 0 && c.index !== currentIdx);
    if (candidates.length === 0) return;
    setRecommendedIdx(pickNextByBpm(current.bpm, candidates));
  };

  const exportJson = () => {
    const data = tracks.map((t) => ({
      name: t.name,
      size: t.size,
      bpm: t.bpm,
      confidence: Number(t.confidence.toFixed(3)),
      status: t.status,
    }));
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bpm-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const recommended = recommendedIdx >= 0 ? tracks[recommendedIdx] : null;
  const current = currentIdx >= 0 ? tracks[currentIdx] : null;

  return (
    <div
      className="relative min-h-screen overflow-y-auto"
      style={{ background: theme.bg }}
      onDrop={handleDrop}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
    >
      <div className="pointer-events-none absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full blur-[120px]" style={{ background: theme.glow1 }} />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-[500px] w-[500px] rounded-full blur-[120px]" style={{ background: theme.glow2 }} />

      <div className="relative z-10 p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-black tracking-tight text-white">
              BPM <span style={{ color: theme.primary }}>检测实验室</span>
            </h1>
            <p className="mt-1 font-body text-sm text-white/40">验证节拍检测准确度 · 拖入音频实测</p>
          </div>
          <button
            onClick={onBack}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-ink-900/60 text-white/60 backdrop-blur-md transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[40%_1fr]">
          <section className="space-y-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className={`flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-6 transition ${dragOver ? "scale-[1.02]" : ""}`}
              style={{
                borderColor: dragOver ? theme.secondary : "rgba(255,255,255,0.12)",
                background: dragOver ? `${theme.secondary}11` : "rgba(255,255,255,0.02)",
              }}
            >
              <Upload className="h-7 w-7" style={{ color: dragOver ? theme.secondary : theme.primary }} />
              <div className="text-center">
                <div className="font-display text-sm font-bold text-white">
                  {dragOver ? "松开导入" : "拖入音频文件"}
                </div>
                <div className="mt-0.5 font-body text-[10px] text-white/35">MP3 / WAV / FLAC · 可多选</div>
              </div>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />

            <div className="space-y-2">
              {tracks.length === 0 && (
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6 text-center font-body text-xs text-white/30">
                  还没有检测数据
                </div>
              )}
              {tracks.map((t, i) => (
                <div
                  key={t.id}
                  className="rounded-xl border p-3 transition"
                  style={{
                    borderColor: currentIdx === i ? `${theme.primary}66` : "rgba(255,255,255,0.08)",
                    background: currentIdx === i ? `${theme.primary}11` : "rgba(255,255,255,0.02)",
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <Music className="h-3 w-3 shrink-0" style={{ color: theme.secondary }} />
                        <span className="truncate font-body text-xs text-white/80">{t.name}</span>
                      </div>
                      <div className="mt-0.5 font-body text-[9px] text-white/30">
                        {(t.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </div>
                    {t.status === "done" && (
                      <div className="text-right">
                        <div
                          className="font-display text-3xl font-black leading-none"
                          style={{ color: theme.primary, textShadow: `0 0 16px ${theme.primary}88` }}
                        >
                          {t.bpm}
                        </div>
                        <div className="font-body text-[8px] uppercase tracking-wider text-white/30">BPM</div>
                      </div>
                    )}
                  </div>

                  {t.status === "analyzing" && (
                    <div className="mt-2 flex items-center gap-1.5 font-body text-[10px] text-white/50">
                      <Loader2 className="h-3 w-3 animate-spin" style={{ color: theme.secondary }} />
                      分析中...
                    </div>
                  )}
                  {t.status === "pending" && (
                    <div className="mt-2 font-body text-[10px] text-white/30">排队中</div>
                  )}
                  {t.status === "error" && (
                    <div className="mt-2 flex items-center gap-1 font-body text-[10px] text-red-400">
                      <AlertCircle className="h-3 w-3" />
                      检测失败
                    </div>
                  )}

                  {t.status === "done" && (
                    <div className="mt-2">
                      <div className="mb-0.5 flex items-center justify-between font-body text-[9px]">
                        <span className="text-white/40">置信度</span>
                        <span style={{ color: t.confidence > 0.8 ? "#B6FF3C" : t.confidence > 0.5 ? "#FFC53D" : "#FF6B6B" }}>
                          {(t.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="h-1 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${t.confidence * 100}%`,
                            background:
                              t.confidence > 0.8
                                ? "linear-gradient(90deg, #B6FF3C, #00FFA3)"
                                : t.confidence > 0.5
                                ? "linear-gradient(90deg, #FFC53D, #FF6B1A)"
                                : "linear-gradient(90deg, #FF6B6B, #FF2D95)",
                          }}
                        />
                      </div>
                      {recommendedIdx === i && (
                        <div
                          className="mt-1.5 inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-display text-[8px] font-bold uppercase tracking-wider"
                          style={{ background: `${theme.accent}22`, color: theme.accent }}
                        >
                          <Play className="h-2 w-2" />
                          推荐下一首
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-ink-900/60 p-4 backdrop-blur-md">
              <div className="mb-2 flex items-center gap-2">
                <Activity className="h-3.5 w-3.5" style={{ color: theme.secondary }} />
                <span className="font-display text-xs font-bold uppercase tracking-widest text-white/70">实时频谱</span>
                <span className="ml-auto font-body text-[9px] text-white/30">低频区（&lt;150Hz）高亮</span>
              </div>
              <div className="h-40 w-full overflow-hidden rounded-lg bg-black/40">
                <canvas ref={canvasRef} className="h-full w-full" />
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-ink-900/60 p-4 backdrop-blur-md">
              <div className="mb-3 flex items-center gap-2">
                <Play className="h-3.5 w-3.5" style={{ color: theme.primary }} />
                <span className="font-display text-xs font-bold uppercase tracking-widest text-white/70">智能选曲模拟器</span>
              </div>

              {doneTracks.length === 0 ? (
                <div className="py-6 text-center font-body text-xs text-white/30">
                  先检测至少一首曲目
                </div>
              ) : (
                <>
                  <div className="mb-3 space-y-1">
                    {doneTracks.map((t) => {
                      const realIdx = tracks.indexOf(t);
                      const isCurrent = realIdx === currentIdx;
                      const isRec = realIdx === recommendedIdx;
                      return (
                        <button
                          key={t.id}
                          onClick={() => {
                            setCurrentIdx(realIdx);
                            setRecommendedIdx(-1);
                          }}
                          className="flex w-full items-center gap-2 rounded-lg border px-2 py-1.5 text-left transition"
                          style={{
                            borderColor: isCurrent
                              ? `${theme.primary}66`
                              : isRec
                              ? `${theme.accent}55`
                              : "rgba(255,255,255,0.06)",
                            background: isCurrent
                              ? `${theme.primary}11`
                              : isRec
                              ? `${theme.accent}11`
                              : "transparent",
                          }}
                        >
                          <span
                            className="w-8 text-center font-display text-sm font-bold"
                            style={{ color: isCurrent ? theme.primary : isRec ? theme.accent : "rgba(255,255,255,0.4)" }}
                          >
                            {t.bpm}
                          </span>
                          <span className="flex-1 truncate font-body text-xs text-white/70">{t.name}</span>
                          {isCurrent && (
                            <span className="font-display text-[8px] font-bold uppercase" style={{ color: theme.primary }}>
                              当前
                            </span>
                          )}
                          {isRec && (
                            <span className="font-display text-[8px] font-bold uppercase" style={{ color: theme.accent }}>
                              推荐
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={simulateNext}
                    disabled={currentIdx < 0}
                    className="w-full rounded-lg py-2 font-display text-xs font-bold text-ink-900 transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
                    style={{
                      background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                      boxShadow: currentIdx >= 0 ? `0 0 16px ${theme.primary}44` : "none",
                    }}
                  >
                    模拟下一首（按 BPM 匹配）
                  </button>

                  {recommended && current && (
                    <div
                      className="mt-3 rounded-lg border p-2.5 font-body text-xs"
                      style={{ borderColor: `${theme.accent}33`, background: `${theme.accent}08`, color: "rgba(255,255,255,0.7)" }}
                    >
                      当前 <span style={{ color: theme.primary }} className="font-bold">{current.bpm}</span> BPM
                      {" -> "}推荐 <span style={{ color: theme.accent }} className="font-bold">{recommended.bpm}</span> BPM
                      <span className="text-white/40"> (距离 {Math.abs(current.bpm - recommended.bpm)})</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </section>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-ink-900/60 p-3 backdrop-blur-md">
          <div className="flex items-center gap-1.5 font-body text-xs">
            <span className="text-white/40">已检测</span>
            <span className="font-bold text-white">{doneTracks.length}</span>
          </div>
          <div className="h-3 w-px bg-white/10" />
          <div className="flex items-center gap-1.5 font-body text-xs">
            <span className="text-white/40">BPM 范围</span>
            <span className="font-bold" style={{ color: theme.secondary }}>
              {bpmValues.length ? `${minBpm} - ${maxBpm}` : "-"}
            </span>
          </div>
          <div className="h-3 w-px bg-white/10" />
          <div className="flex items-center gap-1.5 font-body text-xs">
            <span className="text-white/40">平均置信度</span>
            <span className="font-bold" style={{ color: avgConf > 0.8 ? "#B6FF3C" : avgConf > 0.5 ? "#FFC53D" : "#FF6B6B" }}>
              {doneTracks.length ? `${(avgConf * 100).toFixed(0)}%` : "-"}
            </span>
          </div>
          <button
            onClick={exportJson}
            disabled={tracks.length === 0}
            className="ml-auto flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 font-body text-xs text-white/60 transition hover:text-white disabled:opacity-30"
          >
            <Download className="h-3.5 w-3.5" />
            导出 JSON
          </button>
        </div>
      </div>
    </div>
  );
}
