import { useLiveStore } from "@/store/useLiveStore";
import { useSettingsStore } from "@/store/useSettingsStore";

export function BeatPulse() {
  const beat = useLiveStore((s) => s.beat);
  const theme = useSettingsStore((s) => s.theme);
  const on = beat % 2 === 0;
  return (
    <div className="pointer-events-none fixed inset-0 z-30">
      <div
        className="absolute inset-0 transition-opacity duration-100"
        style={{
          opacity: on ? 0.5 : 0,
          boxShadow: `inset 0 0 120px ${theme.primary}55, inset 0 0 60px ${theme.secondary}33`,
        }}
      />
    </div>
  );
}
