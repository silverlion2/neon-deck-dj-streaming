import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface NeonPanelProps {
  children: ReactNode;
  className?: string;
  accent?: "magenta" | "cyan" | "lime" | "gold";
  title?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

const accentMap = {
  magenta: "text-neon-magenta",
  cyan: "text-neon-cyan",
  lime: "text-neon-lime",
  gold: "text-neon-gold",
};

export function NeonPanel({
  children,
  className,
  accent = "cyan",
  title,
  icon,
  action,
}: NeonPanelProps) {
  return (
    <div className={cn("neon-panel noise flex flex-col overflow-hidden", className)}>
      {title && (
        <div className="flex items-center justify-between border-b border-white/5 px-4 py-2.5">
          <div className="flex items-center gap-2">
            {icon && <span className={accentMap[accent]}>{icon}</span>}
            <h3
              className={cn(
                "font-display text-[11px] font-bold uppercase tracking-[0.25em]",
                accentMap[accent]
              )}
            >
              {title}
            </h3>
          </div>
          {action}
        </div>
      )}
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
