ALTER TABLE public.game_sessions
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_game_sessions_user_id
  ON public.game_sessions(user_id);

DROP POLICY IF EXISTS "Anyone can view sessions" ON public.game_sessions;
DROP POLICY IF EXISTS "Anyone can insert sessions" ON public.game_sessions;
DROP POLICY IF EXISTS "Players can view their sessions" ON public.game_sessions;
DROP POLICY IF EXISTS "Players can insert their sessions" ON public.game_sessions;

REVOKE ALL ON public.game_sessions FROM anon, authenticated;
GRANT SELECT ON public.game_sessions TO authenticated;

CREATE POLICY "Players can view their sessions"
  ON public.game_sessions
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Players can insert their sessions"
  ON public.game_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Anyone can view choices" ON public.player_choices;
DROP POLICY IF EXISTS "Anyone can insert choices" ON public.player_choices;
DROP POLICY IF EXISTS "Players can view their choices" ON public.player_choices;
DROP POLICY IF EXISTS "Players can insert their choices" ON public.player_choices;

REVOKE ALL ON public.player_choices FROM anon, authenticated;
GRANT SELECT ON public.player_choices TO authenticated;

CREATE POLICY "Players can view their choices"
  ON public.player_choices
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.game_sessions
      WHERE game_sessions.id = player_choices.session_id
        AND game_sessions.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Players can insert their choices"
  ON public.player_choices
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.game_sessions
      WHERE game_sessions.id = player_choices.session_id
        AND game_sessions.user_id = (SELECT auth.uid())
    )
  );

CREATE OR REPLACE FUNCTION public.save_game_result(
  p_player_name TEXT,
  p_light_score INTEGER,
  p_shadow_score INTEGER,
  p_ending_type TEXT,
  p_choices JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  new_session_id UUID;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF length(trim(p_player_name)) NOT BETWEEN 1 AND 80 THEN
    RAISE EXCEPTION 'Invalid player name';
  END IF;

  IF p_light_score NOT BETWEEN 0 AND 10000
     OR p_shadow_score NOT BETWEEN 0 AND 10000 THEN
    RAISE EXCEPTION 'Invalid score';
  END IF;

  IF p_ending_type NOT IN (
    'The Dawn Bringer',
    'The Keeper of Shadows',
    'The Balance Walker'
  ) THEN
    RAISE EXCEPTION 'Invalid ending type';
  END IF;

  IF jsonb_typeof(p_choices) <> 'array'
     OR jsonb_array_length(p_choices) NOT BETWEEN 1 AND 30 THEN
    RAISE EXCEPTION 'Invalid choices';
  END IF;

  INSERT INTO public.game_sessions (
    user_id,
    player_name,
    light_score,
    shadow_score,
    ending_type,
    completed_at
  )
  VALUES (
    auth.uid(),
    trim(p_player_name),
    p_light_score,
    p_shadow_score,
    p_ending_type,
    now()
  )
  RETURNING id INTO new_session_id;

  INSERT INTO public.player_choices (
    session_id,
    scene_id,
    choice_text,
    light_points,
    shadow_points
  )
  SELECT
    new_session_id,
    (choice->>'scene_id')::INTEGER,
    left(choice->>'choice_text', 300),
    (choice->>'light_points')::INTEGER,
    (choice->>'shadow_points')::INTEGER
  FROM jsonb_array_elements(p_choices) AS choice;

  RETURN new_session_id;
END;
$$;

REVOKE ALL ON FUNCTION public.save_game_result(TEXT, INTEGER, INTEGER, TEXT, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.save_game_result(TEXT, INTEGER, INTEGER, TEXT, JSONB)
  TO authenticated;

CREATE OR REPLACE FUNCTION public.get_leaderboard(limit_count INTEGER DEFAULT 50)
RETURNS TABLE (
  id UUID,
  player_name TEXT,
  ending_type TEXT,
  light_score INTEGER,
  shadow_score INTEGER,
  created_at TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT
    session.id,
    session.player_name,
    session.ending_type,
    session.light_score,
    session.shadow_score,
    session.created_at
  FROM public.game_sessions AS session
  WHERE session.completed_at IS NOT NULL
    AND session.user_id IS NOT NULL
  ORDER BY session.created_at DESC
  LIMIT LEAST(GREATEST(limit_count, 1), 100);
$$;

REVOKE ALL ON FUNCTION public.get_leaderboard(INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_leaderboard(INTEGER) TO anon, authenticated;
