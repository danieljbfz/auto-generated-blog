-- ===================================================================
-- Article View Counter (UPSERT Function)
--
-- Adds a simple UPSERT-based function to increment the article views 
-- directly in Postgres. This is good for low-to-medium traffic 
-- applications where strong consistency (real-time view counts) is 
-- needed with every request.
-- ===================================================================

CREATE OR REPLACE FUNCTION increment_article_views(article_uuid UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO article_stats (article_id, views)
  VALUES (article_uuid, 1)
  ON CONFLICT (article_id)
  DO UPDATE SET 
    views = article_stats.views + 1;
END;
$$ LANGUAGE plpgsql;