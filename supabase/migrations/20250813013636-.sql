-- Relationships data model for AI context (retry without IF NOT EXISTS on policies)
-- 1) relationships (core entity)
CREATE TABLE IF NOT EXISTS public.relationships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  relationship_type text NOT NULL,
  relationship_subtype text,
  contact_frequency text,
  emotional_significance smallint CHECK (emotional_significance BETWEEN 1 AND 5),
  relationship_status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_relationships_profile_id ON public.relationships (profile_id);

ALTER TABLE public.relationships ENABLE ROW LEVEL SECURITY;

-- Policies for relationships
DROP POLICY IF EXISTS "Users can view their own relationships" ON public.relationships;
CREATE POLICY "Users can view their own relationships"
ON public.relationships FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.profiles p
  WHERE p.id = relationships.profile_id AND p.user_id = auth.uid()
));

DROP POLICY IF EXISTS "Users can insert their own relationships" ON public.relationships;
CREATE POLICY "Users can insert their own relationships"
ON public.relationships FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.profiles p
  WHERE p.id = relationships.profile_id AND p.user_id = auth.uid()
));

DROP POLICY IF EXISTS "Users can update their own relationships" ON public.relationships;
CREATE POLICY "Users can update their own relationships"
ON public.relationships FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.profiles p
  WHERE p.id = relationships.profile_id AND p.user_id = auth.uid()
));

DROP POLICY IF EXISTS "Users can delete their own relationships" ON public.relationships;
CREATE POLICY "Users can delete their own relationships"
ON public.relationships FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.profiles p
  WHERE p.id = relationships.profile_id AND p.user_id = auth.uid()
));

DROP TRIGGER IF EXISTS update_relationships_updated_at ON public.relationships;
CREATE TRIGGER update_relationships_updated_at
BEFORE UPDATE ON public.relationships
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- 2) relationship_details
CREATE TABLE IF NOT EXISTS public.relationship_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  relationship_id uuid NOT NULL REFERENCES public.relationships(id) ON DELETE CASCADE,
  birthday date,
  location text,
  phone text,
  email text,
  how_we_met text,
  personality_traits text[] DEFAULT '{}',
  interests text[] DEFAULT '{}',
  values text[] DEFAULT '{}',
  communication_style text,
  current_challenges text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_relationship_details_relationship_id ON public.relationship_details (relationship_id);

ALTER TABLE public.relationship_details ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own relationship_details" ON public.relationship_details;
CREATE POLICY "Users can view their own relationship_details"
ON public.relationship_details FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.relationships r
  JOIN public.profiles p ON p.id = r.profile_id
  WHERE r.id = relationship_details.relationship_id AND p.user_id = auth.uid()
));

DROP POLICY IF EXISTS "Users can insert their own relationship_details" ON public.relationship_details;
CREATE POLICY "Users can insert their own relationship_details"
ON public.relationship_details FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.relationships r
  JOIN public.profiles p ON p.id = r.profile_id
  WHERE r.id = relationship_details.relationship_id AND p.user_id = auth.uid()
));

DROP POLICY IF EXISTS "Users can update their own relationship_details" ON public.relationship_details;
CREATE POLICY "Users can update their own relationship_details"
ON public.relationship_details FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.relationships r
  JOIN public.profiles p ON p.id = r.profile_id
  WHERE r.id = relationship_details.relationship_id AND p.user_id = auth.uid()
));

DROP POLICY IF EXISTS "Users can delete their own relationship_details" ON public.relationship_details;
CREATE POLICY "Users can delete their own relationship_details"
ON public.relationship_details FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.relationships r
  JOIN public.profiles p ON p.id = r.profile_id
  WHERE r.id = relationship_details.relationship_id AND p.user_id = auth.uid()
));

DROP TRIGGER IF EXISTS update_relationship_details_updated_at ON public.relationship_details;
CREATE TRIGGER update_relationship_details_updated_at
BEFORE UPDATE ON public.relationship_details
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- 3) relationship_interactions
CREATE TABLE IF NOT EXISTS public.relationship_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  relationship_id uuid NOT NULL REFERENCES public.relationships(id) ON DELETE CASCADE,
  interaction_date timestamptz NOT NULL DEFAULT now(),
  interaction_type text,
  topic_tags text[] DEFAULT '{}',
  mood_before smallint CHECK (mood_before BETWEEN 1 AND 5),
  mood_after smallint CHECK (mood_after BETWEEN 1 AND 5),
  notes text,
  support_given boolean NOT NULL DEFAULT false,
  support_received boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_relationship_interactions_relationship_id ON public.relationship_interactions (relationship_id);

ALTER TABLE public.relationship_interactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own relationship_interactions" ON public.relationship_interactions;
CREATE POLICY "Users can view their own relationship_interactions"
ON public.relationship_interactions FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.relationships r
  JOIN public.profiles p ON p.id = r.profile_id
  WHERE r.id = relationship_interactions.relationship_id AND p.user_id = auth.uid()
));

DROP POLICY IF EXISTS "Users can insert their own relationship_interactions" ON public.relationship_interactions;
CREATE POLICY "Users can insert their own relationship_interactions"
ON public.relationship_interactions FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.relationships r
  JOIN public.profiles p ON p.id = r.profile_id
  WHERE r.id = relationship_interactions.relationship_id AND p.user_id = auth.uid()
));

DROP POLICY IF EXISTS "Users can update their own relationship_interactions" ON public.relationship_interactions;
CREATE POLICY "Users can update their own relationship_interactions"
ON public.relationship_interactions FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.relationships r
  JOIN public.profiles p ON p.id = r.profile_id
  WHERE r.id = relationship_interactions.relationship_id AND p.user_id = auth.uid()
));

DROP POLICY IF EXISTS "Users can delete their own relationship_interactions" ON public.relationship_interactions;
CREATE POLICY "Users can delete their own relationship_interactions"
ON public.relationship_interactions FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.relationships r
  JOIN public.profiles p ON p.id = r.profile_id
  WHERE r.id = relationship_interactions.relationship_id AND p.user_id = auth.uid()
));


-- 4) relationship_memories
CREATE TABLE IF NOT EXISTS public.relationship_memories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  relationship_id uuid NOT NULL REFERENCES public.relationships(id) ON DELETE CASCADE,
  memory_date date,
  title text NOT NULL,
  description text,
  emotional_impact smallint CHECK (emotional_impact BETWEEN 1 AND 5),
  memory_type text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_relationship_memories_relationship_id ON public.relationship_memories (relationship_id);

ALTER TABLE public.relationship_memories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own relationship_memories" ON public.relationship_memories;
CREATE POLICY "Users can view their own relationship_memories"
ON public.relationship_memories FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.relationships r
  JOIN public.profiles p ON p.id = r.profile_id
  WHERE r.id = relationship_memories.relationship_id AND p.user_id = auth.uid()
));

DROP POLICY IF EXISTS "Users can insert their own relationship_memories" ON public.relationship_memories;
CREATE POLICY "Users can insert their own relationship_memories"
ON public.relationship_memories FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.relationships r
  JOIN public.profiles p ON p.id = r.profile_id
  WHERE r.id = relationship_memories.relationship_id AND p.user_id = auth.uid()
));

DROP POLICY IF EXISTS "Users can update their own relationship_memories" ON public.relationship_memories;
CREATE POLICY "Users can update their own relationship_memories"
ON public.relationship_memories FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.relationships r
  JOIN public.profiles p ON p.id = r.profile_id
  WHERE r.id = relationship_memories.relationship_id AND p.user_id = auth.uid()
));

DROP POLICY IF EXISTS "Users can delete their own relationship_memories" ON public.relationship_memories;
CREATE POLICY "Users can delete their own relationship_memories"
ON public.relationship_memories FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.relationships r
  JOIN public.profiles p ON p.id = r.profile_id
  WHERE r.id = relationship_memories.relationship_id AND p.user_id = auth.uid()
));