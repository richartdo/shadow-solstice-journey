import { Sun, Moon, Scale } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  text: string;
  lightPoints: number;
  shadowPoints: number;
  onClick: () => void;
  disabled?: boolean;
  index: number;
}

export function ChoiceButton({ text, lightPoints, shadowPoints, onClick, disabled, index }: Props) {
  const tilt: "light" | "shadow" | "balance" =
    lightPoints > shadowPoints ? "light" : shadowPoints > lightPoints ? "shadow" : "balance";

  const Icon = tilt === "light" ? Sun : tilt === "shadow" ? Moon : Scale;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{ animationDelay: `${index * 120}ms` }}
      className={cn(
        "group relative w-full text-left rounded-xl p-5 border transition-all duration-300",
        "glass hover:border-primary/60 hover:-translate-y-0.5",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0",
        "animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both",
        tilt === "light" && "hover:glow-gold",
        tilt === "shadow" && "hover:glow-shadow",
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "shrink-0 mt-0.5 size-9 rounded-full flex items-center justify-center border",
            tilt === "light" && "bg-gold/15 border-gold/40 text-gold",
            tilt === "shadow" && "bg-accent/15 border-accent/40 text-accent",
            tilt === "balance" && "bg-balance/15 border-balance/40 text-balance",
          )}
        >
          <Icon className="size-4" />
        </div>
        <div className="flex-1">
          <p className="font-display text-lg sm:text-xl leading-snug text-foreground">{text}</p>
          <div className="mt-2 flex gap-3 text-xs text-muted-foreground">
            {lightPoints > 0 && (
              <span className="inline-flex items-center gap-1 text-gold/90">
                <Sun className="size-3" /> +{lightPoints} light
              </span>
            )}
            {shadowPoints > 0 && (
              <span className="inline-flex items-center gap-1 text-accent/90">
                <Moon className="size-3" /> +{shadowPoints} shadow
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
