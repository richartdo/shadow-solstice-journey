
CREATE TABLE public.game_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_name TEXT NOT NULL,
  light_score INTEGER NOT NULL DEFAULT 0,
  shadow_score INTEGER NOT NULL DEFAULT 0,
  ending_type TEXT NOT NULL,
  ai_ending TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.game_sessions TO anon, authenticated;
GRANT ALL ON public.game_sessions TO service_role;
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view sessions" ON public.game_sessions FOR SELECT USING (true);
CREATE POLICY "Anyone can insert sessions" ON public.game_sessions FOR INSERT WITH CHECK (true);

CREATE TABLE public.player_choices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.game_sessions(id) ON DELETE CASCADE,
  scene_id INTEGER NOT NULL,
  choice_text TEXT NOT NULL,
  light_points INTEGER NOT NULL DEFAULT 0,
  shadow_points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.player_choices TO anon, authenticated;
GRANT ALL ON public.player_choices TO service_role;
ALTER TABLE public.player_choices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view choices" ON public.player_choices FOR SELECT USING (true);
CREATE POLICY "Anyone can insert choices" ON public.player_choices FOR INSERT WITH CHECK (true);

CREATE INDEX idx_game_sessions_created_at ON public.game_sessions(created_at DESC);
CREATE INDEX idx_player_choices_session_id ON public.player_choices(session_id);
