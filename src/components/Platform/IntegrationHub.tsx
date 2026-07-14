import { NeonPanel } from "@/components/shared/NeonPanel";
import { useIntegrationStore } from "@/store/useIntegrationStore";
import type { PlatformConn } from "@/store/useIntegrationStore";
import { LIVE_PLATFORMS } from "@/data/livePlatforms";
import type { LivePlatform } from "@/data/livePlatforms";
import { useSettingsStore } from "@/store/useSettingsStore";
import { formatTime } from "@/utils/format";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import {
  PlugZap, Loader2, Play, Square, Power, ShieldAlert,
  ArrowLeft, ArrowRight, ArrowLeftRight, Users, Link2,
} from "lucide-react";

const PLATFORMS = LIVE_PLATFORMS.filter((p) => p.id !== "generic");

const stateMeta = (c: PlatformConn): { dot: string; pulse: boolean; label: string } => {
  switch (c.connState) {
    case "authorizing": return { dot: "#FFC53D", pulse: true, label: "授权中..." };
    case "connected": return { dot: "#3CFF6B", pulse: false, label: "已连接" };
    case "live": return { dot: "#FF3B3B", pulse: true, label: "LIVE" };
    default: return { dot: "rgba(255,255,255,0.3)", pulse: false, label: "未连接" };
  }
};

export function IntegrationHub() {
  const connections = useIntegrationStore((s) => s.connections);
  const connected = PLATFORMS.filter((p) => {
    const s = connections[p.id].connState;
    return s === "connected" || s === "live";
  });

  return (
    <NeonPanel title="深度对接" accent="cyan" icon={<PlugZap className="h-3.5 w-3.5" />} className="h-full">
      <div className="scrollbar-thin flex h-full flex-col gap-2.5 overflow-y-auto p-3">
        <div className="flex flex-col gap-2">
          {PLATFORMS.map((p) => <ConnCard key={p.id} platform={p} />)}
        </div>
        <FlowDiagram platforms={connected} />
      </div>
    </NeonPanel>
  );
}

function ConnCard({ platform }: { platform: LivePlatform }) {
  const theme = useSettingsStore((s) => s.theme);
  const { connections, authorize, disconnect, goLive, stopLive, toggleDanmakuSync, toggleGiftSync, toggleDataSync } = useIntegrationStore();
  const conn = connections[platform.id];
  const meta = stateMeta(conn);
  const isLive = conn.connState === "live";
  const active = conn.connState === "connected" || isLive;

  return (
    <div className="rounded-xl border p-2.5" style={{ borderColor: active ? `${platform.color}55` : "rgba(255,255,255,0.08)", background: active ? `${platform.color}0d` : "rgba(255,255,255,0.02)" }}>
      <div className="flex items-center gap-2">
        <span className="flex h-6 min-w-[1.6rem] items-center justify-center rounded-md px-1.5 font-display text-[9px] font-bold text-white" style={{ background: platform.color }}>
          {platform.short}
        </span>
        <span className="flex-1 truncate font-body text-xs font-semibold text-white/85">{platform.name}</span>
        {conn.blockedCount > 0 && (
          <span className="flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-display text-[9px] font-bold" style={{ background: "rgba(255,59,59,0.15)", color: "#FF6B6B" }}>
            <ShieldAlert className="h-2.5 w-2.5" />{conn.blockedCount}
          </span>
        )}
        <span className="flex items-center gap-1">
          <span className={cn("h-1.5 w-1.5 rounded-full", meta.pulse && "animate-pulse")} style={{ background: meta.dot, boxShadow: meta.pulse ? `0 0 6px ${meta.dot}` : "none" }} />
          <span className="font-display text-[9px] font-bold uppercase tracking-widest" style={{ color: meta.dot === "rgba(255,255,255,0.3)" ? "rgba(255,255,255,0.4)" : meta.dot }}>
            {meta.label}
          </span>
        </span>
      </div>

      {conn.connState === "disconnected" && (
        <div className="mt-2 flex justify-end">
          <button onClick={() => authorize(platform.id)} className="flex items-center gap-1 rounded-md px-2.5 py-1 font-display text-[10px] font-bold uppercase tracking-wider text-white transition active:scale-95" style={{ background: platform.color }}>
            <Link2 className="h-3 w-3" /> 授权连接
          </button>
        </div>
      )}

      {conn.connState === "authorizing" && (
        <div className="mt-2 flex items-center justify-end gap-1.5" style={{ color: "#FFC53D" }}>
          <Loader2 className="h-3 w-3 animate-spin" />
          <span className="animate-pulse font-body text-[10px]">正在拉起授权窗口…</span>
        </div>
      )}

      {active && (
        <div className="mt-2 space-y-2">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 font-body text-[10px] text-white/55">
            <span>账号 <span className="text-white/85">{conn.account}</span></span>
            <span>房间 <span className="text-white/85">{conn.roomId}</span></span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <SyncToggle label="弹幕同步" on={conn.danmakuSync} onToggle={() => toggleDanmakuSync(platform.id)} color={platform.color} />
            <SyncToggle label="礼物同步" on={conn.giftSync} onToggle={() => toggleGiftSync(platform.id)} color={platform.color} />
            <SyncToggle label="数据同步" on={conn.dataSync} onToggle={() => toggleDataSync(platform.id)} color={platform.color} />
          </div>
          {isLive && (
            <div className="flex items-center gap-3 rounded-md border px-2 py-1.5" style={{ borderColor: "rgba(255,59,59,0.3)", background: "rgba(255,59,59,0.08)" }}>
              <span className="flex items-center gap-1 font-display text-[11px] font-bold" style={{ color: "#FF3B3B" }}>
                <Play className="h-3 w-3" /> {formatTime(conn.liveDuration)}
              </span>
              <span className="flex items-center gap-1 font-body text-[10px] text-white/70">
                <Users className="h-3 w-3" /> {conn.viewerCount}
              </span>
            </div>
          )}
          <div className="flex items-center justify-end gap-1.5">
            {isLive ? (
              <button onClick={() => stopLive(platform.id)} className="flex items-center gap-1 rounded-md px-2.5 py-1 font-display text-[10px] font-bold uppercase tracking-wider text-white transition active:scale-95" style={{ background: "#FF3B3B" }}>
                <Square className="h-3 w-3" /> 下播
              </button>
            ) : (
              <>
                <button onClick={() => goLive(platform.id)} className="flex items-center gap-1 rounded-md px-2.5 py-1 font-display text-[10px] font-bold uppercase tracking-wider text-ink-900 transition active:scale-95" style={{ background: theme.accent }}>
                  <Play className="h-3 w-3" /> 开播
                </button>
                <button onClick={() => disconnect(platform.id)} className="flex items-center gap-1 rounded-md border px-2.5 py-1 font-display text-[10px] font-bold uppercase tracking-wider transition active:scale-95" style={{ borderColor: "rgba(255,59,59,0.4)", color: "#FF6B6B" }}>
                  <Power className="h-3 w-3" /> 断开
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SyncToggle({ label, on, onToggle, color }: { label: string; on: boolean; onToggle: () => void; color: string }) {
  return (
    <button onClick={onToggle} className="flex items-center gap-1 rounded-full border px-2 py-0.5 font-display text-[9px] font-bold uppercase tracking-wider transition active:scale-95" style={{ borderColor: on ? `${color}80` : "rgba(255,255,255,0.1)", background: on ? `${color}1f` : "transparent", color: on ? color : "rgba(255,255,255,0.35)" }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: on ? color : "rgba(255,255,255,0.25)" }} />
      {label}
    </button>
  );
}

function FlowDiagram({ platforms }: { platforms: LivePlatform[] }) {
  const theme = useSettingsStore((s) => s.theme);
  const connections = useIntegrationStore((s) => s.connections);
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-2.5">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-display text-[9px] font-bold uppercase tracking-[0.25em] text-white/40">数据流向</span>
        <span className="rounded-full px-3 py-0.5 font-display text-[10px] font-bold uppercase tracking-[0.2em] text-ink-900" style={{ background: theme.secondary, boxShadow: `0 0 14px ${theme.secondary}88` }}>
          NEON DECK
        </span>
      </div>
      {platforms.length === 0 ? (
        <div className="py-2 text-center font-body text-[10px] text-white/30">暂无已连接平台</div>
      ) : (
        <div className="space-y-1">
          {platforms.map((p) => {
            const c = connections[p.id];
            return (
              <div key={p.id} className="flex items-center gap-2 rounded-md border px-2 py-1" style={{ borderColor: `${p.color}33`, background: `${p.color}0a` }}>
                <span className="flex h-4 min-w-[1.4rem] items-center justify-center rounded px-1 font-display text-[8px] font-bold text-white" style={{ background: p.color }}>
                  {p.short}
                </span>
                <span className="flex-1" />
                <FlowDir icon={<ArrowLeft className="h-3 w-3" />} label="弹幕" on={c.danmakuSync} color={p.color} />
                <FlowDir icon={<ArrowRight className="h-3 w-3" />} label="礼物" on={c.giftSync} color={p.color} />
                <FlowDir icon={<ArrowLeftRight className="h-3 w-3" />} label="数据" on={c.dataSync} color={p.color} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FlowDir({ icon, label, on, color }: { icon: ReactNode; label: string; on: boolean; color: string }) {
  return (
    <span className="flex items-center gap-0.5 font-body text-[9px]" style={{ color: on ? color : "rgba(255,255,255,0.22)" }}>
      {label}{icon}
    </span>
  );
}
