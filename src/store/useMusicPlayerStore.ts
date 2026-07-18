import { create } from "zustand";
import { audioEngine, type PlayState, type EqBands } from "@/audio/AudioEngine";
import { detectBpm, pickNextByBpm, type BpmCandidate } from "@/audio/bpmDetect";

export interface MusicFile {
  id: string;
  name: string;
  url: string;
  size: number;
  duration?: number;
  bpm?: number;
  bpmConfidence?: number;
}

interface MusicPlayerState {
  playlist: MusicFile[];
  currentIndex: number;
  playState: PlayState;
  eq: EqBands;
  autoMix: boolean;
  obsMode: boolean;
  addFiles: (files: FileList | File[]) => void;
  removeFile: (id: string) => void;
  playIndex: (index: number) => void;
  togglePlay: () => void;
  next: () => void;
  prev: () => void;
  seek: (time: number) => void;
  clearPlaylist: () => void;
  setEq: (band: keyof EqBands, value: number) => void;
  resetEq: () => void;
  toggleAutoMix: () => void;
  toggleObsMode: () => void;
  setBpm: (id: string, bpm: number, confidence: number) => void;
  hydrate: () => void;
}

const initialPlayState: PlayState = {
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  src: null,
  title: "",
};

const DEFAULT_EQ: EqBands = { low: 0, mid: 0, high: 0 };

const STORAGE_KEY = "neon-deck-session";

interface SessionData {
  vibeThemeId: string;
  vibePresetId: string;
  volume: number;
  visualMode: string;
  autoMix: boolean;
  eq: EqBands;
}

export function saveSession(data: SessionData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export function loadSession(): SessionData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SessionData;
  } catch {
    return null;
  }
}

let unsubEngine: (() => void) | null = null;

export const useMusicPlayerStore = create<MusicPlayerState>((set, get) => {
  if (!unsubEngine) {
    unsubEngine = audioEngine.subscribe((ps) => {
      set({ playState: ps });
      if (!ps.isPlaying && ps.currentTime >= ps.duration && ps.duration > 0 && ps.src) {
        get().next();
      }
    });
  }

  return {
    playlist: [],
    currentIndex: -1,
    playState: initialPlayState,
    eq: { ...DEFAULT_EQ },
    autoMix: true,
    obsMode: false,

    addFiles: (files) => {
      const audioFiles = Array.from(files).filter((f) => f.type.startsWith("audio/"));
      const newFiles: MusicFile[] = audioFiles.map((f) => ({
        id: `m_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        name: f.name.replace(/\.[^.]+$/, ""),
        url: URL.createObjectURL(f),
        size: f.size,
      }));
      if (newFiles.length === 0) return;

      audioFiles.forEach((file, i) => {
        detectBpm(file).then((res) => {
          if (res.bpm > 0) get().setBpm(newFiles[i].id, res.bpm, res.confidence);
        });
      });

      set((s) => {
        const playlist = [...s.playlist, ...newFiles];
        const shouldAutoPlay = s.currentIndex === -1;
        if (shouldAutoPlay) {
          audioEngine.loadTrack(newFiles[0].url, newFiles[0].name);
          audioEngine.playMusic();
          return { playlist, currentIndex: 0 };
        }
        return { playlist };
      });
    },

    removeFile: (id) =>
      set((s) => {
        const idx = s.playlist.findIndex((f) => f.id === id);
        if (idx < 0) return s;
        URL.revokeObjectURL(s.playlist[idx].url);
        const playlist = s.playlist.filter((f) => f.id !== id);
        let currentIndex = s.currentIndex;
        if (idx < s.currentIndex) currentIndex--;
        if (idx === s.currentIndex) {
          if (playlist.length === 0) {
            audioEngine.pauseMusic();
            currentIndex = -1;
          } else {
            const newIdx = Math.min(currentIndex, playlist.length - 1);
            currentIndex = newIdx;
            audioEngine.loadTrack(playlist[newIdx].url, playlist[newIdx].name);
            audioEngine.playMusic();
          }
        }
        return { playlist, currentIndex };
      }),

    playIndex: (index) =>
      set((s) => {
        if (index < 0 || index >= s.playlist.length) return s;
        const file = s.playlist[index];
        audioEngine.loadTrack(file.url, file.name);
        audioEngine.playMusic();
        return { currentIndex: index };
      }),

    togglePlay: () => {
      const ps = get().playState;
      if (ps.isPlaying) audioEngine.pauseMusic();
      else audioEngine.playMusic();
    },

    next: () =>
      set((s) => {
        if (s.playlist.length === 0) return s;
        let nextIdx = (s.currentIndex + 1) % s.playlist.length;
        const currentFile = s.currentIndex >= 0 ? s.playlist[s.currentIndex] : null;
        if (s.autoMix && currentFile?.bpm && currentFile.bpm > 0) {
          const candidates: BpmCandidate[] = s.playlist
            .map((f, i) => ({ bpm: f.bpm ?? 0, index: i }))
            .filter((c) => c.bpm > 0 && c.index !== s.currentIndex);
          if (candidates.length > 0) {
            const picked = pickNextByBpm(currentFile.bpm, candidates);
            if (picked >= 0) nextIdx = picked;
          }
        }
        const file = s.playlist[nextIdx];
        if (s.autoMix && s.playState.isPlaying && !audioEngine.isCrossfading()) {
          audioEngine.crossfadeTo(file.url, file.name, 3, () => {
            set({ currentIndex: nextIdx });
          });
        } else {
          audioEngine.loadTrack(file.url, file.name);
          audioEngine.playMusic();
          return { currentIndex: nextIdx };
        }
        return s;
      }),

    prev: () =>
      set((s) => {
        if (s.playlist.length === 0) return s;
        const prevIdx = (s.currentIndex - 1 + s.playlist.length) % s.playlist.length;
        const file = s.playlist[prevIdx];
        audioEngine.loadTrack(file.url, file.name);
        audioEngine.playMusic();
        return { currentIndex: prevIdx };
      }),

    seek: (time) => audioEngine.seekMusic(time),

    clearPlaylist: () => {
      const { playlist } = get();
      playlist.forEach((f) => URL.revokeObjectURL(f.url));
      audioEngine.pauseMusic();
      set({ playlist: [], currentIndex: -1 });
    },

    setEq: (band, value) => {
      audioEngine.setEq(band, value);
      set((s) => ({ eq: { ...s.eq, [band]: value } }));
    },

    resetEq: () => {
      audioEngine.resetEq();
      set({ eq: { ...DEFAULT_EQ } });
    },

    toggleAutoMix: () => set((s) => ({ autoMix: !s.autoMix })),
    toggleObsMode: () => set((s) => ({ obsMode: !s.obsMode })),
    setBpm: (id, bpm, confidence) => {
      set((s) => ({
        playlist: s.playlist.map((f) =>
          f.id === id ? { ...f, bpm, bpmConfidence: confidence } : f
        ),
      }));
    },

    hydrate: () => {
      const data = loadSession();
      if (data) {
        if (data.eq) {
          audioEngine.setEq("low", data.eq.low);
          audioEngine.setEq("mid", data.eq.mid);
          audioEngine.setEq("high", data.eq.high);
        }
        set({
          autoMix: data.autoMix ?? true,
          eq: data.eq ?? { ...DEFAULT_EQ },
        });
      }
    },
  };
});
