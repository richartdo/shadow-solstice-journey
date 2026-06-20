import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | undefined;

function getSupabase(): SupabaseClient {
  if (client) return client;

  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error("Supabase server credentials are not configured.");
  }

  client = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return client;
}

export class SessionNotFoundError extends Error {
  constructor() {
    super("Game session not found.");
    this.name = "SessionNotFoundError";
  }
}

export class AuthenticationError extends Error {
  constructor(message = "Authentication required.") {
    super(message);
    this.name = "AuthenticationError";
  }
}

export async function authenticateAccessToken(authorization?: string): Promise<string> {
  if (!authorization?.startsWith("Bearer ")) throw new AuthenticationError();
  const token = authorization.slice("Bearer ".length).trim();
  if (!token) throw new AuthenticationError();

  const { data, error } = await getSupabase().auth.getUser(token);
  if (error || !data.user) throw new AuthenticationError("Your session is invalid or expired.");
  return data.user.id;
}

export async function assertSessionOwner(sessionId: string, userId: string): Promise<void> {
  const { data, error } = await getSupabase()
    .from("game_sessions")
    .select("id")
    .eq("id", sessionId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Supabase ownership check failed", { code: error.code, message: error.message });
    throw new Error("The game session could not be verified.");
  }
  if (!data) throw new SessionNotFoundError();
}

export async function saveEnding(
  sessionId: string,
  ending: string,
  userId: string,
): Promise<void> {
  const { data, error } = await getSupabase()
    .from("game_sessions")
    .update({ ai_ending: ending })
    .eq("id", sessionId)
    .eq("user_id", userId)
    .select("id");

  if (error) {
    console.error("Supabase ending update failed", { code: error.code, message: error.message });
    throw new Error("The generated ending could not be saved.");
  }

  if (!data || data.length === 0) throw new SessionNotFoundError();
}
