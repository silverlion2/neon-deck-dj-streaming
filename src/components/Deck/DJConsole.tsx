import { Play, Pause, SkipForward, SkipBack, SlidersHorizontal, Grid3x3, Activity, Volume2, VolumeX, Repeat } from "lucide-react";
import { useLiveStore } from "@/store/useLiveStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { NeonPanel } from "@/components/shared/NeonPanel";
import { Turntable } from "./Turntable";
import { Slider } from "./Slider";
import { PadGrid } from "./PadGrid";
import { PresetSwitcher } from "./PresetSwitcher";

export function DJConsole() {
  const { currentTrack, nextTrack, isPlaying, toggle, next, prev, bpm, volume, crossfader, setVolume, setCrossfader, beat } =
    useLiveStore();
  const { muted, toggleMute, autoDj, toggleAutoDj, theme } = useSettingsStore();

  return (
    <NeonPanel
      title="DJ 控制台"
      accent="lime"
      icon={<SlidersHorizontal className="h-3.5 w-3.5" />}
      className="shrink-0"
      action={
        <div className="flex items-center gap-1">
          <button
            onClick={toggleMute}
            title={muted ? "取消静音" : "静音"}
            className="flex h-6 w-6 items-center justify-center rounded transition"
            style={{ color: muted ? "rgba(255,255,255,0.3)" : theme.secondary }}
          >
            {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
          </button>
          <button
            onClick={toggleAutoDj}
            title="自动 DJ"
            className="flex items-center gap-1 rounded px-1.5 py-0.5 transition"
            style={{
              background: autoDj ? `${theme.accent}22` : "transparent",
              border: `1px solid ${autoDj ? theme.accent : "rgba(255,255,255,0.1)"}`,
              color: autoDj ? theme.accent : "rgba(255,255,255,0.4)",
            }}
          >
            <Repeat className="h-3 w-3" />
            <span className="font-display text-[9px] font-bold uppercase tracking-widest">AutoDJ</span>
          </button>
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-3 p-3 lg:grid-cols-[auto_auto_1fr_auto]">
        <div className="flex items-center justify-center gap-6">
          <Turntable side="A" track={currentTrack} isPlaying={isPlaying} active beat={beat} />
          <Turntable side="B" track={nextTrack} isPlaying={isPlaying} active={crossfader > 50} beat={beat} />
        </div>

        <div className="flex items-end justify-center gap-5 border-y border-white/5 py-3 lg:border-x lg:border-y-0">
          <Slider label="VOL A" value={volume} onChange={setVolume} orientation="vertical" color={theme.primary} />
          <Slider
            label="VOL B"
            value={Math.round(volume * (crossfader / 100))}
            onChange={() => {}}
            orientation="vertical"
            color={theme.secondary}
          />
          <Slider label="HIGH" value={62} onChange={() => {}} orientation="vertical" color={theme.accent} heightClass="h-24" />
          <Slider label="LOW" value={78} onChange={() => {}} orientation="vertical" color="#FFC53D" heightClass="h-24" />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between rounded-lg border border-white/10 bg-ink-900/50 px-3 py-2">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4" style={{ color: theme.accent }} />
              <div>
                <div className="font-body text-[9px] uppercase tracking-widest text-white/40">BPM</div>
                <div className="font-wave text-xl" style={{ color: theme.accent }}>
                  {bpm}
                  <span className="ml-1 text-[10px] text-white/30">{"->"} {nextTrack.bpm}</span>
                </div>
              </div>
            </div>
            <div className="flex items-end gap-0.5">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-1 rounded-full"
                  style={{
                    height: 6 + (beat % 4 === i ? 14 : 0),
                    background: theme.accent,
                    opacity: beat % 4 === i ? 1 : 0.3,
                    transition: "all 0.1s",
                  }}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-display text-[9px] font-bold uppercase tracking-widest" style={{ color: theme.primary }}>
              A
            </span>
            <div className="flex-1">
              <Slider value={crossfader} onChange={setCrossfader} orientation="horizontal" color={theme.primary} />
            </div>
            <span className="font-display text-[9px] font-bold uppercase tracking-widest" style={{ color: theme.secondary }}>
              B
            </span>
          </div>

          <div className="flex items-center justify-center gap-1.5">
            <button
              onClick={prev}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/70 transition hover:border-white/30 hover:text-white active:scale-95"
            >
              <SkipBack className="h-4 w-4" />
            </button>
            <button
              onClick={toggle}
              className="flex h-10 w-12 items-center justify-center rounded-lg text-ink-900 transition active:scale-95"
              style={{
                background: `linear-gradient(135deg, ${theme.accent}, ${theme.secondary})`,
                boxShadow: `0 0 16px ${theme.accent}88`,
              }}
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </button>
            <button
              onClick={next}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/70 transition hover:border-white/30 hover:text-white active:scale-95"
            >
              <SkipForward className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5">
            <Grid3x3 className="h-3.5 w-3.5" style={{ color: theme.primary }} />
            <span className="font-display text-[10px] font-bold uppercase tracking-widest text-white/50">SAMPLER</span>
          </div>
          <PadGrid />
          <PresetSwitcher />
        </div>
      </div>
    </NeonPanel>
  );
}
