-- ===================================================================
-- Auto-publish function for scheduled articles
--
-- This function checks for scheduled articles that are ready to go live
-- and publishes them automatically. In production, we call this function
-- every minute using a cron job (pg_cron) or a scheduled task runner.
-- ===================================================================

CREATE OR REPLACE FUNCTION publish_scheduled_articles()
RETURNS void AS $$
BEGIN
  UPDATE articles
  SET status = 'published', updated_at = NOW()
  WHERE status = 'scheduled'
    AND scheduled_publish_at <= NOW()
    AND published_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION publish_scheduled_articles IS
'Publishes articles whose scheduled_publish_at has passed. '
'The published_at column is automatically set by the trg_articles_set_published_at trigger. '
'Schedule with pg_cron: SELECT cron.schedule(''publish-scheduled'', ''* * * * *'', $$SELECT publish_scheduled_articles()$$);';

-- SELECT cron.schedule(
--   'publish-scheduled-articles',             -- Job name (for logging/identification)
--   '* * * * *',                              -- Cron expression: every minute
--   $$SELECT publish_scheduled_articles();$$  -- The SQL command to execute
-- );