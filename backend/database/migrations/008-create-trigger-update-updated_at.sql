-- ===================================================================
-- Automatic updated_at handling
-- ===================================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CASE 
    WHEN NEW.updated_at IS NULL OR NEW.updated_at = OLD.updated_at 
    THEN now() 
    ELSE NEW.updated_at 
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_authors_updated_at
  BEFORE UPDATE ON authors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_update_articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_update_tags_updated_at
  BEFORE UPDATE ON tags
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_update_article_stats_updated_at
  BEFORE UPDATE ON article_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();