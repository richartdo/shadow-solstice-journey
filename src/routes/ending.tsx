import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteShell } from "@/components/SiteShell";
import { EndingCard } from "@/components/EndingCard";
import { endingPoetry, type EndingType } from "@/data/scenes";
import { supabase } from "@/integrations/supabase/client";
import { saveGameResult } from "@/lib/save-game-result";
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
  choices: Array<{
    sceneId?: number;
    sceneTitle: string;
    choiceText: string;
    lightPoints: number;
    shadowPoints: number;
  }>;
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/u, "");

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
    const stored = JSON.parse(raw) as Result;
    setResult(stored);
    setSaved(Boolean(stored.sessionId));
  }, [navigate]);

  if (!result) {
    return (
      <SiteShell>
        <div className="py-24 text-center text-muted-foreground">Reading the stars…</div>
      </SiteShell>
    );
  }

  async function generateAi() {
    if (!result || aiLoading) return;
    setAiLoading(true);
    try {
      if (!result.sessionId) {
        toast("Save this journey with an account before generating its AI ending.");
        return;
      }

      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) {
        toast("Sign in again to generate your personalized ending.");
        navigate({ to: "/auth" });
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/generate-ending`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          playerName: result.name,
          sessionId: result.sessionId,
          endingType: result.ending,
          lightScore: result.light,
          shadowScore: result.shadow,
          choices: result.choices.map((choice) => ({
            sceneTitle: choice.sceneTitle,
            choiceText: choice.choiceText,
            lightPoints: choice.lightPoints,
            shadowPoints: choice.shadowPoints,
          })),
        }),
      });
      const json = (await res.json()) as { success: boolean; ending?: string; error?: string };
      if (res.ok && json.success && json.ending) {
        setAiEnding(json.ending);
      } else {
        toast(json.error || "AI ending will be available soon.");
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
      } catch {
        /* fall through */
      }
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(`${text} ${url}`);
      toast("Result copied to clipboard");
    }
  }

  async function save() {
    if (!result) return;
    if (saved) return toast("Already saved to the leaderboard");

    const outcome = await saveGameResult({
      playerName: result.name,
      lightScore: result.light,
      shadowScore: result.shadow,
      endingType: result.ending,
      choices: result.choices.map((choice, index) => ({
        sceneId: choice.sceneId ?? index + 1,
        sceneTitle: choice.sceneTitle,
        choiceText: choice.choiceText,
        lightPoints: choice.lightPoints,
        shadowPoints: choice.shadowPoints,
      })),
    });

    if (outcome.status === "anonymous") {
      toast("Sign in or create an account to save this journey.");
      navigate({ to: "/auth" });
      return;
    }
    if (outcome.status === "error") {
      toast(outcome.message);
      return;
    }

    const updatedResult = { ...result, sessionId: outcome.sessionId };
    setResult(updatedResult);
    sessionStorage.setItem("soc:result", JSON.stringify(updatedResult));
    if (outcome.status === "saved") {
      setSaved(true);
      toast("Saved to the leaderboard");
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
            disabled={saved}
            className="inline-flex items-center gap-2 rounded-full glass px-5 py-2.5 text-sm font-medium hover:border-primary/50 transition-all"
          >
            <Save className="size-4" /> {saved ? "Saved" : "Save Result"}
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
