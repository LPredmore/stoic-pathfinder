-- Phase 1: Schema for Stoic-Pathfinder expansion
-- 1) Extend profiles with memory_store JSONB
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS memory_store jsonb;

-- 2) Create ai_training table (admin-managed, global)
CREATE TABLE IF NOT EXISTS public.ai_training (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mode text NOT NULL UNIQUE,
  instructions text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_training ENABLE ROW LEVEL SECURITY;

-- RLS: Admins only (based on profiles.admin)
CREATE POLICY "Admins can view ai_training"
ON public.ai_training
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() AND p.admin = true
  )
);

CREATE POLICY "Admins can insert ai_training"
ON public.ai_training
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() AND p.admin = true
  )
);

CREATE POLICY "Admins can update ai_training"
ON public.ai_training
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() AND p.admin = true
  )
);

CREATE POLICY "Admins can delete ai_training"
ON public.ai_training
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() AND p.admin = true
  )
);

-- Trigger to maintain updated_at
CREATE TRIGGER update_ai_training_updated_at
BEFORE UPDATE ON public.ai_training
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3) Create user_values table (avoid reserved keyword "values")
CREATE TABLE IF NOT EXISTS public.user_values (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  key text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_values_profile_id ON public.user_values(profile_id);
ALTER TABLE public.user_values ENABLE ROW LEVEL SECURITY;

-- RLS: Users can CRUD their own rows via profile linkage
CREATE POLICY "Users can view their own user_values"
ON public.user_values
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = public.user_values.profile_id AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own user_values"
ON public.user_values
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = public.user_values.profile_id AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own user_values"
ON public.user_values
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = public.user_values.profile_id AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own user_values"
ON public.user_values
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = public.user_values.profile_id AND p.user_id = auth.uid()
  )
);

CREATE TRIGGER update_user_values_updated_at
BEFORE UPDATE ON public.user_values
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4) Create boundaries table
CREATE TABLE IF NOT EXISTS public.boundaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  boundary text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_boundaries_profile_id ON public.boundaries(profile_id);
ALTER TABLE public.boundaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own boundaries"
ON public.boundaries
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = public.boundaries.profile_id AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own boundaries"
ON public.boundaries
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = public.boundaries.profile_id AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own boundaries"
ON public.boundaries
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = public.boundaries.profile_id AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own boundaries"
ON public.boundaries
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = public.boundaries.profile_id AND p.user_id = auth.uid()
  )
);

CREATE TRIGGER update_boundaries_updated_at
BEFORE UPDATE ON public.boundaries
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5) Create stuck_points table
CREATE TABLE IF NOT EXISTS public.stuck_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  point text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stuck_points_profile_id ON public.stuck_points(profile_id);
ALTER TABLE public.stuck_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own stuck_points"
ON public.stuck_points
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = public.stuck_points.profile_id AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own stuck_points"
ON public.stuck_points
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = public.stuck_points.profile_id AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own stuck_points"
ON public.stuck_points
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = public.stuck_points.profile_id AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own stuck_points"
ON public.stuck_points
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = public.stuck_points.profile_id AND p.user_id = auth.uid()
  )
);

CREATE TRIGGER update_stuck_points_updated_at
BEFORE UPDATE ON public.stuck_points
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
