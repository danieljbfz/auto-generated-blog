-- ===================================================================
-- Articles
--
-- Each article is a blog post, news story, or other content.
-- ===================================================================

CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relationships
  author_id UUID NOT NULL REFERENCES authors(id) ON DELETE RESTRICT,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,

  -- Identity
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(220) NOT NULL UNIQUE,
  excerpt TEXT,
  
  -- Content
  body TEXT NOT NULL,
  
  -- Visuals
  featured_image VARCHAR(500),
  image_alt VARCHAR(300),
  
  -- Workflow state
  status VARCHAR(20) NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'scheduled', 'published', 'archived')),
  
  -- SEO and settings
  metadata JSONB NOT NULL DEFAULT '{}',
  
  -- Calculated metrics
  reading_time_minutes INTEGER CHECK (reading_time_minutes >= 0),
  seo_score INTEGER CHECK (seo_score BETWEEN 0 AND 100),
  
  -- Full-text search (PostgreSQL 12+ generated column)
  -- Weights: Title (A) > Excerpt (B) > Body (C).
  search_vector TSVECTOR GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(excerpt, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(body, '')), 'C')
  ) STORED,
  
  -- Timeline
  scheduled_publish_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Data integrity rules
  CONSTRAINT uq_articles_slug UNIQUE (slug),
  CONSTRAINT chk_article_slug_not_empty CHECK (trim(slug) <> ''),
  CONSTRAINT chk_scheduled_has_date CHECK (
    status != 'scheduled' OR scheduled_publish_at IS NOT NULL
  ),
  CONSTRAINT chk_scheduled_in_future CHECK (
    status != 'scheduled' OR scheduled_publish_at > created_at
  )
);

-- Fast lookups
CREATE INDEX idx_articles_author ON articles(author_id);
CREATE INDEX idx_articles_slug ON articles(slug);
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_category ON articles(category_id);

-- Public homepage / feeds
CREATE INDEX idx_articles_published_feed ON articles(published_at DESC NULLS LAST)
  WHERE status = 'published';

-- Scheduled articles
CREATE INDEX idx_articles_scheduled ON articles(scheduled_publish_at)
  WHERE status = 'scheduled';

-- Full-text search
CREATE INDEX idx_articles_search ON articles USING GIN(search_vector);

-- JSONB metadata queries (e.g. metadata->>'canonicalUrl')
CREATE INDEX idx_articles_metadata ON articles USING GIN (metadata);

-- Fuzzy title search for autocomplete / related articles
CREATE INDEX idx_articles_title_fuzzy ON articles USING GIN (title gin_trgm_ops);

COMMENT ON TABLE articles IS
'The complete representation of an article. Connects content, author, '
'category, tags, images, SEO settings, and publishing state.';