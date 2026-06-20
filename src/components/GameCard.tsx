import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function GameCard({
  children,
  className,
  glow,
}: {
  children: ReactNode;
  className?: string;
  glow?: "gold" | "shadow" | "none";
}) {
  return (
    <div
      className={cn(
        "glass rounded-2xl p-6 sm:p-8 shadow-elegant transition-all duration-500",
        glow === "gold" && "glow-gold",
        glow === "shadow" && "glow-shadow",
        className,
      )}
    >
      {children}
    </div>
  );
}
