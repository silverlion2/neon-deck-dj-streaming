import { useState } from "react";
import { Settings2, Copy, Check, Eye, EyeOff, Download, ClipboardCheck } from "lucide-react";
import { NeonPanel } from "@/components/shared/NeonPanel";
import { useIntegrationStore } from "@/store/useIntegrationStore";
import { useSettingsStore } from "@/store/useSettingsStore";

export function StreamConfig() {
  const platform = useIntegrationStore((s) => s.platform);
  const activePlatform = useIntegrationStore((s) => s.activePlatform);
  const streamKey = useIntegrationStore((s) => s.connections[activePlatform].streamKey);
  const setStreamKey = useIntegrationStore((s) => s.setStreamKey);
  const theme = useSettingsStore((s) => s.theme);

  const [showKey, setShowKey] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [obsCopied, setObsCopied] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);

  const copy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(id);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const stream = platform.stream;
  const keyOrPlaceholder = streamKey || stream.streamKeyPlaceholder;

  const obsText = `NEON DECK 推流配置 - ${platform.name}
RTMP: ${stream.rtmpUrl}
StreamKey: ${keyOrPlaceholder}
分辨率: ${stream.resolution}
FPS: ${stream.fps}
码率: ${stream.bitrate}kbps
编码器: ${stream.encoder}`;

  const copyObs = () => {
    navigator.clipboard.writeText(obsText);
    setObsCopied(true);
    setTimeout(() => setObsCopied(false), 2000);
  };

  const downloadScene = () => {
    setSceneReady(true);
    setTimeout(() => setSceneReady(false), 2000);
  };

  const badges = [
    { label: "分辨率", value: stream.resolution },
    { label: "帧率 FPS", value: `${stream.fps}` },
    { label: "视频码率", value: `${stream.bitrate}kbps` },
    { label: "编码器", value: stream.encoder },
    { label: "音频码率", value: `${stream.audioBitrate}kbps` },
    { label: "关键帧间隔", value: `${stream.keyframeInterval}s` },
  ];

  return (
    <NeonPanel
      title="推流配置"
      accent="lime"
      icon={<Settings2 className="h-3.5 w-3.5" />}
      className="h-full"
    >
      <div className="scrollbar-thin flex h-full flex-col gap-3 overflow-y-auto p-3">
        <FieldRow label="RTMP 推流地址" color={platform.color}>
          <input
            readOnly
            value={stream.rtmpUrl}
            className="h-7 flex-1 truncate rounded-md border border-white/10 bg-ink-900/60 px-2 font-mono text-[11px] text-white/70 focus:outline-none"
          />
          <CopyBtn active={copiedField === "rtmp"} onClick={() => copy("rtmp", stream.rtmpUrl)} color={theme.accent} />
        </FieldRow>

        <FieldRow label="推流码 / StreamKey" color={platform.color}>
          <input
            type={showKey ? "text" : "password"}
            value={streamKey}
            onChange={(e) => setStreamKey(activePlatform, e.target.value)}
            placeholder={stream.streamKeyPlaceholder}
            className="h-7 flex-1 truncate rounded-md border px-2 font-mono text-[11px] text-white/85 placeholder:text-white/25 focus:outline-none"
            style={{ borderColor: `${platform.color}55`, background: `${platform.color}0d` }}
          />
          <button
            onClick={() => setShowKey((v) => !v)}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-white/10 bg-white/[0.03] text-white/50 transition hover:text-white/80 active:scale-95"
            title={showKey ? "隐藏" : "显示"}
          >
            {showKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          </button>
          <CopyBtn
            active={copiedField === "key"}
            onClick={() => copy("key", streamKey)}
            color={theme.accent}
            disabled={!streamKey}
          />
        </FieldRow>

        <div className="grid grid-cols-3 gap-1.5">
          {badges.map((b) => (
            <div
              key={b.label}
              className="rounded-lg border border-white/10 bg-ink-900/40 px-2 py-1.5"
              style={{ boxShadow: `inset 0 0 0 1px ${platform.color}14` }}
            >
              <div
                className="font-display text-[8px] font-bold uppercase tracking-widest opacity-70"
                style={{ color: platform.color }}
              >
                {b.label}
              </div>
              <div className="mt-0.5 truncate font-body text-[11px] font-semibold text-white/85">
                {b.value}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-auto flex flex-col gap-2 pt-1">
          <button
            onClick={copyObs}
            className="flex items-center justify-center gap-1.5 rounded-lg border py-2 font-display text-[10px] font-bold uppercase tracking-widest transition active:scale-95"
            style={{
              borderColor: obsCopied ? `${theme.accent}cc` : `${platform.color}88`,
              background: obsCopied ? `${theme.accent}1a` : `${platform.color}14`,
              color: obsCopied ? theme.accent : platform.color,
              boxShadow: obsCopied ? `0 0 14px ${theme.accent}55` : `0 0 10px ${platform.color}33`,
            }}
          >
            {obsCopied ? <Check className="h-3.5 w-3.5" /> : <ClipboardCheck className="h-3.5 w-3.5" />}
            {obsCopied ? "已复制!" : "一键复制 OBS 配置"}
          </button>

          <button
            onClick={downloadScene}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] py-2 font-display text-[10px] font-bold uppercase tracking-widest text-white/60 transition hover:text-white/90 active:scale-95"
          >
            <Download className="h-3.5 w-3.5" style={{ color: sceneReady ? theme.accent : undefined }} />
            {sceneReady ? "场景配置已就绪!" : "下载 OBS 场景配置"}
          </button>
        </div>
      </div>
    </NeonPanel>
  );
}

function FieldRow({
  label,
  color,
  children,
}: {
  label: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div
        className="mb-1 font-display text-[9px] font-bold uppercase tracking-widest"
        style={{ color }}
      >
        {label}
      </div>
      <div className="flex items-center gap-1.5">{children}</div>
    </div>
  );
}

function CopyBtn({
  active,
  onClick,
  color,
  disabled,
}: {
  active: boolean;
  onClick: () => void;
  color: string;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex h-7 w-7 items-center justify-center rounded-md border border-white/10 bg-white/[0.03] transition active:scale-95 disabled:opacity-30"
      style={{ color: active ? color : "rgba(255,255,255,0.5)" }}
    >
      {active ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}
