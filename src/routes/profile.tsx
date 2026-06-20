import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { GameCard } from "@/components/GameCard";
import { SiteShell } from "@/components/SiteShell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, Save, Sparkles } from "lucide-react";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Your Profile — Shadow of Choices" },
      { name: "description", content: "View your account and saved solstice journeys." },
    ],
  }),
  component: Profile,
});

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [journeyCount, setJourneyCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      const { data, error } = await supabase.auth.getUser();
      if (!active) return;
      if (error || !data.user) {
        navigate({ to: "/auth" });
        return;
      }

      setUser(data.user);
      setDisplayName(getDisplayName(data.user));
      const { count } = await supabase
        .from("game_sessions")
        .select("id", { count: "exact", head: true });
      if (active) {
        setJourneyCount(count ?? 0);
        setLoading(false);
      }
    }

    void loadProfile();
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") navigate({ to: "/" });
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [navigate]);

  async function updateProfile(event: React.FormEvent) {
    event.preventDefault();
    const name = displayName.trim();
    if (!name) return toast("Enter a display name.");
    setSaving(true);

    const { data, error } = await supabase.auth.updateUser({
      data: { display_name: name },
    });
    setSaving(false);

    if (error) {
      toast(error.message);
      return;
    }
    setUser(data.user);
    toast("Profile updated.");
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast(error.message);
      return;
    }
    toast("You have signed out.");
    navigate({ to: "/" });
  }

  if (loading || !user) {
    return (
      <SiteShell>
        <div className="py-24 text-center text-muted-foreground">Reading your constellation…</div>
      </SiteShell>
    );
  }

  const avatarUrl = getMetadataString(user, "avatar_url") ?? getMetadataString(user, "picture");
  const provider =
    typeof user.app_metadata.provider === "string" ? user.app_metadata.provider : "email";
  const initials = (getDisplayName(user) || user.email || "Traveler")
    .split(/\s+/u)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <SiteShell>
      <section className="mx-auto max-w-2xl px-4 py-12 sm:py-20">
        <GameCard>
          <div className="flex flex-col items-center text-center sm:flex-row sm:text-left">
            <Avatar className="size-20 border-2 border-primary/40 glow-gold">
              {avatarUrl && <AvatarImage src={avatarUrl} alt="" referrerPolicy="no-referrer" />}
              <AvatarFallback className="font-display text-2xl text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="mt-4 sm:ml-5 sm:mt-0">
              <p className="text-xs uppercase tracking-[0.25em] text-primary">Traveler profile</p>
              <h1 className="mt-1 font-display text-4xl text-solstice">
                {getDisplayName(user) || "Wanderer"}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <ProfileFact label="Saved journeys" value={String(journeyCount ?? 0)} />
            <ProfileFact
              label="Sign-in method"
              value={provider === "google" ? "Google" : "Email"}
            />
            <ProfileFact
              label="Joined"
              value={new Date(user.created_at).toLocaleDateString(undefined, {
                month: "short",
                year: "numeric",
              })}
            />
          </div>

          <form onSubmit={updateProfile} className="mt-8 space-y-3 border-t border-border pt-7">
            <Label htmlFor="display-name">Display name</Label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                id="display-name"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                maxLength={80}
                className="h-11 flex-1"
              />
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60"
              >
                <Save className="size-4" /> {saving ? "Saving…" : "Save profile"}
              </button>
            </div>
          </form>

          <div className="mt-8 flex flex-wrap gap-3 border-t border-border pt-7">
            <Link
              to="/setup"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
            >
              <Sparkles className="size-4" /> Begin a journey
            </Link>
            <button
              type="button"
              onClick={signOut}
              className="inline-flex items-center gap-2 rounded-full border border-destructive/40 px-5 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10"
            >
              <LogOut className="size-4" /> Sign out
            </button>
          </div>
        </GameCard>
      </section>
    </SiteShell>
  );
}

function ProfileFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card/40 p-4 text-center">
      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium text-foreground">{value}</p>
    </div>
  );
}

function getMetadataString(user: User, key: string): string | null {
  const value = user.user_metadata[key];
  return typeof value === "string" && value.trim() ? value : null;
}

function getDisplayName(user: User): string {
  return (
    getMetadataString(user, "display_name") ??
    getMetadataString(user, "full_name") ??
    getMetadataString(user, "name") ??
    ""
  );
}
