import { create } from "zustand";
import { TRACKS } from "@/data/tracks";
import type { Track } from "@/types";
import { useQueueStore } from "@/store/useQueueStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { audioEngine } from "@/audio/AudioEngine";

interface LiveState {
  isPlaying: boolean;
  trackIndex: number;
  currentTrack: Track;
  nextTrack: Track;
  bpm: number;
  progress: number;
  volume: number;
  crossfader: number;
  beat: number;
  effectPulse: number;
  transitioning: boolean;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  playTrack: (track: Track) => void;
  seek: (sec: number) => void;
  setVolume: (v: number) => void;
  setCrossfader: (v: number) => void;
  setBpm: (v: number) => void;
  tick: (delta: number) => void;
  pulseBeat: () => void;
  triggerEffect: () => void;
}

const pickNextTrack = (currentId: string): Track => {
  const queued = useQueueStore.getState().queue[0]?.track;
  if (queued && queued.id !== currentId) return queued;
  const idx = TRACKS.findIndex((t) => t.id === currentId);
  return TRACKS[(idx + 1) % TRACKS.length];
};

const loadTrack = (track: Track) => ({
  currentTrack: track,
  bpm: track.bpm,
  progress: 0,
});

export const useLiveStore = create<LiveState>((set, get) => ({
  isPlaying: true,
  trackIndex: 0,
  ...loadTrack(TRACKS[0]),
  nextTrack: TRACKS[1],
  volume: 78,
  crossfader: 50,
  beat: 0,
  effectPulse: 0,
  transitioning: false,

  toggle: () => set((s) => ({ isPlaying: !s.isPlaying })),
  next: () => {
    const { nextTrack } = get();
    const queued = useQueueStore.getState().consumeNext();
    const toPlay = queued ?? nextTrack;
    const idx = TRACKS.findIndex((t) => t.id === toPlay.id);
    set({
      ...loadTrack(toPlay),
      trackIndex: idx >= 0 ? idx : get().trackIndex,
      nextTrack: pickNextTrack(toPlay.id),
      crossfader: 50,
    });
  },
  prev: () => {
    const idx = (get().trackIndex - 1 + TRACKS.length) % TRACKS.length;
    const track = TRACKS[idx];
    set({ ...loadTrack(track), trackIndex: idx, nextTrack: pickNextTrack(track.id) });
  },
  playTrack: (track) => {
    const idx = TRACKS.findIndex((t) => t.id === track.id);
    set({
      ...loadTrack(track),
      trackIndex: idx >= 0 ? idx : get().trackIndex,
      isPlaying: true,
      nextTrack: pickNextTrack(track.id),
    });
  },
  seek: (sec) => set({ progress: Math.max(0, sec) }),
  setVolume: (v) => {
    audioEngine.setVolume(v / 100);
    set({ volume: v });
  },
  setCrossfader: (v) => set({ crossfader: v }),
  setBpm: (v) => set({ bpm: v }),
  tick: (delta) => {
    const { isPlaying, currentTrack, progress, volume } = get();
    if (!isPlaying) return;
    audioEngine.setVolume(volume / 100);
    const autoDj = useSettingsStore.getState().autoDj;
    const remain = currentTrack.duration - progress;

    if (autoDj && remain < 12 && remain > 0) {
      const blend = 50 + (1 - remain / 12) * 50;
      set({ progress: progress + delta, crossfader: blend, transitioning: true });
      return;
    }
    if (progress + delta >= currentTrack.duration) {
      get().next();
      set({ transitioning: false });
    } else {
      set({ progress: progress + delta, transitioning: false });
    }
  },
  pulseBeat: () => set((s) => ({ beat: s.beat + 1 })),
  triggerEffect: () => set((s) => ({ effectPulse: s.effectPulse + 1 })),
}));
