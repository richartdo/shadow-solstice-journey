import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SiteShell } from "@/components/SiteShell";
import { GameCard } from "@/components/GameCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Sparkles, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/setup")({
  head: () => ({
    meta: [
      { title: "Begin Your Journey — Shadow of Choices" },
      { name: "description", content: "Name yourself and step into the solstice." },
    ],
  }),
  component: Setup,
});

function Setup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [aiEnabled, setAiEnabled] = useState(false);

  function start(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim() || "Wanderer";
    if (typeof window !== "undefined") {
      sessionStorage.setItem(
        "soc:player",
        JSON.stringify({ name: trimmed, aiEnabled }),
      );
      sessionStorage.removeItem("soc:result");
    }
    navigate({ to: "/game" });
  }

  return (
    <SiteShell>
      <section className="mx-auto max-w-xl px-4 sm:px-6 py-16 sm:py-24">
        <GameCard className="text-center">
          <Sparkles className="mx-auto mb-3 size-7 text-primary animate-float" />
          <h1 className="font-display text-4xl sm:text-5xl text-solstice">Name Yourself</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            The solstice asks who walks its threshold.
          </p>

          <form onSubmit={start} className="mt-8 space-y-6 text-left">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                Your name or nickname
              </Label>
              <Input
                id="name"
                placeholder="e.g. Mira, Wanderer, Solis…"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={40}
                className="bg-card/60 border-border h-12 text-base"
                autoFocus
              />
            </div>

            <div className="flex items-start justify-between gap-4 rounded-xl border border-border bg-card/40 p-4">
              <div>
                <p className="font-medium text-foreground">Personalized AI ending</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Let an oracle weave a final paragraph just for your path.
                </p>
              </div>
              <Switch checked={aiEnabled} onCheckedChange={setAiEnabled} />
            </div>

            <button
              type="submit"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-medium text-primary-foreground hover:glow-gold transition-all"
            >
              Start Game
              <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </form>
        </GameCard>
      </section>
    </SiteShell>
  );
}
