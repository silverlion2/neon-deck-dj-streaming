import {
  playKick,
  playSnare,
  playHat,
  playClap,
  playBass,
  playFx,
} from "./synths";
import type { PresetConfig, PresetId } from "./presets";

export type PadId = "KICK" | "SNARE" | "HAT" | "CLAP" | "BASS" | "RISER" | "VOCAL" | "FX";

const PAD_ORDER: PadId[] = ["KICK", "SNARE", "HAT", "CLAP", "BASS", "RISER", "VOCAL", "FX"];

export interface PlayState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  src: string | null;
  title: string;
}

export interface EqBands {
  low: number;
  mid: number;
  high: number;
}

const DEFAULT_EQ: EqBands = { low: 0, mid: 0, high: 0 };

class AudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private preset: PresetConfig | null = null;
  private muted = false;
  private volume = 0.7;

  private audioEl: HTMLAudioElement | null = null;
  private mediaSource: MediaElementAudioSourceNode | null = null;
  private musicGain: GainNode | null = null;
  private eqLow: BiquadFilterNode | null = null;
  private eqMid: BiquadFilterNode | null = null;
  private eqHigh: BiquadFilterNode | null = null;
  private eqValues: EqBands = { ...DEFAULT_EQ };
  private listeners: Set<(s: PlayState) => void> = new Set();

  private fadeRaf = 0;
  private crossfading = false;

  ensure() {
    if (!this.ctx) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : this.volume;
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 512;
      this.analyser.smoothingTimeConstant = 0.8;

      this.eqLow = this.ctx.createBiquadFilter();
      this.eqLow.type = "lowshelf";
      this.eqLow.frequency.value = 200;
      this.eqLow.gain.value = 0;

      this.eqMid = this.ctx.createBiquadFilter();
      this.eqMid.type = "peaking";
      this.eqMid.frequency.value = 1000;
      this.eqMid.Q.value = 1;
      this.eqMid.gain.value = 0;

      this.eqHigh = this.ctx.createBiquadFilter();
      this.eqHigh.type = "highshelf";
      this.eqHigh.frequency.value = 4000;
      this.eqHigh.gain.value = 0;

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = 1;

      this.master.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);

      this.audioEl = new Audio();
      this.audioEl.crossOrigin = "anonymous";
      this.audioEl.preload = "auto";
      this.mediaSource = this.ctx.createMediaElementSource(this.audioEl);
      this.mediaSource.connect(this.eqLow);
      this.eqLow.connect(this.eqMid);
      this.eqMid.connect(this.eqHigh);
      this.eqHigh.connect(this.musicGain);
      this.musicGain.connect(this.master);

      this.audioEl.addEventListener("timeupdate", () => this.emit());
      this.audioEl.addEventListener("play", () => this.emit());
      this.audioEl.addEventListener("pause", () => this.emit());
      this.audioEl.addEventListener("loadedmetadata", () => this.emit());
      this.audioEl.addEventListener("ended", () => this.emit());
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
    return this.ctx;
  }

  setPreset(p: PresetConfig) {
    this.preset = p;
  }

  setVolume(v: number) {
    this.volume = v;
    if (this.master && !this.muted) this.master.gain.value = v;
  }

  setMuted(m: boolean) {
    this.muted = m;
    if (this.master) this.master.gain.value = m ? 0 : this.volume;
  }

  setEq(band: keyof EqBands, gain: number) {
    this.eqValues[band] = gain;
    if (!this.ctx) return;
    const db = gain * 12;
    if (band === "low" && this.eqLow) this.eqLow.gain.setTargetAtTime(db, this.ctx.currentTime, 0.05);
    if (band === "mid" && this.eqMid) this.eqMid.gain.setTargetAtTime(db, this.ctx.currentTime, 0.05);
    if (band === "high" && this.eqHigh) this.eqHigh.gain.setTargetAtTime(db, this.ctx.currentTime, 0.05);
  }

  getEq() {
    return { ...this.eqValues };
  }

  resetEq() {
    this.eqValues = { ...DEFAULT_EQ };
    this.setEq("low", 0);
    this.setEq("mid", 0);
    this.setEq("high", 0);
  }

  getAnalyser() {
    return this.analyser;
  }

  getAudioEl() {
    return this.audioEl;
  }

  loadTrack(src: string, title: string) {
    this.ensure();
    if (!this.audioEl) return;
    this.audioEl.src = src;
    this.audioEl.title = title;
    this.audioEl.load();
    this.emit();
  }

  playMusic() {
    this.ensure();
    if (!this.audioEl) return;
    void this.audioEl.play();
  }

  pauseMusic() {
    if (!this.audioEl) return;
    this.audioEl.pause();
  }

  seekMusic(time: number) {
    if (!this.audioEl) return;
    this.audioEl.currentTime = time;
  }

  crossfadeTo(src: string, title: string, duration = 3, onDone?: () => void) {
    this.ensure();
    if (!this.ctx || !this.musicGain || !this.audioEl) return;
    if (this.crossfading) return;
    this.crossfading = true;
    const ctx = this.ctx;
    const gain = this.musicGain.gain;
    const startTime = ctx.currentTime;
    const startGain = gain.value;

    gain.cancelScheduledValues(startTime);
    gain.setValueAtTime(startGain, startTime);
    gain.linearRampToValueAtTime(0.001, startTime + duration);

    const step = () => {
      const elapsed = ctx.currentTime - startTime;
      if (elapsed >= duration) {
        this.audioEl!.src = src;
        this.audioEl!.title = title;
        this.audioEl!.load();
        void this.audioEl!.play();
        gain.setValueAtTime(0.001, ctx.currentTime);
        gain.linearRampToValueAtTime(1, ctx.currentTime + duration * 0.8);
        setTimeout(() => {
          this.crossfading = false;
          onDone?.();
        }, duration * 800);
        return;
      }
      this.fadeRaf = requestAnimationFrame(step);
    };
    this.fadeRaf = requestAnimationFrame(step);
  }

  isCrossfading() {
    return this.crossfading;
  }

  getPlayState(): PlayState {
    const el = this.audioEl;
    return {
      isPlaying: el ? !el.paused : false,
      currentTime: el?.currentTime ?? 0,
      duration: el?.duration ?? 0,
      src: el?.src ?? null,
      title: el?.title ?? "",
    };
  }

  subscribe(cb: (s: PlayState) => void) {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private emit() {
    const s = this.getPlayState();
    this.listeners.forEach((cb) => cb(s));
  }

  playPad(padIndex: number) {
    const ctx = this.ensure();
    if (!this.preset || !this.master) return;
    const p = this.preset;
    const dest = this.master;
    const id = PAD_ORDER[padIndex];
    switch (id) {
      case "KICK":
        playKick(ctx, dest, p.kick);
        break;
      case "SNARE":
        playSnare(ctx, dest, p.snare);
        break;
      case "HAT":
        playHat(ctx, dest, p.hat);
        break;
      case "CLAP":
        playClap(ctx, dest, p.clap);
        break;
      case "BASS":
      case "RISER":
        playBass(ctx, dest, { ...p.bass, freq: id === "RISER" ? p.bass.freq * 2 : p.bass.freq });
        break;
      case "VOCAL":
        playSnare(ctx, dest, { ...p.snare, tone: p.snare.tone * 1.5, noiseGain: 0.2 });
        break;
      case "FX":
        playFx(ctx, dest, p.fx);
        break;
    }
  }

  playBeatTick() {
    if (!this.preset) return;
    const ctx = this.ensure();
    if (!this.master) return;
    playHat(ctx, this.master, { ...this.preset.hat, gain: this.preset.hat.gain * 0.4, decay: 0.03 });
  }
}

export const audioEngine = new AudioEngine();
export { PAD_ORDER };
export type { PresetId };
