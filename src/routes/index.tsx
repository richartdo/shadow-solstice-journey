import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/SiteShell";
import { GameCard } from "@/components/GameCard";
import { Sun, Moon, Sparkles, ArrowRight, Trophy, BookOpen } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Shadow of Choices — A Solstice Journey" },
      { name: "description", content: "An interactive solstice journey of light, shadow, and identity. Every choice shapes your path." },
      { property: "og:title", content: "Shadow of Choices — A Solstice Journey" },
      { property: "og:description", content: "Every choice shapes your path between light and shadow." },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <SiteShell>
      {/* Hero */}
      <section className="relative mx-auto max-w-6xl px-4 sm:px-6 pt-10 sm:pt-20 pb-20">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
          <div className="relative">
            <p className="text-xs uppercase tracking-[0.35em] text-primary mb-4 flex items-center gap-2">
              <Sparkles className="size-3.5" /> June Solstice Game Jam
            </p>
            <h1 className="font-display text-5xl sm:text-7xl leading-[0.95] tracking-tight">
              <span className="text-solstice">Shadow</span>
              <br />
              <span className="text-foreground/95">of Choices</span>
            </h1>
            <p className="mt-5 font-display text-xl sm:text-2xl italic text-foreground/80">
              A Solstice Journey of Light, Shadow, and Identity
            </p>
            <p className="mt-6 max-w-xl text-foreground/70 leading-relaxed">
              On the longest twilight of the year, you walk a path that bends with every
              decision. Seven scenes. Two horizons. Three possible souls. Every choice
              shapes who you become when dawn arrives.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/setup"
                className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:glow-gold transition-all"
              >
                Start Journey
                <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                to="/leaderboard"
                className="inline-flex items-center gap-2 rounded-full glass px-6 py-3 text-sm font-medium hover:border-primary/50 transition-all"
              >
                <Trophy className="size-4" /> View Leaderboard
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 rounded-full glass px-6 py-3 text-sm font-medium hover:border-primary/50 transition-all"
              >
                <BookOpen className="size-4" /> About the Jam
              </Link>
            </div>
          </div>

          {/* Split visual */}
          <div className="relative mx-auto aspect-square w-full max-w-md">
            <div className="absolute inset-0 rounded-full bg-dawn glow-gold animate-float" />
            <div className="absolute inset-0 rounded-full bg-dusk glow-shadow" style={{ clipPath: "polygon(50% 0, 100% 0, 100% 100%, 50% 100%)" }} />
            <div className="absolute inset-0 rounded-full bg-dawn" style={{ clipPath: "polygon(0 0, 50% 0, 50% 100%, 0 100%)" }} />
            <Sun className="absolute left-[18%] top-[40%] size-12 text-primary-foreground/90 drop-shadow-[0_0_20px_oklch(0.82_0.17_80)]" />
            <Moon className="absolute right-[18%] top-[40%] size-12 text-foreground drop-shadow-[0_0_20px_oklch(0.55_0.18_295)]" />
            <div className="absolute inset-x-0 bottom-[-8%] mx-auto h-32 w-32 rounded-full bg-foreground/10 blur-3xl" />
          </div>
        </div>
      </section>

      {/* Three paths */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-20">
        <p className="text-center text-xs uppercase tracking-[0.35em] text-muted-foreground mb-6">
          Three possible souls await
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { name: "The Dawn Bringer", icon: Sun, desc: "You carried light when light was hard.", glow: "gold" as const },
            { name: "The Balance Walker", icon: Sparkles, desc: "You walked the seam where both meet.", glow: "none" as const },
            { name: "The Keeper of Shadows", icon: Moon, desc: "You did not flinch from the dark.", glow: "shadow" as const },
          ].map((p) => (
            <GameCard key={p.name} glow={p.glow} className="text-center">
              <p.icon className="mx-auto mb-3 size-7 text-primary" />
              <h3 className="font-display text-2xl text-solstice">{p.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground italic">{p.desc}</p>
            </GameCard>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
