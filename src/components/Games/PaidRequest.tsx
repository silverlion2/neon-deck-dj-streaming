import { useState } from "react";
import { Coins, Check } from "lucide-react";
import { useMonetizationStore } from "@/store/useMonetizationStore";
import { useSettingsStore } from "@/store/useSettingsStore";

export function PaidRequest() {
  const { paidQueueCount, recordPaidRequest } = useMonetizationStore();
  const theme = useSettingsStore((s) => s.theme);
  const [enabled, setEnabled] = useState(false);
  const [toast, setToast] = useState(false);

  const handlePaid = () => {
    recordPaidRequest();
    setToast(true);
    setTimeout(() => setToast(false), 2000);
  };

  return (
    <div className="relative rounded-xl border border-white/10 bg-ink-800/70 p-3 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 font-display text-[10px] font-bold uppercase tracking-widest text-white/70">
          <Coins className="h-3.5 w-3.5" style={{ color: theme.primary }} />
          付费点歌
        </span>
        <button
          onClick={() => setEnabled((v) => !v)}
          className="relative h-5 w-9 rounded-full transition"
          style={{ background: enabled ? theme.primary : "rgba(255,255,255,0.12)" }}
        >
          <span
            className="absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all"
            style={{ left: enabled ? "18px" : "2px" }}
          />
        </button>
      </div>

      {enabled && (
        <div className="mt-2 grid grid-cols-2 gap-1.5">
          <div className="rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1.5">
            <div className="font-body text-[10px] text-white/45">免费(排队)</div>
            <div className="font-display text-xs font-bold tabular-nums text-white/70">
              0 礼物
            </div>
          </div>
          <button
            onClick={handlePaid}
            className="rounded-lg border px-2 py-1.5 text-left transition active:scale-95"
            style={{ borderColor: `${theme.secondary}55`, background: `${theme.secondary}14` }}
          >
            <div className="font-body text-[10px]" style={{ color: theme.secondary }}>
              付费(插队)
            </div>
            <div
              className="font-display text-xs font-bold tabular-nums"
              style={{ color: theme.secondary }}
            >
              100 礼物
            </div>
          </button>
        </div>
      )}

      <div className="mt-2 flex items-center justify-between font-body text-[10px] text-white/40">
        <span>已插队</span>
        <span
          className="font-display font-bold tabular-nums"
          style={{ color: theme.accent }}
        >
          {paidQueueCount} 首
        </span>
      </div>

      {toast && (
        <div
          className="pointer-events-none absolute -top-2 left-1/2 flex -translate-x-1/2 -translate-y-full items-center gap-1 whitespace-nowrap rounded-lg border border-white/10 bg-ink-900/95 px-3 py-1.5 font-display text-[10px] font-bold animate-slide-in shadow-panel"
          style={{ color: theme.accent }}
        >
          <Check className="h-3 w-3" />
          付费点歌已插队
        </div>
      )}
    </div>
  );
}
