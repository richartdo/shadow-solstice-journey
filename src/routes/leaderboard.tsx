import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteShell } from "@/components/SiteShell";
import { GameCard } from "@/components/GameCard";
import { supabase } from "@/integrations/supabase/client";
import { Sun, Moon, Trophy, Sparkles } from "lucide-react";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({
    meta: [
      { title: "Leaderboard — Shadow of Choices" },
      { name: "description", content: "See the paths walked by other solstice travelers." },
    ],
  }),
  component: Leaderboard,
});

function formatDate(s: string) {
  try {
    const d = new Date(s);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return s;
  }
}

function Leaderboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("game_sessions")
        .select("id, player_name, ending_type, light_score, shadow_score, created_at")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <SiteShell>
      <section className="mx-auto max-w-4xl px-4 sm:px-6 py-12 sm:py-16">
        <div className="mb-8 text-center">
          <Trophy className="mx-auto mb-3 size-7 text-primary" />
          <h1 className="font-display text-4xl sm:text-5xl text-solstice">Leaderboard</h1>
          <p className="mt-2 text-sm text-muted-foreground">Recent travelers of the solstice.</p>
        </div>

        <GameCard className="!p-0 overflow-hidden">
          {isLoading && (
            <div className="p-10 text-center text-muted-foreground">Gathering travelers…</div>
          )}
          {error && (
            <div className="p-10 text-center text-destructive">Could not load the leaderboard.</div>
          )}
          {!isLoading && !error && data && data.length === 0 && (
            <div className="p-10 text-center text-muted-foreground">
              No travelers yet. <Link to="/setup" className="text-primary underline">Be the first</Link>.
            </div>
          )}
          {!isLoading && !error && data && data.length > 0 && (
            <>
              {/* Desktop table */}
              <table className="hidden sm:table w-full text-sm">
                <thead className="border-b border-border text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  <tr>
                    <th className="text-left px-5 py-3 font-medium">Player</th>
                    <th className="text-left px-5 py-3 font-medium">Ending</th>
                    <th className="text-right px-5 py-3 font-medium">Light</th>
                    <th className="text-right px-5 py-3 font-medium">Shadow</th>
                    <th className="text-right px-5 py-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((r) => (
                    <tr key={r.id} className="border-b border-border/60 hover:bg-card/40 transition-colors">
                      <td className="px-5 py-3 font-medium text-foreground">{r.player_name}</td>
                      <td className="px-5 py-3">
                        <span className="inline-flex items-center gap-1.5 text-foreground/90">
                          <EndingIcon ending={r.ending_type} /> {r.ending_type}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums text-gold">{r.light_score}</td>
                      <td className="px-5 py-3 text-right tabular-nums text-accent">{r.shadow_score}</td>
                      <td className="px-5 py-3 text-right text-muted-foreground">{formatDate(r.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Mobile list */}
              <ul className="sm:hidden divide-y divide-border">
                {data.map((r) => (
                  <li key={r.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground">{r.player_name}</span>
                      <span className="text-xs text-muted-foreground">{formatDate(r.created_at)}</span>
                    </div>
                    <div className="mt-1 text-sm inline-flex items-center gap-1.5">
                      <EndingIcon ending={r.ending_type} /> {r.ending_type}
                    </div>
                    <div className="mt-2 flex gap-4 text-xs">
                      <span className="text-gold">☀ {r.light_score}</span>
                      <span className="text-accent">☾ {r.shadow_score}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </GameCard>
      </section>
    </SiteShell>
  );
}

function EndingIcon({ ending }: { ending: string }) {
  if (ending === "The Dawn Bringer") return <Sun className="size-3.5 text-gold" />;
  if (ending === "The Keeper of Shadows") return <Moon className="size-3.5 text-accent" />;
  return <Sparkles className="size-3.5 text-balance" />;
}
