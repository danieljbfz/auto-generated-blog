-- ===================================================================
-- Authors
--
-- Represents the creator of an article. In an auto-generated blog,
-- this is typically an AI model or provider (e.g., GPT-4, Claude).
-- ===================================================================

CREATE TABLE authors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(120) NOT NULL UNIQUE,
  name VARCHAR(120) NOT NULL,
  role VARCHAR(120),
  avatar_url VARCHAR(500),
  bio TEXT,
  website VARCHAR(500),
  type VARCHAR(20) DEFAULT 'ai',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT chk_author_slug_not_empty CHECK (trim(slug) <> '')
);

-- Index for active authors (if needed for queries)
CREATE INDEX idx_authors_active ON authors(slug) WHERE is_active = true;

-- Fuzzy name search
CREATE INDEX idx_authors_name_fuzzy ON authors USING GIN (name gin_trgm_ops);

COMMENT ON TABLE authors IS
'Content creators (typically AI models) that write articles. '
'Used for attribution, branding, and filtering.';