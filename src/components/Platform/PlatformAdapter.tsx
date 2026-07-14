import { MonitorSmartphone, Film, Radio, Gauge, StickyNote, Maximize2 } from "lucide-react";
import { NeonPanel } from "@/components/shared/NeonPanel";
import { useStreamStore } from "@/store/useStreamStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { LIVE_PLATFORMS, ASPECT_RATIO_MAP } from "@/data/livePlatforms";
import type { LivePlatform } from "@/data/livePlatforms";

const DANMAKU_LABEL: Record<LivePlatform["danmakuStyle"], string> = {
  float: "飘浮弹幕",
  side: "侧边滚动",
  bottom: "底部固定",
};

const EXPORT_LABEL: Record<LivePlatform["exportMode"], string> = {
  window: "窗口捕获",
  browser: "浏览器全屏",
  obs: "OBS 推流",
};

export function PlatformAdapter() {
  const activePlatform = useStreamStore((s) => s.activePlatform);
  const platform = useStreamStore((s) => s.platform);
  const isExportMode = useStreamStore((s) => s.isExportMode);
  const setPlatform = useStreamStore((s) => s.setPlatform);
  const toggleExport = useStreamStore((s) => s.toggleExport);
  const theme = useSettingsStore((s) => s.theme);

  const ratio = ASPECT_RATIO_MAP[platform.aspectRatio];
  const isVertical = ratio.h > ratio.w;

  return (
    <NeonPanel
      title="直播平台适配"
      accent="cyan"
      icon={<MonitorSmartphone className="h-3.5 w-3.5" />}
      className="h-full"
      action={
        <button
          onClick={toggleExport}
          className="flex items-center gap-1 rounded-full border px-2 py-0.5 font-display text-[9px] font-bold uppercase tracking-widest transition active:scale-95"
          style={{
            borderColor: isExportMode ? `${theme.secondary}80` : "rgba(255,255,255,0.15)",
            background: isExportMode ? `${theme.secondary}1a` : "transparent",
            color: isExportMode ? theme.secondary : "rgba(255,255,255,0.4)",
          }}
        >
          <Film className="h-3 w-3" />
          导出模式 {isExportMode ? "ON" : "OFF"}
        </button>
      }
    >
      <div className="scrollbar-thin flex h-full flex-col gap-3 overflow-y-auto p-3">
        <div className="grid grid-cols-5 gap-1.5">
          {LIVE_PLATFORMS.map((p) => {
            const active = p.id === activePlatform;
            return (
              <button
                key={p.id}
                onClick={() => setPlatform(p.id)}
                title={p.name}
                className="group relative flex flex-col items-center gap-1 rounded-lg border py-1.5 transition active:scale-95"
                style={{
                  borderColor: active ? `${p.color}cc` : "rgba(255,255,255,0.08)",
                  background: active ? `${p.color}22` : "rgba(255,255,255,0.03)",
                  boxShadow: active ? `0 0 12px ${p.color}55` : "none",
                }}
              >
                <span
                  className="flex h-6 w-6 items-center justify-center rounded-md font-display text-[9px] font-bold text-white transition group-hover:scale-110"
                  style={{ background: p.color }}
                >
                  {p.short}
                </span>
                <span
                  className="h-1 w-1 rounded-full"
                  style={{ background: active ? p.color : "rgba(255,255,255,0.2)" }}
                />
              </button>
            );
          })}
        </div>

        <div
          className="rounded-xl border p-3"
          style={{
            borderColor: `${platform.color}44`,
            background: `${platform.color}0d`,
          }}
        >
          <div className="mb-2 flex items-center justify-between">
            <span
              className="font-display text-xs font-bold tracking-wide"
              style={{ color: platform.color }}
            >
              {platform.name}
            </span>
            <span
              className="rounded-full px-2 py-0.5 font-display text-[9px] font-bold uppercase tracking-widest"
              style={{ background: `${platform.color}22`, color: platform.color }}
            >
              {ratio.label}
            </span>
          </div>

          <div className="mb-3 flex items-center justify-center">
            <div
              className="relative flex items-center justify-center overflow-hidden rounded-md border-2"
              style={{
                borderColor: isExportMode ? theme.secondary : `${platform.color}88`,
                aspectRatio: `${ratio.w} / ${ratio.h}`,
                height: isVertical ? 96 : 56,
                boxShadow: isExportMode
                  ? `0 0 16px ${theme.secondary}66, inset 0 0 12px ${theme.secondary}22`
                  : `0 0 10px ${platform.color}33`,
                background: `linear-gradient(135deg, ${platform.color}14, transparent)`,
              }}
            >
              <span
                className="font-display text-[9px] font-bold tracking-widest"
                style={{ color: isExportMode ? theme.secondary : `${platform.color}cc` }}
              >
                {platform.aspectRatio}
              </span>
              {isExportMode && (
                <Maximize2
                  className="absolute right-1 top-1 h-2.5 w-2.5"
                  style={{ color: theme.secondary }}
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            <InfoCell icon={<Gauge className="h-3 w-3" />} label="码率" value={platform.recommendBitrate} color={platform.color} />
            <InfoCell icon={<Radio className="h-3 w-3" />} label="弹幕" value={DANMAKU_LABEL[platform.danmakuStyle]} color={platform.color} />
            <InfoCell icon={<Film className="h-3 w-3" />} label="导出" value={EXPORT_LABEL[platform.exportMode]} color={platform.color} />
          </div>
        </div>

        <div className="flex items-start gap-2 rounded-lg border border-white/10 bg-white/[0.02] p-2.5">
          <StickyNote className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: theme.accent }} />
          <p className="font-body text-[11px] leading-relaxed text-white/60">{platform.notes}</p>
        </div>

        {isExportMode && (
          <div
            className="rounded-lg border p-2"
            style={{
              borderColor: `${theme.secondary}55`,
              background: `${theme.secondary}0d`,
            }}
          >
            <div className="mb-1 flex items-center gap-1.5">
              <span
                className="h-1.5 w-1.5 animate-pulse rounded-full"
                style={{ background: theme.secondary }}
              />
              <span
                className="font-display text-[9px] font-bold uppercase tracking-widest"
                style={{ color: theme.secondary }}
              >
                导出预览 · {platform.aspectRatio}
              </span>
            </div>
            <div className="flex items-center justify-center rounded-md bg-ink-900/60 p-3">
              <div
                className="relative flex items-center justify-center overflow-hidden rounded border-2"
                style={{
                  borderColor: theme.secondary,
                  aspectRatio: `${ratio.w} / ${ratio.h}`,
                  height: isVertical ? 120 : 70,
                  boxShadow: `0 0 20px ${theme.secondary}88, inset 0 0 16px ${theme.secondary}33`,
                }}
              >
                <div
                  className="absolute inset-0 opacity-30"
                  style={{
                    background: `linear-gradient(180deg, transparent, ${theme.secondary}33)`,
                  }}
                />
                <span
                  className="relative font-display text-[10px] font-bold tracking-widest"
                  style={{ color: theme.secondary }}
                >
                  LIVE · {platform.short}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </NeonPanel>
  );
}

function InfoCell({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-ink-900/40 px-2 py-1.5">
      <div className="flex items-center gap-1" style={{ color }}>
        {icon}
        <span className="font-display text-[8px] font-bold uppercase tracking-widest opacity-80">
          {label}
        </span>
      </div>
      <div className="mt-0.5 truncate font-body text-[11px] font-semibold text-white/85">
        {value}
      </div>
    </div>
  );
}
