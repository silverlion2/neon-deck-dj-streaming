import { useState } from "react";
import { useLiveStore } from "@/store/useLiveStore";
import { audioEngine, type PadId } from "@/audio/AudioEngine";

interface PadDef {
  id: PadId;
  name: string;
  color: string;
}

const PADS: PadDef[] = [
  { id: "KICK", name: "KICK", color: "#FF2D95" },
  { id: "SNARE", name: "SNARE", color: "#00F0FF" },
  { id: "HAT", name: "HAT", color: "#B6FF3C" },
  { id: "CLAP", name: "CLAP", color: "#FFC53D" },
  { id: "BASS", name: "BASS", color: "#9D4EDD" },
  { id: "RISER", name: "RISER", color: "#FF6B6B" },
  { id: "VOCAL", name: "VOCAL", color: "#4ECDC4" },
  { id: "FX", name: "FX", color: "#FF2D95" },
];

export function PadGrid() {
  const triggerEffect = useLiveStore((s) => s.triggerEffect);
  const [active, setActive] = useState<string | null>(null);

  const hit = (index: number, name: string) => {
    audioEngine.ensure();
    audioEngine.playPad(index);
    triggerEffect();
    setActive(name);
    setTimeout(() => setActive((cur) => (cur === name ? null : cur)), 180);
  };

  return (
    <div className="grid grid-cols-4 gap-1.5">
      {PADS.map((p, i) => (
        <button
          key={p.id}
          onMouseDown={() => hit(i, p.name)}
          className="relative h-10 overflow-hidden rounded-lg border font-display text-[9px] font-bold tracking-wider transition active:scale-95"
          style={{
            borderColor: active === p.name ? p.color : "rgba(255,255,255,0.1)",
            background: active === p.name ? `${p.color}33` : "rgba(255,255,255,0.04)",
            color: active === p.name ? p.color : "rgba(255,255,255,0.6)",
            boxShadow:
              active === p.name
                ? `0 0 16px ${p.color}99, inset 0 0 12px ${p.color}44`
                : "none",
          }}
        >
          {active === p.name && (
            <span
              className="absolute inset-0 animate-burst rounded-lg"
              style={{ background: `radial-gradient(circle, ${p.color}44, transparent 70%)` }}
            />
          )}
          {p.name}
        </button>
      ))}
    </div>
  );
}
