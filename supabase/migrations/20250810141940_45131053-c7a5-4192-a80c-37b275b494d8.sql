-- 1) Add admin flag to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS admin boolean NOT NULL DEFAULT false;

-- 2) Create AI Therapist Settings table (admin-managed)
CREATE TABLE IF NOT EXISTS public.ai_therapist_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by_profile uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  persona text,
  principles text[] DEFAULT '{}',
  response_style text,
  safety_boundaries text,
  prohibited_topics text,
  escalation_policy text,
  session_opening text,
  session_closing text,
  custom_tools jsonb,
  is_active boolean NOT NULL DEFAULT true
);

-- Enable RLS
ALTER TABLE public.ai_therapist_settings ENABLE ROW LEVEL SECURITY;

-- Admin-only policies
CREATE POLICY "Admins can view ai_therapist_settings"
ON public.ai_therapist_settings
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() AND p.admin = true
  )
);

CREATE POLICY "Admins can insert ai_therapist_settings"
ON public.ai_therapist_settings
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() AND p.admin = true
  )
);

CREATE POLICY "Admins can update ai_therapist_settings"
ON public.ai_therapist_settings
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() AND p.admin = true
  )
);

CREATE POLICY "Admins can delete ai_therapist_settings"
ON public.ai_therapist_settings
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() AND p.admin = true
  )
);

-- Update trigger for updated_at
CREATE TRIGGER update_ai_therapist_settings_updated_at
BEFORE UPDATE ON public.ai_therapist_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Ensure only one active settings row at a time
CREATE UNIQUE INDEX IF NOT EXISTS unique_active_ai_settings
ON public.ai_therapist_settings (is_active)
WHERE is_active = true;