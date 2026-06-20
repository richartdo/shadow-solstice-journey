import { Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function SiteShell({ children }: { children: ReactNode }) {
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => setSignedIn(Boolean(data.session)));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(Boolean(session));
    });
    return () => data.subscription.unsubscribe();
  }, []);

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast(error.message);
      return;
    }
    toast("You have signed out.");
  }

  return (
    <div className="relative min-h-screen bg-hero text-foreground overflow-x-hidden">
      <Stars />
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <Link to="/" className="group flex items-center gap-2.5">
          <img
            src="/game-icon.png"
            alt=""
            aria-hidden="true"
            className="size-9 rounded-full object-cover glow-gold"
          />
          <span className="font-display text-lg sm:text-xl tracking-wide">
            Shadow of <span className="text-solstice">Choices</span>
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <NavLink to="/leaderboard">Leaderboard</NavLink>
          <NavLink to="/about">About</NavLink>
          {signedIn ? (
            <>
              <NavLink to="/profile">Profile</NavLink>
              <button
                type="button"
                onClick={signOut}
                className="rounded-md px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-card/60 transition-colors"
              >
                Sign out
              </button>
            </>
          ) : (
            <NavLink to="/auth">Sign in</NavLink>
          )}
        </nav>
      </header>
      <main className="relative z-10">{children}</main>
      <footer className="relative z-10 mx-auto max-w-6xl px-4 py-10 sm:px-6 text-center text-xs text-muted-foreground">
        Made for the June Solstice Game Jam · Light, Shadow, Identity
      </footer>
    </div>
  );
}

function NavLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="rounded-md px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-card/60 transition-colors"
      activeProps={{ className: "text-foreground bg-card/60" }}
    >
      {children}
    </Link>
  );
}

function Stars() {
  // Deterministic positions so SSR matches client
  const stars = Array.from({ length: 40 }, (_, i) => {
    const a = (i * 9301 + 49297) % 233280;
    const b = (i * 12345 + 678) % 233280;
    const c = (i * 77777 + 99) % 233280;
    return {
      top: (a / 233280) * 100,
      left: (b / 233280) * 100,
      delay: (c / 233280) * 4,
      size: 1 + ((i * 7) % 3) * 0.5,
    };
  });
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {stars.map((s, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-foreground animate-twinkle"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            animationDelay: `${s.delay}s`,
            opacity: 0.6,
          }}
        />
      ))}
    </div>
  );
}
