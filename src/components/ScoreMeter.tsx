import { Sun, Moon } from "lucide-react";

interface Props {
  lightScore: number;
  shadowScore: number;
}

export function ScoreMeter({ lightScore, shadowScore }: Props) {
  const total = Math.max(lightScore + shadowScore, 1);
  const lightPct = (lightScore / total) * 100;
  const shadowPct = (shadowScore / total) * 100;
  const tilt = lightScore - shadowScore;
  const balanceLabel =
    tilt >= 4 ? "Leaning to Dawn" : tilt <= -4 ? "Leaning to Shadow" : "In Balance";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-1.5 text-gold">
          <Sun className="size-4" />
          <span className="font-medium tabular-nums">{lightScore}</span>
          <span className="text-muted-foreground">light</span>
        </div>
        <span className="text-xs text-muted-foreground italic">{balanceLabel}</span>
        <div className="flex items-center gap-1.5 text-accent">
          <span className="text-muted-foreground">shadow</span>
          <span className="font-medium tabular-nums">{shadowScore}</span>
          <Moon className="size-4" />
        </div>
      </div>
      <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-muted/60 border border-border">
        <div
          className="absolute inset-y-0 left-0 bg-dawn transition-all duration-700"
          style={{ width: `${lightPct}%` }}
        />
        <div
          className="absolute inset-y-0 right-0 bg-dusk transition-all duration-700"
          style={{ width: `${shadowPct}%` }}
        />
        <div className="absolute inset-y-0 left-1/2 w-px bg-foreground/30" />
      </div>
    </div>
  );
}
