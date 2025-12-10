-- ===================================================================
-- Article Statistics
--
-- Separated from the main article row to avoid contention when
-- thousands of people view or like the same popular article.
-- ===================================================================

CREATE TABLE article_stats (
  article_id UUID PRIMARY KEY REFERENCES articles(id) ON DELETE CASCADE,
  views BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE article_stats IS
'View counter kept in its own table so high-traffic '
'articles do not lock the main content row.';