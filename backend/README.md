# Shadow of Choices ending API

Express + TypeScript service that creates a personalized ending with OpenRouter and writes it to `game_sessions.ai_ending` using the Supabase service role.

## Requirements

- Node.js 20 or newer
- A Supabase project containing the existing `game_sessions` table
- An OpenRouter API key

Never expose `SUPABASE_SERVICE_ROLE_KEY` or an AI key in frontend code. The project uses one root `.env`; Vite exposes only variables prefixed with `VITE_`.

## Exact setup commands

From the project root:

```powershell
Copy-Item .env.example .env
cd backend
npm install
```

Fill in the project-root `.env`, then run development mode:

```powershell
npm run dev
```

Build and run the production output:

```powershell
npm run build
npm start
```

The API defaults to `http://localhost:4000`; its health check is `GET /health`.

## Configuration

`FRONTEND_URL` is the allowed CORS origin. For multiple deployed origins, use a comma-separated value. `AI_PROVIDER` currently accepts `openrouter`; the Gemini and OpenAI key variables are placeholders for future adapters.

Frontend variables use the `VITE_` prefix in the same root `.env`:

```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
VITE_API_BASE_URL=http://localhost:4000
```

## Supabase authentication setup

Run both SQL files in `supabase/migrations` in filename order. In Supabase Authentication URL Configuration, set the local Site URL to `http://localhost:5173` and add `http://localhost:5173/auth` as a redirect URL. Add the equivalent deployed URLs before production.

Email/password authentication must be enabled in Supabase. Guests can play locally; authenticated players can save results, enter the public leaderboard, and request AI endings.

### Google sign-in

1. In Google Cloud Console, configure the OAuth consent screen and create an OAuth 2.0 **Web application** client.
2. Add `http://localhost:5173` and your deployed frontend URL as authorized JavaScript origins.
3. Add `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback` as an authorized redirect URI.
4. In Supabase Authentication Providers, enable Google and enter the Google client ID and client secret.
5. Keep `http://localhost:5173/auth` and the deployed `/auth` URL in the Supabase redirect allow list.

The Google client secret belongs in the Supabase dashboard, not in this application's `.env` file.

## Endpoint

`POST /api/generate-ending`

Send the signed-in player's Supabase access token as `Authorization: Bearer <token>`. The API verifies both the token and ownership of `sessionId` before making a paid AI request.

```json
{
  "sessionId": "7b9cba42-2f5a-4aa7-95b3-96fe15f15a82",
  "playerName": "Brian",
  "lightScore": 8,
  "shadowScore": 5,
  "endingType": "The Balance Walker",
  "choices": [
    {
      "sceneTitle": "The Mirror of Morning",
      "choiceText": "Face the truth",
      "lightPoints": 2,
      "shadowPoints": 0
    }
  ]
}
```

Success response:

```json
{
  "success": true,
  "ending": "The personalized ending text..."
}
```

The route validates every field, rate-limits generation, times out stalled provider calls, updates Supabase only after generation succeeds, and returns JSON errors with suitable HTTP status codes.
