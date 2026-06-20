import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteShell } from "@/components/SiteShell";
import { GameCard } from "@/components/GameCard";
import { ChoiceButton } from "@/components/ChoiceButton";
import { ScoreMeter } from "@/components/ScoreMeter";
import { ProgressTracker } from "@/components/ProgressTracker";
import { scenes, calculateEnding, type Choice } from "@/data/scenes";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/game")({
  head: () => ({
    meta: [
      { title: "The Journey — Shadow of Choices" },
      { name: "description", content: "Walk the solstice path. Every choice shapes who you become." },
    ],
  }),
  component: Game,
});

interface ChoiceRecord {
  scene_id: number;
  choice_text: string;
  light_points: number;
  shadow_points: number;
}

function Game() {
  const navigate = useNavigate();
  const [player, setPlayer] = useState<{ name: string; aiEnabled: boolean } | null>(null);
  const [sceneIndex, setSceneIndex] = useState(0);
  const [light, setLight] = useState(0);
  const [shadow, setShadow] = useState(0);
  const [history, setHistory] = useState<ChoiceRecord[]>([]);
  const [reflection, setReflection] = useState<Choice | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const [finishing, setFinishing] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = sessionStorage.getItem("soc:player");
    if (!raw) {
      navigate({ to: "/setup" });
      return;
    }
    setPlayer(JSON.parse(raw));
  }, [navigate]);

  if (!player) return <SiteShell><div className="py-24 text-center text-muted-foreground">Preparing the threshold…</div></SiteShell>;

  const scene = scenes[sceneIndex];

  function pick(choice: Choice) {
    if (transitioning || finishing) return;
    setTransitioning(true);
    setReflection(choice);
    const newLight = light + choice.lightPoints;
    const newShadow = shadow + choice.shadowPoints;
    const record: ChoiceRecord = {
      scene_id: scene.id,
      choice_text: choice.text,
      light_points: choice.lightPoints,
      shadow_points: choice.shadowPoints,
    };
    const nextHistory = [...history, record];
    setLight(newLight);
    setShadow(newShadow);
    setHistory(nextHistory);
  }

  async function continueAfterReflection() {
    setReflection(null);
    const isLast = sceneIndex >= scenes.length - 1;
    if (isLast) {
      await finishGame();
    } else {
      // brief fade for cinematic feel
      setTimeout(() => {
        setSceneIndex((i) => i + 1);
        setTransitioning(false);
      }, 250);
    }
  }

  async function finishGame() {
    setFinishing(true);
    const ending = calculateEnding(light, shadow);
    let sessionId: string | null = null;
    try {
      const { data, error } = await supabase
        .from("game_sessions")
        .insert({
          player_name: player!.name,
          light_score: light,
          shadow_score: shadow,
          ending_type: ending,
          completed_at: new Date().toISOString(),
        })
        .select("id")
        .single();
      if (!error && data) {
        sessionId = data.id;
        const sid = data.id;
        if (history.length > 0) {
          await supabase.from("player_choices").insert(
            history.map((h) => ({ ...h, session_id: sid })),
          );
        }
      }
    } catch {
      // Network issue — still proceed to ending screen
    }

    if (typeof window !== "undefined") {
      sessionStorage.setItem(
        "soc:result",
        JSON.stringify({
          sessionId,
          name: player!.name,
          aiEnabled: player!.aiEnabled,
          light,
          shadow,
          ending,
        }),
      );
    }
    navigate({ to: "/ending" });
  }

  return (
    <SiteShell>
      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-6 flex items-center justify-between gap-4">
          <ProgressTracker current={sceneIndex + 1} total={scenes.length} />
        </div>

        <div className="mb-6">
          <GameCard className="!p-4 sm:!p-5">
            <ScoreMeter lightScore={light} shadowScore={shadow} />
          </GameCard>
        </div>

        <GameCard
          key={scene.id}
          className="animate-in fade-in slide-in-from-bottom-3 duration-700"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-primary mb-3">
            Scene {scene.id}
          </p>
          <h2 className="font-display text-3xl sm:text-4xl text-foreground mb-5">
            {scene.title}
          </h2>
          <p className="font-display text-lg sm:text-xl leading-relaxed text-foreground/85 italic">
            {scene.narrative}
          </p>

          <div className="mt-8 grid gap-3">
            {scene.choices.map((c, i) => (
              <ChoiceButton
                key={`${scene.id}-${i}`}
                index={i}
                text={c.text}
                lightPoints={c.lightPoints}
                shadowPoints={c.shadowPoints}
                disabled={transitioning || finishing}
                onClick={() => pick(c)}
              />
            ))}
          </div>
        </GameCard>
      </section>

      <Dialog open={!!reflection} onOpenChange={(o) => { if (!o) void continueAfterReflection(); }}>
        <DialogContent className="glass border-border max-w-sm text-center">
          <DialogHeader>
            <div className="mx-auto mb-2 size-10 rounded-full bg-solstice flex items-center justify-center">
              <Sparkles className="size-5 text-background" />
            </div>
            <DialogTitle className="font-display text-2xl text-solstice">
              A moment passes
            </DialogTitle>
            <DialogDescription className="font-display text-lg italic text-foreground/90 pt-2">
              {reflection?.reflectionText}
            </DialogDescription>
          </DialogHeader>
          <button
            onClick={continueAfterReflection}
            className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:glow-gold transition-all"
          >
            {sceneIndex >= scenes.length - 1 ? "See your path" : "Continue"}
          </button>
        </DialogContent>
      </Dialog>
    </SiteShell>
  );
}
