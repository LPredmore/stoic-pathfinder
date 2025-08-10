BEGIN;

-- Deduplicate agree_disagree so at most one row per profile_id remains (keep latest)
WITH ranked AS (
  SELECT id, profile_id,
         ROW_NUMBER() OVER (PARTITION BY profile_id ORDER BY created_at DESC, id DESC) AS rn
  FROM public.agree_disagree
)
DELETE FROM public.agree_disagree a
USING ranked r
WHERE a.id = r.id AND r.rn > 1;

-- Deduplicate always_never so at most one row per profile_id remains (keep latest)
WITH ranked2 AS (
  SELECT id, profile_id,
         ROW_NUMBER() OVER (PARTITION BY profile_id ORDER BY created_at DESC, id DESC) AS rn
  FROM public.always_never
)
DELETE FROM public.always_never a
USING ranked2 r
WHERE a.id = r.id AND r.rn > 1;

-- Create unique indexes to enforce one row per profile and enable ON CONFLICT (profile_id)
CREATE UNIQUE INDEX IF NOT EXISTS idx_agree_disagree_profile_id ON public.agree_disagree(profile_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_always_never_profile_id ON public.always_never(profile_id);

-- Keep updated_at fresh on updates using existing function: recreate triggers idempotently
DROP TRIGGER IF EXISTS set_agree_disagree_updated_at ON public.agree_disagree;
CREATE TRIGGER set_agree_disagree_updated_at
BEFORE UPDATE ON public.agree_disagree
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS set_always_never_updated_at ON public.always_never;
CREATE TRIGGER set_always_never_updated_at
BEFORE UPDATE ON public.always_never
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

COMMIT;