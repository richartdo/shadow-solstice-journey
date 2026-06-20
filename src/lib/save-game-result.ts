import type { EndingType } from "@/data/scenes";
import { supabase } from "@/integrations/supabase/client";

export interface StoredChoice {
  sceneId: number;
  sceneTitle: string;
  choiceText: string;
  lightPoints: number;
  shadowPoints: number;
}

export interface GameResultToSave {
  playerName: string;
  lightScore: number;
  shadowScore: number;
  endingType: EndingType;
  choices: StoredChoice[];
}

export type SaveGameResultOutcome =
  | { status: "saved"; sessionId: string }
  | { status: "anonymous" }
  | { status: "error"; message: string };

export async function saveGameResult(result: GameResultToSave): Promise<SaveGameResultOutcome> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return { status: "anonymous" };

  const { data, error } = await supabase.rpc("save_game_result", {
    p_player_name: result.playerName,
    p_light_score: result.lightScore,
    p_shadow_score: result.shadowScore,
    p_ending_type: result.endingType,
    p_choices: result.choices.map((choice) => ({
      scene_id: choice.sceneId,
      choice_text: choice.choiceText,
      light_points: choice.lightPoints,
      shadow_points: choice.shadowPoints,
    })),
  });

  if (error || !data) {
    console.error("Could not save game result", error);
    return { status: "error", message: "Your journey could not be saved. Please try again." };
  }

  return { status: "saved", sessionId: data };
}
