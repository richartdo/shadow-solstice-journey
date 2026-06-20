# Shadow of Choices: A Solstice Journey

An interactive narrative game about light, darkness, identity, and change. The player walks through seven symbolic scenes during the solstice, makes emotionally meaningful choices, and discovers one of three possible identities. Authenticated players can save their journeys, appear on a public leaderboard, and generate a personalized poetic ending through OpenRouter.

## Contents

- [How the game works](#how-the-game-works)
- [Features](#features)
- [Technology](#technology)
- [Project structure](#project-structure)
- [Local setup](#local-setup)
- [Environment variables](#environment-variables)
- [Supabase database setup](#supabase-database-setup)
- [Authentication setup](#authentication-setup)
- [OpenRouter setup](#openrouter-setup)
- [Running the application](#running-the-application)
- [AI ending API](#ai-ending-api)
- [Database and security model](#database-and-security-model)
- [Building and testing](#building-and-testing)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## How the game works

The player begins by entering a name or nickname and deciding whether to enable a personalized AI ending. The journey then presents seven solstice-themed scenes. Every scene offers three broad approaches:

- A light-oriented choice
- A shadow-oriented choice
- A balanced choice

Choices add light and shadow points. Neither side is presented as simply good or evil: light can represent openness, compassion, and renewal, while shadow can represent difficult truth, ambition, memory, and the unknown.

At the end of the seventh scene, the score determines one of three paths:

| Ending | Rule |
| --- | --- |
| The Dawn Bringer | Light exceeds shadow by at least 4 points |
| The Keeper of Shadows | Shadow exceeds light by at least 4 points |
| The Balance Walker | The score difference is fewer than 4 points |

Guests can complete the full journey locally. Signed-in players can permanently save the result, enter the leaderboard, and request an AI-generated ending based on their name, scores, ending type, and individual decisions.

## Features

- Seven interactive narrative scenes
- Light and shadow scoring
- Three calculated endings
- Responsive React interface
- Guest play without registration
- Email/password authentication through Supabase
- Google OAuth through Supabase
- User profiles with display names, avatars, journey counts, and sign-out controls
- Authenticated journey saving
- Public leaderboard with restricted fields
- Personalized 120–180-word AI endings through OpenRouter
- Server-side Supabase updates using the service-role key
- Request validation, CORS, rate limiting, security headers, and provider timeouts
- Row Level Security and user-owned database records

## Technology

### Frontend

- React 19
- TypeScript
- TanStack Start and TanStack Router
- TanStack Query
- Tailwind CSS
- Radix UI components
- Supabase JavaScript client
- Vite
- Lovable project tooling

### Backend

- Node.js 20+
- Express 5
- TypeScript
- Zod validation
- Supabase service client
- OpenRouter chat-completions API
- Helmet, CORS, and Express rate limiting

### Database and authentication

- Supabase Postgres
- Supabase Auth
- Row Level Security
- Email/password and Google OAuth providers

## Project structure

```text
shadow-solstice-journey/
├── backend/
│   ├── src/
│   │   ├── index.ts
│   │   ├── routes/generateEnding.ts
│   │   ├── services/aiService.ts
│   │   ├── services/supabaseService.ts
│   │   └── utils/validateRequest.ts
│   ├── package.json
│   └── tsconfig.json
├── public/
│   └── game-icon.png
├── src/
│   ├── components/
│   ├── data/scenes.ts
│   ├── integrations/supabase/
│   ├── lib/save-game-result.ts
│   └── routes/
│       ├── auth.tsx
│       ├── game.tsx
│       ├── ending.tsx
│       ├── leaderboard.tsx
│       └── ...
├── supabase/
│   ├── config.toml
│   └── migrations/
├── .env.example
├── package.json
└── README.md
```

The React application and Express API live in the same repository but run as separate development processes. Both read the single root `.env` file. Vite exposes only variables whose names begin with `VITE_`.

## Local setup

### Prerequisites

- Node.js 20 or newer
- pnpm 10 or newer for the frontend
- npm for the backend
- A Supabase project
- An OpenRouter API key
- A Google Cloud project only if Google sign-in is required

Clone or open the project, then install both sets of dependencies:

```powershell
cd shadow-solstice-journey
pnpm install
cd backend
npm install
cd ..
```

Create the local environment file:

```powershell
Copy-Item .env.example .env
```

Fill in the values before starting the application.

## Environment variables

The project uses one root `.env` file:

```env
# Browser-safe Supabase values
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
VITE_API_BASE_URL=http://localhost:4000

# Server-side Supabase values
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_PUBLISHABLE_KEY=your-publishable-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Express API
PORT=4000
FRONTEND_URL=http://localhost:5173

# AI provider
AI_PROVIDER=openrouter
OPENROUTER_API_KEY=your-openrouter-key

# Reserved for future provider adapters
GEMINI_API_KEY=
OPENAI_API_KEY=
```

### Public and private values

The following values are designed for frontend use:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_API_BASE_URL`

These values must remain server-side:

- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENROUTER_API_KEY`
- `GEMINI_API_KEY`
- `OPENAI_API_KEY`

Never add a private key to a variable beginning with `VITE_`. Vite embeds those variables in browser code.

The Express entry point explicitly loads the root `.env`, whether it runs from `backend/src` in development or `backend/dist` in production.

### Protecting `.env`

`.env` is ignored by `.gitignore`. If the file was previously committed, ignoring it does not automatically remove it from Git tracking. Remove it from the Git index while retaining the local file:

```powershell
git rm --cached .env
```

Commit that removal before adding service-role or AI secrets.

## Supabase database setup

Create a Supabase project, then copy its project URL, publishable key, and service-role key into `.env`.

Apply the SQL migrations in filename order:

1. `supabase/migrations/20260620072012_d9d704fd-0240-48a7-a8f0-0725e5d1881d.sql`
2. `supabase/migrations/20260620120000_add_authenticated_game_ownership.sql`

For a simple setup, open Supabase Dashboard → SQL Editor, paste each migration, and run them one at a time in that order.

The first migration creates:

- `game_sessions`
- `player_choices`
- Their foreign key and indexes
- Initial grants and RLS policies

The second migration:

- Adds `game_sessions.user_id`
- Connects sessions to `auth.users`
- Replaces public insert/read policies with ownership policies
- Adds `save_game_result(...)` for atomic authenticated saves
- Adds `get_leaderboard(...)` for limited public leaderboard data

If using a newly created Supabase project, update the `project_id` in `supabase/config.toml` or relink the Supabase CLI before using CLI migration commands.

## Authentication setup

Authentication is optional for playing but required for persistent saves, leaderboard entries, and AI endings.

### Application URLs

In Supabase Dashboard → Authentication → URL Configuration, configure:

```text
Site URL: http://localhost:5173
Redirect URL: http://localhost:5173/auth
```

Before deployment, also add:

```text
https://YOUR_FRONTEND_DOMAIN
https://YOUR_FRONTEND_DOMAIN/auth
```

### Email and password

Enable the Email provider in Supabase Authentication Providers. If email confirmation is enabled, new users must follow the confirmation link before signing in. Ensure the confirmation redirect is permitted by the redirect URL list.

The `/auth` route supports:

- Account creation
- Email/password sign-in
- Sign-out
- Returning the player to `/ending` when a completed local journey is waiting to be saved

The protected `/profile` route displays the account avatar, email, sign-in provider, join date, and saved-journey count. Players can update their display name or sign out from either the profile or site header.

### Google authentication

Google OAuth is implemented through `supabase.auth.signInWithOAuth`.

1. Open Google Cloud Console.
2. Configure the OAuth consent screen.
3. Create an OAuth 2.0 Client ID with application type **Web application**.
4. Add authorized JavaScript origins:

```text
http://localhost:5173
https://YOUR_FRONTEND_DOMAIN
```

5. Add the Supabase callback as an authorized redirect URI:

```text
https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
```

6. In Supabase Dashboard → Authentication → Providers → Google, enable Google and enter the Google Client ID and Client Secret.
7. Keep the local and deployed `/auth` routes in the Supabase redirect allow list.

The Google client secret belongs only in the Supabase dashboard. It is not an application environment variable.

## OpenRouter setup

Create an OpenRouter API key and add it to the root `.env`:

```env
AI_PROVIDER=openrouter
OPENROUTER_API_KEY=your-openrouter-key
```

The current AI adapter uses the OpenRouter chat-completions endpoint with the model configured in `backend/src/services/aiService.ts`. The prompt requests a family-friendly ending that:

- Contains 120–180 words
- Uses the player's name and decisions
- Connects the solstice, identity, light, darkness, and change
- Remains emotional and hopeful
- Treats submitted story strings as untrusted data
- Returns plain prose without headings or Markdown

The browser never receives the OpenRouter key.

## Running the application

The frontend and backend run in separate terminals.

### Terminal 1: frontend

From the project root:

```powershell
pnpm run dev
```

The frontend normally runs at:

```text
http://localhost:5173
```

### Terminal 2: backend

```powershell
cd backend
npm run dev
```

The backend normally runs at:

```text
http://localhost:4000
```

Health check:

```text
GET http://localhost:4000/health
```

The frontend sends ending requests to the URL defined by `VITE_API_BASE_URL`.

## AI ending API

### Request

```http
POST /api/generate-ending
Authorization: Bearer SUPABASE_ACCESS_TOKEN
Content-Type: application/json
```

```json
{
  "sessionId": "7b9cba42-2f5a-4aa7-95b3-96fe15f15a82",
  "playerName": "Brian",
  "lightScore": 8,
  "shadowScore": 5,
  "endingType": "The Balance Walker",
  "choices": [
    {
      "sceneTitle": "The Mirror Lake",
      "choiceText": "Speak the truth aloud to the sky",
      "lightPoints": 2,
      "shadowPoints": 0
    }
  ]
}
```

### Success response

```json
{
  "success": true,
  "ending": "Generated ending text..."
}
```

### Error responses

Errors use the following general structure:

```json
{
  "success": false,
  "error": "Description of the error"
}
```

Common status codes:

| Status | Meaning |
| --- | --- |
| `400` | Invalid JSON or request fields |
| `401` | Missing, invalid, or expired Supabase access token |
| `404` | Session does not exist or does not belong to the user |
| `429` | Rate limit or AI-provider capacity limit |
| `500` | Unexpected server or database operation failed |
| `502` | AI provider request failed |
| `503` | Required provider configuration is missing |
| `504` | AI provider timed out |

Before spending an AI request, the backend:

1. Validates the request with Zod.
2. Verifies the Supabase bearer token.
3. Verifies that the authenticated user owns `sessionId`.
4. Calls OpenRouter.
5. Updates `game_sessions.ai_ending` using the service role.

## Database and security model

### `game_sessions`

Stores:

- Session UUID
- Authenticated owner UUID
- Player name
- Light score
- Shadow score
- Ending type
- AI-generated ending
- Completion and creation timestamps

### `player_choices`

Stores:

- Choice UUID
- Parent session UUID
- Scene number
- Choice text
- Light points
- Shadow points
- Creation timestamp

Deleting an authenticated user cascades to their game sessions, and deleting a session cascades to its choices.

### Atomic saving

The frontend calls the authenticated `save_game_result(...)` database function. It creates the session and its choices in one database transaction. If choice insertion fails, the session insertion is rolled back as well.

### Row Level Security

- Authenticated users can read only their own sessions.
- Authenticated users can read only choices belonging to their sessions.
- Guests cannot write game records.
- The service role is used only by the Express server.
- The public leaderboard calls `get_leaderboard(...)`, which returns only the session ID, player name, ending, scores, and creation date.
- Private choice history and AI ending text are not returned by the public leaderboard function.

The service-role key bypasses RLS and must never be exposed to the browser.

## Building and testing

### Frontend lint

```powershell
pnpm run lint
```

### Frontend production build

```powershell
pnpm run build
```

### Preview the frontend build

```powershell
pnpm run preview
```

### Backend typecheck

```powershell
cd backend
npm run typecheck
```

### Backend production build

```powershell
cd backend
npm run build
```

### Start compiled backend

```powershell
cd backend
npm start
```

Build output is written to:

- Frontend: `dist/`
- Backend: `backend/dist/`

## Deployment

The frontend and Express backend may be deployed independently.

### Vercel frontend deployment

The Vite configuration enables Nitro's `vercel` preset and produces Vercel Build Output API files in `.vercel/output`.

When importing the GitHub repository into Vercel, use:

```text
Root Directory: ./
Framework Preset: Other
Install Command: pnpm install
Build Command: pnpm run build
Output Directory: leave empty
```

Do not set the output directory to `dist` or `dist/client`; the application uses server-side rendering and Nitro supplies both the static assets and server function through `.vercel/output`.

### Frontend

Configure these variables in the frontend hosting environment:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
VITE_API_BASE_URL=https://YOUR_API_DOMAIN
```

### Backend

Configure these values in the backend hosting environment:

```env
PORT=4000
FRONTEND_URL=https://YOUR_FRONTEND_DOMAIN
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
AI_PROVIDER=openrouter
OPENROUTER_API_KEY=your-openrouter-key
```

Do not upload the local `.env` file. Use the hosting provider's encrypted environment-variable settings.

After deployment:

1. Set `VITE_API_BASE_URL` to the deployed Express API URL.
2. Set backend `FRONTEND_URL` to the deployed frontend origin. Multiple origins can be comma-separated.
3. Add the deployed frontend URL and `/auth` route to Supabase Auth URL Configuration.
4. Add the deployed frontend origin to the Google OAuth client.
5. Confirm that the backend health endpoint responds.
6. Test email login, Google login, saving, leaderboard loading, and AI generation.

## Logo and application icon

The game logo is stored at:

```text
public/game-icon.png
```

It is used as the browser favicon, Apple touch icon, and header logo. Replace that file while keeping the filename to update the branding everywhere. A square 512×512 PNG is recommended.

## Troubleshooting

### Supabase tables do not exist

Run both SQL migrations in order against the same project referenced by `VITE_SUPABASE_URL` and `SUPABASE_URL`.

### `Invalid API key` or Supabase connection errors

Confirm that the project URL and keys all come from the same Supabase project. Restart both development processes after editing `.env`.

### Email registration succeeds but login fails

Check whether email confirmation is enabled. Confirm the account through the received email, then sign in.

### Google reports a redirect URI mismatch

The Google OAuth redirect URI must be the Supabase callback, not the frontend `/auth` page:

```text
https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
```

The frontend `/auth` URL belongs in the Supabase redirect allow list.

### A guest result is not on the leaderboard

This is intentional. Guests can finish locally but must sign in and select **Save Result** before the journey is persisted.

### AI generation returns `401`

Sign in again. The backend requires a current Supabase access token.

### AI generation returns `404`

The requested session was not found for the signed-in user. Save the journey first and ensure the same account owns it.

### AI generation returns `503`

Check `AI_PROVIDER`, `OPENROUTER_API_KEY`, `SUPABASE_URL`, and `SUPABASE_SERVICE_ROLE_KEY` in the backend environment.

### Browser blocks the API with CORS

Set backend `FRONTEND_URL` to the frontend's exact origin, including scheme and port but no path:

```env
FRONTEND_URL=http://localhost:5173
```

For multiple allowed origins, separate them with commas.

### Favicon does not update

Use a hard refresh or clear the browser favicon cache. Browsers often cache icons independently from page assets.

## Current AI provider support

`openrouter` is currently implemented. `GEMINI_API_KEY` and `OPENAI_API_KEY` are reserved for future adapters and are not used by the present backend.
