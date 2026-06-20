import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/generate-ending")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env.LOVABLE_API_KEY;
        const body = await request.json().catch(() => null) as {
          playerName?: string;
          ending?: string;
          lightScore?: number;
          shadowScore?: number;
        } | null;

        if (!body) return Response.json({ ok: false, message: "Invalid request." }, { status: 400 });
        if (!key) return Response.json({ ok: false, message: "AI ending will be available soon." });

        const prompt = `Write a short, poetic, second-person ending paragraph (90-130 words) for a solstice-themed narrative game.
Player name: ${body.playerName}
Final path: ${body.ending}
Light score: ${body.lightScore}
Shadow score: ${body.shadowScore}

Themes: light vs darkness, identity, change, time, personal choices, the solstice as a turning point.
Tone: mysterious, emotional, beautiful, intimate. Address the player directly as "you". Do not use headings, markdown, or quotation marks. Return only the paragraph.`;

        try {
          const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Lovable-API-Key": key },
            body: JSON.stringify({
              model: "google/gemini-3-flash-preview",
              messages: [
                { role: "system", content: "You are a poetic narrator for a solstice fantasy game." },
                { role: "user", content: prompt },
              ],
            }),
          });

          if (res.status === 429) return Response.json({ ok: false, message: "The oracle is resting. Try again shortly." });
          if (res.status === 402) return Response.json({ ok: false, message: "AI credits exhausted." });
          if (!res.ok) return Response.json({ ok: false, message: "AI ending will be available soon." });

          const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
          const text = json.choices?.[0]?.message?.content?.trim();
          if (!text) return Response.json({ ok: false, message: "AI ending will be available soon." });
          return Response.json({ ok: true, ending: text });
        } catch {
          return Response.json({ ok: false, message: "AI ending will be available soon." });
        }
      },
    },
  },
});
