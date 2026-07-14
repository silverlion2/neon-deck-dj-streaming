import { useEngagementStore } from "@/store/useEngagementStore";

export function FlyingHearts() {
  const hearts = useEngagementStore((s) => s.hearts);

  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
      {hearts.map((h) => (
        <div
          key={h.id}
          className="absolute animate-float-up"
          style={{
            left: `${h.x}%`,
            bottom: "80px",
            fontSize: "26px",
            filter: `drop-shadow(0 0 8px ${h.color})`,
          }}
        >
          {h.emoji}
        </div>
      ))}
    </div>
  );
}
