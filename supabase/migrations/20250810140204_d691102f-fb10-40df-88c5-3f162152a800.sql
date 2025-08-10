BEGIN;

-- 1) Create enum type if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'onboarding_status' AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.onboarding_status AS ENUM ('onboarding','complete');
  END IF;
END $$;

-- 2) Add column to profiles if not exists
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS onboarding_status public.onboarding_status;

-- 3) Backfill and enforce default/not null
UPDATE public.profiles SET onboarding_status = 'onboarding' WHERE onboarding_status IS NULL;
ALTER TABLE public.profiles ALTER COLUMN onboarding_status SET DEFAULT 'onboarding';
ALTER TABLE public.profiles ALTER COLUMN onboarding_status SET NOT NULL;

COMMIT;