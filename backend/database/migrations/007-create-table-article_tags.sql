-- ===================================================================
-- Article Tags (Many-to-Many)
--
-- Junction table linking articles to tags.
-- ===================================================================

CREATE TABLE article_tags (
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);

-- Bidirectional indexes
CREATE INDEX idx_article_tags_by_tag ON article_tags(tag_id);
CREATE INDEX idx_article_tags_by_article ON article_tags(article_id);

COMMENT ON TABLE article_tags IS
  'Junction table linking articles to tags. Composite PK prevents duplicates. '
  'Bidirectional indexes support both "articles for tag" and "tags for article" ' 
  'queries efficiently.';