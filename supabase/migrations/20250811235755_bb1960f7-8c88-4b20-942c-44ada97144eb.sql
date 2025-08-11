-- Enable RLS and add policies for new assessment tables; using idempotent DO blocks

-- 1) questions
alter table if exists public.questions enable row level security;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'questions' AND policyname = 'Questions are viewable by everyone'
  ) THEN
    CREATE POLICY "Questions are viewable by everyone"
      ON public.questions FOR SELECT
      USING (true);
  END IF;
END$$;

-- 2) question_traits
alter table if exists public.question_traits enable row level security;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'question_traits' AND policyname = 'Question traits are viewable by everyone'
  ) THEN
    CREATE POLICY "Question traits are viewable by everyone"
      ON public.question_traits FOR SELECT
      USING (true);
  END IF;
END$$;

-- 3) responses (user-scoped)
alter table if exists public.responses enable row level security;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'responses' AND policyname = 'Users can view their own responses'
  ) THEN
    CREATE POLICY "Users can view their own responses"
      ON public.responses FOR SELECT
      USING (EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = responses.profile_id AND p.user_id = auth.uid()
      ));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'responses' AND policyname = 'Users can insert their own responses'
  ) THEN
    CREATE POLICY "Users can insert their own responses"
      ON public.responses FOR INSERT
      WITH CHECK (EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = responses.profile_id AND p.user_id = auth.uid()
      ));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'responses' AND policyname = 'Users can update their own responses'
  ) THEN
    CREATE POLICY "Users can update their own responses"
      ON public.responses FOR UPDATE
      USING (EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = responses.profile_id AND p.user_id = auth.uid()
      ));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'responses' AND policyname = 'Users can delete their own responses'
  ) THEN
    CREATE POLICY "Users can delete their own responses"
      ON public.responses FOR DELETE
      USING (EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = responses.profile_id AND p.user_id = auth.uid()
      ));
  END IF;
END$$;

-- 4) profile_scores (computed; read-only to clients)
alter table if exists public.profile_scores enable row level security;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profile_scores' AND policyname = 'Users can view their own profile_scores'
  ) THEN
    CREATE POLICY "Users can view their own profile_scores"
      ON public.profile_scores FOR SELECT
      USING (EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = profile_scores.profile_id AND p.user_id = auth.uid()
      ));
  END IF;
END$$;