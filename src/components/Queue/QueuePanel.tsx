import { useState } from "react";
import { ListMusic, Flame, Plus, X, Play, ThumbsUp, Search } from "lucide-react";
import { useQueueStore } from "@/store/useQueueStore";
import { useLiveStore } from "@/store/useLiveStore";
import { NeonPanel } from "@/components/shared/NeonPanel";
import { TRACKS } from "@/data/tracks";
import { formatTime } from "@/utils/format";

export function QueuePanel() {
  const { queue, hot, addRequest, removeRequest, vote } = useQueueStore();
  const { currentTrack, playTrack } = useLiveStore();
  const [query, setQuery] = useState("");

  const filtered = query
    ? TRACKS.filter(
        (t) =>
          t.title.toLowerCase().includes(query.toLowerCase()) ||
          t.artist.toLowerCase().includes(query.toLowerCase())
      )
    : hot;

  return (
    <NeonPanel
      title="点歌系统"
      accent="cyan"
      icon={<ListMusic className="h-3.5 w-3.5" />}
      className="h-full"
    >
      <div className="flex h-full flex-col">
        <div className="border-b border-white/5 p-3">
          <div className="mb-2 flex items-center gap-2">
            <img
              src={currentTrack.cover}
              alt={currentTrack.title}
              className="h-11 w-11 rounded-md border border-neon-magenta/40 object-cover shadow-neon-magenta"
            />
            <div className="min-w-0 flex-1">
              <div className="font-body text-[9px] uppercase tracking-widest text-neon-magenta">
                正在播放
              </div>
              <div className="truncate font-display text-xs font-bold text-white">
                {currentTrack.title}
              </div>
              <div className="font-body text-[10px] text-white/40">
                {currentTrack.artist} · {formatTime(currentTrack.duration)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-ink-900/60 px-2">
            <Search className="h-3.5 w-3.5 text-white/30" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索歌曲 / 艺人点歌…"
              className="h-8 flex-1 bg-transparent font-body text-xs text-white placeholder:text-white/30 focus:outline-none"
            />
          </div>
        </div>

        <div className="scrollbar-thin flex-1 overflow-y-auto px-3 py-2">
          <div className="mb-1 flex items-center justify-between">
            <span className="font-display text-[9px] font-bold uppercase tracking-widest text-white/40">
              队列 · {queue.length}
            </span>
          </div>
          {queue.length === 0 && (
            <div className="py-4 text-center font-body text-[11px] text-white/30">
              队列为空，点一首吧
            </div>
          )}
          {queue.map((q, i) => (
            <div
              key={q.track.id}
              className="group mb-1 flex items-center gap-2 rounded-lg px-1.5 py-1.5 transition hover:bg-white/5"
            >
              <span className="w-4 text-center font-display text-[10px] font-bold text-white/30">
                {i + 1}
              </span>
              <img src={q.track.cover} alt="" className="h-8 w-8 rounded object-cover" />
              <div className="min-w-0 flex-1">
                <div className="truncate font-body text-xs font-semibold text-white/85">
                  {q.track.title}
                </div>
                <div className="truncate font-body text-[10px] text-white/35">
                  {q.requestedBy} · {q.track.bpm}BPM
                </div>
              </div>
              <button
                onClick={() => vote(q.track.id)}
                className="flex items-center gap-0.5 rounded px-1 py-0.5 text-neon-lime transition hover:bg-neon-lime/10"
              >
                <ThumbsUp className="h-3 w-3" />
                <span className="font-display text-[10px] font-bold tabular-nums">{q.votes}</span>
              </button>
              <button
                onClick={() => playTrack(q.track)}
                className="flex h-6 w-6 items-center justify-center rounded text-neon-cyan opacity-0 transition hover:bg-neon-cyan/10 group-hover:opacity-100"
              >
                <Play className="h-3 w-3" />
              </button>
              <button
                onClick={() => removeRequest(q.track.id)}
                className="flex h-6 w-6 items-center justify-center rounded text-white/30 opacity-0 transition hover:bg-white/10 hover:text-neon-magenta group-hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}

          <div className="mb-1 mt-3 flex items-center gap-1.5">
            <Flame className="h-3 w-3 text-neon-gold" />
            <span className="font-display text-[9px] font-bold uppercase tracking-widest text-white/40">
              {query ? "搜索结果" : "热门点歌"}
            </span>
          </div>
          {filtered.map((t) => (
            <div
              key={t.id}
              className="group mb-1 flex items-center gap-2 rounded-lg px-1.5 py-1.5 transition hover:bg-white/5"
            >
              <img src={t.cover} alt="" className="h-8 w-8 rounded object-cover" />
              <div className="min-w-0 flex-1">
                <div className="truncate font-body text-xs font-semibold text-white/85">
                  {t.title}
                </div>
                <div className="truncate font-body text-[10px] text-white/35">
                  {t.artist} · {t.genre}
                </div>
              </div>
              <button
                onClick={() => addRequest(t)}
                className="flex items-center gap-0.5 rounded-md border border-neon-cyan/30 bg-neon-cyan/5 px-1.5 py-0.5 text-neon-cyan transition hover:bg-neon-cyan/15 active:scale-95"
              >
                <Plus className="h-3 w-3" />
                <span className="font-display text-[9px] font-bold uppercase">点歌</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </NeonPanel>
  );
}
