import { useSettingsStore } from "@/store/useSettingsStore";
import { PRESETS } from "@/audio/presets";
import { audioEngine } from "@/audio/AudioEngine";
import { Waves } from "lucide-react";

export function PresetSwitcher() {
  const { presetId, setPreset, theme } = useSettingsStore();

  const handleSelect = (id: (typeof PRESETS)[number]["id"]) => {
    audioEngine.ensure();
    setPreset(id);
  };

  return (
    <div className="rounded-lg border border-white/10 bg-ink-900/50 p-2">
      <div className="mb-1.5 flex items-center gap-1.5">
        <Waves className="h-3.5 w-3.5" style={{ color: theme.secondary }} />
        <span className="font-display text-[10px] font-bold uppercase tracking-widest text-white/50">
          音色预设
        </span>
        <span className="ml-auto font-body text-[10px]" style={{ color: theme.primary }}>
          {PRESETS.find((p) => p.id === presetId)?.label}
        </span>
      </div>
      <div className="grid grid-cols-4 gap-1">
        {PRESETS.map((p) => {
          const active = p.id === presetId;
          return (
            <button
              key={p.id}
              onClick={() => handleSelect(p.id)}
              className="flex flex-col items-center gap-0.5 rounded-md border py-1.5 transition active:scale-95"
              style={{
                borderColor: active ? p.color : "rgba(255,255,255,0.08)",
                background: active ? `${p.color}22` : "rgba(255,255,255,0.03)",
                boxShadow: active ? `0 0 12px ${p.color}66, inset 0 0 8px ${p.color}33` : "none",
              }}
            >
              <span
                className="font-display text-[9px] font-bold uppercase tracking-wider"
                style={{ color: active ? p.color : "rgba(255,255,255,0.5)" }}
              >
                {p.name}
              </span>
              <span className="h-1 w-4 rounded-full" style={{ background: active ? p.color : "rgba(255,255,255,0.15)" }} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
