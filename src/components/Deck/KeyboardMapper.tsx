import { useEffect, useState } from "react";
import { useLoopStore } from "@/store/useLoopStore";
import { useLiveStore } from "@/store/useLiveStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { PAD_ORDER } from "@/audio/AudioEngine";
import { cn } from "@/lib/utils";

const KEY_ROWS = [
  ["1", "2", "3", "4"],
  ["q", "w", "e", "r"],
];

export function KeyboardMapper() {
  const keyboardMapping = useLoopStore((s) => s.keyboardMapping);
  const triggerPad = useLoopStore((s) => s.triggerPad);
  const theme = useSettingsStore((s) => s.theme);
  const [activeKey, setActiveKey] = useState<string | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const padIndex = keyboardMapping[key];
      if (padIndex === undefined) return;
      triggerPad(padIndex);
      useLiveStore.getState().triggerEffect();
      setActiveKey(key);
      window.setTimeout(() => {
        setActiveKey((cur) => (cur === key ? null : cur));
      }, 180);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [keyboardMapping, triggerPad]);

  return (
    <div className="flex flex-col gap-1.5">
      {KEY_ROWS.map((row, ri) => (
        <div key={ri} className="grid grid-cols-4 gap-1.5">
          {row.map((key) => {
            const padIndex = keyboardMapping[key];
            const padName = padIndex !== undefined ? PAD_ORDER[padIndex] : "";
            const active = activeKey === key;
            const color = ri === 0 ? theme.primary : theme.secondary;
            return (
              <div
                key={key}
                className={cn(
                  "flex flex-col items-center justify-center rounded-md border py-1 transition-all duration-150"
                )}
                style={{
                  borderColor: active ? color : "rgba(255,255,255,0.1)",
                  background: active ? `${color}33` : "rgba(255,255,255,0.04)",
                  boxShadow: active
                    ? `0 0 14px ${color}aa, inset 0 0 10px ${color}44`
                    : "none",
                  transform: active ? "translateY(1px)" : "none",
                }}
              >
                <span
                  className="font-display text-[11px] font-bold uppercase"
                  style={{ color: active ? color : "rgba(255,255,255,0.7)" }}
                >
                  {key.toUpperCase()}
                </span>
                <span
                  className="font-display text-[8px] font-bold uppercase tracking-wider"
                  style={{ color: active ? color : "rgba(255,255,255,0.35)" }}
                >
                  {padName}
                </span>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
