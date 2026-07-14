import { useSettingsStore } from "@/store/useSettingsStore";

export function Background() {
  const theme = useSettingsStore((s) => s.theme);
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0" style={{ background: theme.bg }} />
      <div className="absolute inset-0 grid-bg opacity-60" />
      <div
        className="absolute -left-40 -top-40 h-[480px] w-[480px] rounded-full blur-[120px]"
        style={{ background: theme.glow1 }}
      />
      <div
        className="absolute -right-40 top-1/3 h-[520px] w-[520px] rounded-full blur-[130px]"
        style={{ background: theme.glow2 }}
      />
      <div
        className="absolute bottom-0 left-1/3 h-[420px] w-[420px] rounded-full blur-[120px]"
        style={{ background: theme.glow3 }}
      />
      <div
        className="absolute inset-x-0 top-0 h-px animate-scan"
        style={{ background: `linear-gradient(90deg, transparent, ${theme.secondary}99, transparent)` }}
      />
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.4) 3px, rgba(255,255,255,0.4) 4px)",
        }}
      />
    </div>
  );
}
