import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/SiteShell";
import { GameCard } from "@/components/GameCard";
import { Sun, Moon, Sparkles, Clock, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Shadow of Choices" },
      { name: "description", content: "About the June Solstice Game Jam entry and the themes that shaped this journey." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-2xl px-4 sm:px-6 py-12 sm:py-16 space-y-6">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-primary mb-3">June Solstice Game Jam</p>
          <h1 className="font-display text-4xl sm:text-5xl text-solstice">About the Journey</h1>
        </div>

        <GameCard>
          <h2 className="font-display text-2xl text-foreground mb-2">What this game is</h2>
          <p className="text-foreground/80 leading-relaxed">
            <em>Shadow of Choices</em> is a short interactive narrative — seven scenes,
            three possible endings. There are no enemies, no inventory, no points to
            farm. There is only you, a path, and a series of choices that quietly add
            up to who you become.
          </p>
        </GameCard>

        <GameCard>
          <h2 className="font-display text-2xl text-foreground mb-2">The solstice theme</h2>
          <p className="text-foreground/80 leading-relaxed">
            The June solstice is the longest day in one hemisphere and the longest night
            in the other — a single moment that is, at once, the brightest and the
            darkest. We took that contradiction as a starting point: light and shadow
            are not opposites, they are the same turning.
          </p>
        </GameCard>

        <GameCard>
          <h2 className="font-display text-2xl text-foreground mb-2">How choices shape endings</h2>
          <p className="text-foreground/80 leading-relaxed mb-3">
            Every choice grants <span className="text-gold">light points</span>, <span className="text-accent">shadow points</span>, or both. At the end of your journey:
          </p>
          <ul className="space-y-2 text-foreground/85">
            <li className="flex items-start gap-2.5">
              <Sun className="mt-0.5 size-4 text-gold shrink-0" />
              <span><strong className="text-foreground">The Dawn Bringer</strong> — light leads shadow by 4 or more.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <Moon className="mt-0.5 size-4 text-accent shrink-0" />
              <span><strong className="text-foreground">The Keeper of Shadows</strong> — shadow leads light by 4 or more.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <Sparkles className="mt-0.5 size-4 text-balance shrink-0" />
              <span><strong className="text-foreground">The Balance Walker</strong> — neither dominates.</span>
            </li>
          </ul>
        </GameCard>

        <GameCard>
          <h2 className="font-display text-2xl text-foreground mb-2 flex items-center gap-2">
            <Clock className="size-5 text-primary" /> Inspiration
          </h2>
          <p className="text-foreground/80 leading-relaxed">
            Light and darkness as a single rhythm. Identity as something we choose, not
            inherit. Time as a turning, not a line. Personal choices — small, quiet,
            sometimes forgotten — as the actual shape of a life.
          </p>
        </GameCard>

        <div className="text-center pt-2">
          <Link
            to="/setup"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:glow-gold transition-all"
          >
            Begin the journey <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </SiteShell>
  );
}
