-- ===================================================================
-- Auto-publish function for scheduled articles
--
-- This view selects the data we need for the homepage feed (the
-- list of articles shown to users when they land on the site). It 
-- intentionally excludes the full article body and many-to-many 
-- relationships (like tags) to keep the query fast (low latency).
--
-- For very high read volumes, this view can be converted to a 
-- MATERIALIZED VIEW (with a refresh strategy) or served through 
-- a dedicated caching layer (e.g., CDN/edge + API cache).
-- ===================================================================

CREATE OR REPLACE VIEW published_feed AS
SELECT 
  -- Article
  a.id,
  a.title,
  a.slug,
  a.excerpt,
  a.featured_image,
  a.published_at,

  -- Category
  a.category_id,
  c.slug AS category_slug,
  c.name AS category_name,

  -- Author
  a.author_id,
  u.slug AS author_slug,
  u.name AS author_name
FROM articles a
LEFT JOIN categories c ON a.category_id = c.id
LEFT JOIN authors u ON a.author_id = u.id
WHERE a.status = 'published'
  AND (c.id IS NULL OR c.is_active = TRUE)
ORDER BY a.published_at DESC;