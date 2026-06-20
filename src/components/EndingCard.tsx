import { Sun, Moon, Scale } from "lucide-react";
import type { EndingType } from "@/data/scenes";
import { GameCard } from "./GameCard";

interface Props {
  ending: EndingType;
  playerName: string;
  lightScore: number;
  shadowScore: number;
  poetry: string;
  aiEnding?: string | null;
}

export function EndingCard({ ending, playerName, lightScore, shadowScore, poetry, aiEnding }: Props) {
  const Icon = ending === "The Dawn Bringer" ? Sun : ending === "The Keeper of Shadows" ? Moon : Scale;
  const glow: "gold" | "shadow" | "none" =
    ending === "The Dawn Bringer" ? "gold" : ending === "The Keeper of Shadows" ? "shadow" : "none";

  return (
    <GameCard glow={glow} className="text-center max-w-2xl mx-auto">
      <div className="mx-auto mb-5 size-16 rounded-full bg-solstice flex items-center justify-center animate-float">
        <Icon className="size-8 text-background" />
      </div>
      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-2">
        {playerName}, your path is
      </p>
      <h2 className="font-display text-4xl sm:text-5xl text-solstice mb-6">{ending}</h2>

      <div className="flex justify-center gap-8 mb-6 text-sm">
        <div className="flex items-center gap-2 text-gold">
          <Sun className="size-4" />
          <span className="tabular-nums font-medium">{lightScore}</span>
          <span className="text-muted-foreground">light</span>
        </div>
        <div className="flex items-center gap-2 text-accent">
          <Moon className="size-4" />
          <span className="tabular-nums font-medium">{shadowScore}</span>
          <span className="text-muted-foreground">shadow</span>
        </div>
      </div>

      <p className="font-display text-lg sm:text-xl leading-relaxed text-foreground/90 italic max-w-prose mx-auto">
        {poetry}
      </p>

      {aiEnding && (
        <div className="mt-6 pt-6 border-t border-border">
          <p className="text-xs uppercase tracking-[0.3em] text-primary mb-3">
            Your Personalized Vision
          </p>
          <p className="font-display text-base sm:text-lg leading-relaxed text-foreground/95 max-w-prose mx-auto">
            {aiEnding}
          </p>
        </div>
      )}
    </GameCard>
  );
}
