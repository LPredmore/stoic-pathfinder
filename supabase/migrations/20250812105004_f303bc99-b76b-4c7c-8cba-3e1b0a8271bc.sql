-- Enable required extensions
create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

-- Unschedule existing job if it exists to keep this migration idempotent
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'qualitative-scorer-nightly') THEN
    PERFORM cron.unschedule('qualitative-scorer-nightly');
  END IF;
END $$;

-- Schedule nightly invocation at 02:00 UTC
select
  cron.schedule(
    'qualitative-scorer-nightly',
    '0 2 * * *',
    $$
    select net.http_post(
      url := 'https://orgtxrsagsbeexaafjya.supabase.co/functions/v1/qualitative-scorer',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yZ3R4cnNhZ3NiZWV4YWFmanlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3OTY0NjksImV4cCI6MjA3MDM3MjQ2OX0.G_EV3LPsoj9vsQhZorW9BXm_jhcAxmWVIo3xPwdGnK8"}'::jsonb,
      body := '{"mappings": [], "default_score": null}'::jsonb
    ) as request_id;
    $$
  );