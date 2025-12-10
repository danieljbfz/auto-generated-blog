-- ===================================================================
-- Tags (flat)
--
-- Simple keyword system. Slugs are globally unique because they are
-- used in URLs like /tag/react-hooks.
-- ===================================================================

CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT chk_tag_slug_not_empty CHECK (trim(slug) <> '')
);

-- Enables "type react → see react-hooks, preact, etc."
CREATE INDEX idx_tags_name_fuzzy ON tags USING GIN (name gin_trgm_ops);

COMMENT ON TABLE tags IS
'Flat keywords that can be attached to any article. Helps readers '
'discover related content across categories.';