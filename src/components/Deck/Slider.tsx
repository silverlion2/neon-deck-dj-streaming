import { useRef, useEffect } from "react";
import { clamp } from "@/utils/random";

interface SliderProps {
  value: number;
  onChange: (v: number) => void;
  orientation: "vertical" | "horizontal";
  color: string;
  label?: string;
  heightClass?: string;
  widthClass?: string;
}

export function Slider({
  value,
  onChange,
  orientation,
  color,
  label,
  heightClass = "h-28",
  widthClass = "w-8",
}: SliderProps) {
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const update = (client: number) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const p =
      orientation === "vertical"
        ? 1 - (client - rect.top) / rect.height
        : (client - rect.left) / rect.width;
    onChange(clamp(Math.round(p * 100), 0, 100));
  };

  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (dragging.current) update(e.clientY);
    };
    const moveTouch = (e: TouchEvent) => {
      if (dragging.current && e.touches[0]) {
        update(orientation === "vertical" ? e.touches[0].clientY : e.touches[0].clientX);
      }
    };
    const up = () => {
      dragging.current = false;
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("touchmove", moveTouch);
    window.addEventListener("mouseup", up);
    window.addEventListener("touchend", up);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("touchmove", moveTouch);
      window.removeEventListener("mouseup", up);
      window.removeEventListener("touchend", up);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isV = orientation === "vertical";

  return (
    <div className="flex flex-col items-center gap-1.5">
      {label && (
        <span className="font-display text-[9px] font-bold uppercase tracking-widest text-white/40">
          {label}
        </span>
      )}
      <div
        ref={ref}
        onMouseDown={(e) => {
          dragging.current = true;
          update(isV ? e.clientY : e.clientX);
        }}
        onTouchStart={(e) => {
          dragging.current = true;
          if (e.touches[0]) update(isV ? e.touches[0].clientY : e.touches[0].clientX);
        }}
        className={`relative cursor-pointer rounded-full ${
          isV ? `${heightClass} ${widthClass}` : `h-8 w-40`
        }`}
        style={{
          background: "rgba(255,255,255,0.06)",
          boxShadow: "inset 0 0 6px rgba(0,0,0,0.6)",
        }}
      >
        <div
          className="absolute rounded-full"
          style={
            isV
              ? {
                  left: 0,
                  right: 0,
                  bottom: 0,
                  height: `${value}%`,
                  background: `linear-gradient(to top, ${color}, ${color}44)`,
                  boxShadow: `0 0 10px ${color}88`,
                }
              : {
                  top: 0,
                  bottom: 0,
                  left: 0,
                  width: `${value}%`,
                  background: `linear-gradient(to right, ${color}, ${color}44)`,
                  boxShadow: `0 0 10px ${color}88`,
                }
          }
        />
        <div
          className="absolute flex items-center justify-center"
          style={
            isV
              ? {
                  left: "-6px",
                  right: "-6px",
                  bottom: `calc(${value}% - 8px)`,
                  height: "16px",
                  background: "#1a1a2e",
                  border: `1px solid ${color}`,
                  borderRadius: "4px",
                  boxShadow: `0 0 12px ${color}aa`,
                }
              : {
                  top: "-6px",
                  bottom: "-6px",
                  left: `calc(${value}% - 8px)`,
                  width: "16px",
                  background: "#1a1a2e",
                  border: `1px solid ${color}`,
                  borderRadius: "4px",
                  boxShadow: `0 0 12px ${color}aa`,
                }
          }
        >
          <div
            className="rounded-full"
            style={{ width: "4px", height: "4px", background: color }}
          />
        </div>
      </div>
      <span className="font-display text-[10px] font-bold tabular-nums" style={{ color }}>
        {value}
      </span>
    </div>
  );
}
