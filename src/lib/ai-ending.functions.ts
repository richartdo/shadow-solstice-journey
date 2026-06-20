import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({
  playerName: z.string().min(1).max(80),
  ending: z.string().min(1).max(80),
  lightScore: z.number().int(),
  shadowScore: z.number().int(),
});

export const generateEnding = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => Input.parse(input))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) {
      return {
        ok: false as const,
        message: "AI ending will be available soon.",
      };
    }

    const prompt = `Write a short, poetic, second-person ending paragraph (90-130 words) for a solstice-themed narrative game.
Player name: ${data.playerName}
Final path: ${data.ending}
Light score: ${data.lightScore}
Shadow score: ${data.shadowScore}

Themes: light vs darkness, identity, change, time, personal choices, the solstice as a turning point.
Tone: mysterious, emotional, beautiful, intimate. Address the player directly as "you". Do not use headings, markdown, or quotation marks. Return only the paragraph.`;

    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Lovable-API-Key": key,
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: "You are a poetic narrator for a solstice fantasy game." },
            { role: "user", content: prompt },
          ],
        }),
      });

      if (res.status === 429) {
        return { ok: false as const, message: "The oracle is resting. Please try again in a moment." };
      }
      if (res.status === 402) {
        return { ok: false as const, message: "AI credits exhausted. Please add credits to continue." };
      }
      if (!res.ok) {
        return { ok: false as const, message: "AI ending will be available soon." };
      }

      const json = (await res.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const text = json.choices?.[0]?.message?.content?.trim();
      if (!text) {
        return { ok: false as const, message: "AI ending will be available soon." };
      }
      return { ok: true as const, ending: text };
    } catch {
      return { ok: false as const, message: "AI ending will be available soon." };
    }
  });
