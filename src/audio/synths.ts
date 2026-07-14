import type { PresetConfig } from "./presets";

type Ctx = AudioContext;

export function makeNoise(ctx: Ctx, duration: number) {
  const len = Math.floor(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  return src;
}

function env(ctx: Ctx, gain: GainNode, t: number, peak: number, decay: number) {
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(peak, t + 0.002);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + decay);
}

export function playKick(ctx: Ctx, dest: AudioNode, p: PresetConfig["kick"], t = 0) {
  const now = ctx.currentTime + t;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(p.freqStart, now);
  osc.frequency.exponentialRampToValueAtTime(p.freqEnd, now + p.decay);
  env(ctx, gain, now, p.gain, p.decay);
  osc.connect(gain).connect(dest);
  osc.start(now);
  osc.stop(now + p.decay + 0.05);
  if (p.click) {
    const click = ctx.createOscillator();
    const cg = ctx.createGain();
    click.type = "square";
    click.frequency.value = 1800;
    env(ctx, cg, now, 0.25, 0.02);
    click.connect(cg).connect(dest);
    click.start(now);
    click.stop(now + 0.03);
  }
}

export function playSnare(ctx: Ctx, dest: AudioNode, p: PresetConfig["snare"], t = 0) {
  const now = ctx.currentTime + t;
  const noise = makeNoise(ctx, p.decay);
  const hp = ctx.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 1200;
  const ng = ctx.createGain();
  env(ctx, ng, now, p.noiseGain, p.decay);
  noise.connect(hp).connect(ng).connect(dest);
  noise.start(now);
  noise.stop(now + p.decay + 0.05);

  const osc = ctx.createOscillator();
  const og = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(p.tone, now);
  osc.frequency.exponentialRampToValueAtTime(p.tone * 0.6, now + p.decay);
  env(ctx, og, now, p.toneGain, p.decay * 0.7);
  osc.connect(og).connect(dest);
  osc.start(now);
  osc.stop(now + p.decay + 0.05);
}

export function playHat(ctx: Ctx, dest: AudioNode, p: PresetConfig["hat"], t = 0) {
  const now = ctx.currentTime + t;
  const noise = makeNoise(ctx, p.decay);
  const hp = ctx.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = p.freq;
  const g = ctx.createGain();
  env(ctx, g, now, p.gain, p.decay);
  noise.connect(hp).connect(g).connect(dest);
  noise.start(now);
  noise.stop(now + p.decay + 0.05);
}

export function playClap(ctx: Ctx, dest: AudioNode, p: PresetConfig["clap"], t = 0) {
  const now = ctx.currentTime + t;
  [0, 0.012, 0.024, 0.04].forEach((off, i) => {
    const noise = makeNoise(ctx, p.decay);
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 1500;
    bp.Q.value = 1.2;
    const g = ctx.createGain();
    const peak = i === 3 ? p.gain : p.gain * 0.6;
    env(ctx, g, now + off, peak, p.decay);
    noise.connect(bp).connect(g).connect(dest);
    noise.start(now + off);
    noise.stop(now + off + p.decay + 0.05);
  });
}

export function playBass(ctx: Ctx, dest: AudioNode, p: PresetConfig["bass"], t = 0) {
  const now = ctx.currentTime + t;
  const osc = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const g = ctx.createGain();
  osc.type = p.type;
  osc.frequency.value = p.freq;
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(200, now);
  filter.frequency.exponentialRampToValueAtTime(2000, now + 0.05);
  filter.frequency.exponentialRampToValueAtTime(200, now + p.decay);
  filter.Q.value = p.resonance;
  env(ctx, g, now, 0.7, p.decay);
  osc.connect(filter).connect(g).connect(dest);
  osc.start(now);
  osc.stop(now + p.decay + 0.05);
}

export function playFx(ctx: Ctx, dest: AudioNode, p: PresetConfig["fx"], t = 0) {
  const now = ctx.currentTime + t;
  const noise = makeNoise(ctx, p.decay);
  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.setValueAtTime(p.sweepFrom, now);
  bp.frequency.exponentialRampToValueAtTime(p.sweepTo, now + p.decay);
  bp.Q.value = 6;
  const g = ctx.createGain();
  env(ctx, g, now, 0.4, p.decay);
  noise.connect(bp).connect(g).connect(dest);
  noise.start(now);
  noise.stop(now + p.decay + 0.05);
}
