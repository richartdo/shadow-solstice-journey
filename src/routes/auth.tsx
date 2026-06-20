import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { GameCard } from "@/components/GameCard";
import { SiteShell } from "@/components/SiteShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { LogIn, UserPlus } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign In — Shadow of Choices" },
      { name: "description", content: "Sign in to save your solstice journeys." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentEmail, setCurrentEmail] = useState<string | null>(null);

  const goToNextPage = useCallback(() => {
    const hasFinishedJourney = sessionStorage.getItem("soc:result") !== null;
    navigate({ to: hasFinishedJourney ? "/ending" : "/setup" });
  }, [navigate]);

  useEffect(() => {
    function handleSignedInUser(userEmail?: string) {
      setCurrentEmail(userEmail ?? null);
      if (userEmail && sessionStorage.getItem("soc:google-auth-pending")) {
        sessionStorage.removeItem("soc:google-auth-pending");
        toast("Signed in with Google.");
        goToNextPage();
      }
    }

    void supabase.auth.getUser().then(({ data }) => handleSignedInUser(data.user?.email));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSignedInUser(session?.user.email);
    });
    return () => data.subscription.unsubscribe();
  }, [goToNextPage]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast("Welcome back. Your path remembers you.");
        goToNextPage();
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth` },
      });
      if (error) throw error;
      if (data.session) {
        toast("Your account is ready.");
        goToNextPage();
      } else {
        toast("Check your email to confirm your account, then sign in.");
        setMode("signin");
      }
    } catch (error) {
      toast(error instanceof Error ? error.message : "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function signInWithGoogle() {
    if (loading) return;
    setLoading(true);
    sessionStorage.setItem("soc:google-auth-pending", "true");

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth` },
    });

    if (error) {
      sessionStorage.removeItem("soc:google-auth-pending");
      toast(error.message);
      setLoading(false);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    setCurrentEmail(null);
    toast("You have signed out.");
  }

  if (currentEmail) {
    return (
      <SiteShell>
        <section className="mx-auto max-w-lg px-4 py-16 sm:py-24">
          <GameCard className="text-center">
            <h1 className="font-display text-4xl text-solstice">You are signed in</h1>
            <p className="mt-3 text-sm text-muted-foreground">{currentEmail}</p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link
                to="/setup"
                className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
              >
                Begin a journey
              </Link>
              <button
                onClick={signOut}
                className="rounded-full glass px-5 py-2.5 text-sm font-medium"
              >
                Sign out
              </button>
            </div>
          </GameCard>
        </section>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <section className="mx-auto max-w-lg px-4 py-16 sm:py-24">
        <GameCard>
          <div className="text-center">
            {mode === "signin" ? (
              <LogIn className="mx-auto mb-3 size-7 text-primary" />
            ) : (
              <UserPlus className="mx-auto mb-3 size-7 text-primary" />
            )}
            <h1 className="font-display text-4xl text-solstice">
              {mode === "signin" ? "Return to Your Path" : "Remember Your Journey"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {mode === "signin"
                ? "Sign in to save results and create personalized endings."
                : "Create an account to keep your journeys across devices."}
            </p>
          </div>

          <button
            type="button"
            onClick={signInWithGoogle}
            disabled={loading}
            className="mt-8 flex w-full items-center justify-center gap-3 rounded-full border border-border bg-card/60 py-3 text-sm font-medium text-foreground transition-colors hover:bg-card disabled:opacity-60"
          >
            <span
              aria-hidden="true"
              className="inline-flex size-5 items-center justify-center rounded-full bg-white font-sans text-sm font-bold text-[#4285f4]"
            >
              G
            </span>
            Continue with Google
          </button>

          <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            or use email
            <span className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={submit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                minLength={6}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-primary py-3 text-sm font-medium text-primary-foreground disabled:opacity-60"
            >
              {loading
                ? "Crossing the threshold…"
                : mode === "signin"
                  ? "Sign in"
                  : "Create account"}
            </button>
          </form>

          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="mt-5 w-full text-center text-sm text-muted-foreground hover:text-foreground"
          >
            {mode === "signin"
              ? "New traveler? Create an account"
              : "Already have an account? Sign in"}
          </button>
        </GameCard>
      </section>
    </SiteShell>
  );
}
