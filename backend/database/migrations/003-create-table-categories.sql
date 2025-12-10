-- ===================================================================
-- Categories (hierarchical)
--
-- Supports nested categories like Programming → Databases → PostgreSQL.
-- Slugs are unique only within their parent (so we can have multiple
-- "introduction" categories at different levels).
-- ===================================================================

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES categories(id) ON DELETE RESTRICT,
  slug VARCHAR(120) NOT NULL,
  name VARCHAR(120) NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT uq_categories_slug_parent UNIQUE (slug, parent_id),
  CONSTRAINT chk_category_slug_not_empty CHECK (trim(slug) <> ''),
  CONSTRAINT no_self_reference CHECK (parent_id != id)
);

-- Fast parent → children lookups
CREATE INDEX idx_categories_parent ON categories(parent_id);

-- Public navigation menus (only active categories)
CREATE INDEX idx_categories_active ON categories(slug) WHERE is_active = true;

COMMENT ON TABLE categories IS
'Hierarchical organization of articles. Used for navigation menus, '
'breadcrumbs, and filtering.';