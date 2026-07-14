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

class AudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private preset: PresetConfig | null = null;
  private muted = false;
  private volume = 0.7;

  ensure() {
    if (!this.ctx) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : this.volume;
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 256;
      this.master.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
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

  getAnalyser() {
    return this.analyser;
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
