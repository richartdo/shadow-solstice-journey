import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteShell } from "@/components/SiteShell";
import { EndingCard } from "@/components/EndingCard";
import { endingPoetry, type EndingType } from "@/data/scenes";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sparkles, RotateCcw, Share2, Save, Trophy } from "lucide-react";

export const Route = createFileRoute("/ending")({
  head: () => ({
    meta: [
      { title: "Your Path — Shadow of Choices" },
      { name: "description", content: "Discover which solstice soul you have become." },
    ],
  }),
  component: Ending,
});

interface Result {
  sessionId: string | null;
  name: string;
  aiEnabled: boolean;
  light: number;
  shadow: number;
  ending: EndingType;
}

function Ending() {
  const navigate = useNavigate();
  const [result, setResult] = useState<Result | null>(null);
  const [aiEnding, setAiEnding] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = sessionStorage.getItem("soc:result");
    if (!raw) {
      navigate({ to: "/" });
      return;
    }
    setResult(JSON.parse(raw));
  }, [navigate]);

  if (!result) {
    return <SiteShell><div className="py-24 text-center text-muted-foreground">Reading the stars…</div></SiteShell>;
  }

  async function generateAi() {
    if (!result || aiLoading) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/generate-ending", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerName: result.name,
          ending: result.ending,
          lightScore: result.light,
          shadowScore: result.shadow,
        }),
      });
      const json = (await res.json()) as { ok: boolean; ending?: string; message?: string };
      if (json.ok && json.ending) {
        setAiEnding(json.ending);
        // Persist if we have a session
        if (result.sessionId) {
          await supabase
            .from("game_sessions")
            .update({ ai_ending: json.ending })
            .eq("id", result.sessionId);
        }
      } else {
        toast(json.message || "AI ending will be available soon.");
      }
    } catch {
      toast("AI ending will be available soon.");
    } finally {
      setAiLoading(false);
    }
  }

  async function share() {
    if (!result) return;
    const text = `I walked the solstice as ${result.name} and became ${result.ending}. Light ${result.light} · Shadow ${result.shadow}.`;
    const url = typeof window !== "undefined" ? window.location.origin : "";
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "Shadow of Choices", text, url });
        return;
      } catch { /* fall through */ }
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(`${text} ${url}`);
      toast("Result copied to clipboard");
    }
  }

  function save() {
    if (saved) return toast("Already saved to the leaderboard");
    if (result?.sessionId) {
      setSaved(true);
      toast("Saved to the leaderboard");
    } else {
      toast("Could not reach the leaderboard. Try again later.");
    }
  }

  return (
    <SiteShell>
      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-12 sm:py-20">
        <EndingCard
          ending={result.ending}
          playerName={result.name}
          lightScore={result.light}
          shadowScore={result.shadow}
          poetry={endingPoetry[result.ending]}
          aiEnding={aiEnding}
        />

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {result.aiEnabled && !aiEnding && (
            <button
              onClick={generateAi}
              disabled={aiLoading}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:glow-gold transition-all disabled:opacity-60"
            >
              <Sparkles className={`size-4 ${aiLoading ? "animate-pulse" : ""}`} />
              {aiLoading ? "Weaving your ending…" : "Generate Personalized Ending"}
            </button>
          )}
          <Link
            to="/setup"
            className="inline-flex items-center gap-2 rounded-full glass px-5 py-2.5 text-sm font-medium hover:border-primary/50 transition-all"
          >
            <RotateCcw className="size-4" /> Play Again
          </Link>
          <button
            onClick={share}
            className="inline-flex items-center gap-2 rounded-full glass px-5 py-2.5 text-sm font-medium hover:border-primary/50 transition-all"
          >
            <Share2 className="size-4" /> Share Result
          </button>
          <button
            onClick={save}
            className="inline-flex items-center gap-2 rounded-full glass px-5 py-2.5 text-sm font-medium hover:border-primary/50 transition-all"
          >
            <Save className="size-4" /> Save Result
          </button>
          <Link
            to="/leaderboard"
            className="inline-flex items-center gap-2 rounded-full glass px-5 py-2.5 text-sm font-medium hover:border-primary/50 transition-all"
          >
            <Trophy className="size-4" /> Leaderboard
          </Link>
        </div>
      </section>
    </SiteShell>
  );
}
