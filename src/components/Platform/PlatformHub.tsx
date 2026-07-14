import { usePlatformStore } from "@/store/usePlatformStore";
import { NeonPanel } from "@/components/shared/NeonPanel";
import { Search, Link2, Unlink, Plus, Music, ListMusic, Plug } from "lucide-react";
import type { PlatformId } from "@/data/platforms";
import { TRACKS } from "@/data/tracks";
import { formatTime } from "@/utils/format";

const PLATFORM_LABEL: Record<PlatformId, string> = {
  spotify: "Spotify",
  apple: "Apple",
  netease: "网易云",
  qqmusic: "QQ",
  soundcloud: "SoundCloud",
};

export function PlatformHub() {
  const {
    platforms,
    playlists,
    searchResults,
    query,
    searching,
    activePlatform,
    connect,
    disconnect,
    setQuery,
    setActivePlatform,
    search,
    importToQueue,
    importPlaylist,
  } = usePlatformStore();

  const handleSearch = () => search();

  return (
    <NeonPanel title="音乐平台对接" accent="cyan" icon={<Plug className="h-3.5 w-3.5" />} className="h-full">
      <div className="flex h-full flex-col">
        <div className="border-b border-white/5 p-3">
          <div className="mb-2 grid grid-cols-5 gap-1.5">
            {platforms.map((p) => (
              <button
                key={p.id}
                onClick={() => (p.connected ? disconnect(p.id) : connect(p.id))}
                title={p.name}
                className="group relative flex flex-col items-center gap-1 rounded-lg border py-1.5 transition active:scale-95"
                style={{
                  borderColor: p.connected ? `${p.color}80` : "rgba(255,255,255,0.08)",
                  background: p.connected ? `${p.color}1a` : "rgba(255,255,255,0.03)",
                }}
              >
                <span
                  className="flex h-6 w-6 items-center justify-center rounded-md font-display text-[9px] font-bold text-white"
                  style={{ background: p.color }}
                >
                  {p.short}
                </span>
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: p.connected ? p.color : "rgba(255,255,255,0.2)" }}
                />
                {p.connected && (
                  <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-neon-lime text-ink-900">
                    <Link2 className="h-2.5 w-2.5" />
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-ink-900/60 px-2">
            <Search className="h-3.5 w-3.5 text-white/30" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="跨平台搜索歌曲…"
              className="h-8 flex-1 bg-transparent font-body text-xs text-white placeholder:text-white/30 focus:outline-none"
            />
            <button
              onClick={handleSearch}
              className="rounded-md bg-neon-cyan/15 px-2 py-1 font-display text-[9px] font-bold uppercase tracking-widest text-neon-cyan"
            >
              搜索
            </button>
          </div>

          <div className="mt-1.5 flex gap-1 overflow-x-auto scrollbar-thin">
            <FilterChip active={activePlatform === "all"} onClick={() => setActivePlatform("all")} label="全部" />
            {platforms.filter((p) => p.connected).map((p) => (
              <FilterChip
                key={p.id}
                active={activePlatform === p.id}
                onClick={() => setActivePlatform(p.id)}
                label={PLATFORM_LABEL[p.id]}
                color={p.color}
              />
            ))}
          </div>
        </div>

        <div className="scrollbar-thin flex-1 overflow-y-auto px-3 py-2">
          {searching && (
            <div className="space-y-1.5">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-10 animate-pulse rounded-lg bg-white/5" />
              ))}
            </div>
          )}

          {!searching && searchResults.length > 0 && (
            <>
              <div className="mb-1 font-display text-[9px] font-bold uppercase tracking-widest text-white/40">
                搜索结果 · {searchResults.length}
              </div>
              {searchResults.map((t) => {
                const plat = platforms.find((p) => p.id === t.platform);
                const track = TRACKS.find((x) => t.id.startsWith(x.id));
                return (
                  <div
                    key={t.id}
                    className="group mb-1 flex items-center gap-2 rounded-lg px-1.5 py-1.5 transition hover:bg-white/5"
                  >
                    <img src={t.cover} alt="" className="h-8 w-8 rounded object-cover" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-body text-xs font-semibold text-white/85">
                        {t.title}
                      </div>
                      <div className="flex items-center gap-1 font-body text-[10px] text-white/35">
                        <span style={{ color: plat?.color }}>{PLATFORM_LABEL[t.platform]}</span>
                        <span>·</span>
                        <span>{t.artist}</span>
                        <span>·</span>
                        <span>{formatTime(t.duration)}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => track && importToQueue(track, `搜索:${PLATFORM_LABEL[t.platform]}`)}
                      className="flex items-center gap-0.5 rounded-md border border-neon-cyan/30 bg-neon-cyan/5 px-1.5 py-0.5 text-neon-cyan transition hover:bg-neon-cyan/15 active:scale-95"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}
            </>
          )}

          {!searching && searchResults.length === 0 && (
            <>
              <div className="mb-1 flex items-center gap-1.5">
                <ListMusic className="h-3 w-3 text-neon-gold" />
                <span className="font-display text-[9px] font-bold uppercase tracking-widest text-white/40">
                  推荐歌单
                </span>
              </div>
              {playlists.map((pl) => {
                const plat = platforms.find((p) => p.id === pl.platform);
                return (
                  <div key={pl.id} className="group mb-1.5 rounded-lg border border-white/5 bg-white/[0.02] p-2">
                    <div className="flex items-center gap-2">
                      <img src={pl.cover} alt="" className="h-10 w-10 rounded object-cover" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-body text-xs font-semibold text-white/85">
                          {pl.name}
                        </div>
                        <div className="flex items-center gap-1 font-body text-[10px] text-white/35">
                          <span style={{ color: plat?.color }}>{PLATFORM_LABEL[pl.platform]}</span>
                          <span>·</span>
                          <span>{pl.count} 首</span>
                        </div>
                      </div>
                      <button
                        onClick={() => importPlaylist(pl.id)}
                        className="flex items-center gap-0.5 rounded-md bg-gradient-to-r from-neon-magenta/30 to-neon-violet/30 px-2 py-1 font-display text-[9px] font-bold uppercase tracking-wider text-white transition hover:from-neon-magenta/50 hover:to-neon-violet/50 active:scale-95"
                      >
                        <Music className="h-3 w-3" />
                        导入
                      </button>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>

        <div className="border-t border-white/5 p-2">
          <div className="flex items-center justify-between">
            <span className="font-body text-[10px] text-white/35">
              已连接 {platforms.filter((p) => p.connected).length}/{platforms.length} 平台
            </span>
            <span className="flex items-center gap-1 font-body text-[10px] text-neon-cyan/70">
              <Unlink className="h-3 w-3" />
              点击图标切换连接
            </span>
          </div>
        </div>
      </div>
    </NeonPanel>
  );
}

function FilterChip({
  active,
  onClick,
  label,
  color,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  color?: string;
}) {
  return (
    <button
      onClick={onClick}
      className="shrink-0 rounded-full border px-2 py-0.5 font-body text-[10px] transition"
      style={{
        borderColor: active ? color ?? "#00F0FF" : "rgba(255,255,255,0.1)",
        background: active ? `${color ?? "#00F0FF"}22` : "transparent",
        color: active ? color ?? "#00F0FF" : "rgba(255,255,255,0.4)",
      }}
    >
      {label}
    </button>
  );
}
