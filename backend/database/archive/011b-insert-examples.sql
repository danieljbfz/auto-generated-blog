-- ===================================================================
-- Insert Sample Data (Using Atomic CTEs)
-- ===================================================================
-- This script populates the tables with sample data to test
-- relationships, indexes, triggers, and constraints.
--
-- Improvement: UUIDs are now generated automatically using gen_random_uuid()
-- and cross-referenced cleanly using Common Table Expressions (CTEs)
-- and RETURNING clauses. This ensures the script is atomic and robust.
-- ===================================================================

BEGIN TRANSACTION;

WITH

-- ===================================================================
-- 1. Authors
-- ===================================================================

author_gpt4 AS (
    INSERT INTO authors (id, slug, name, role, type, is_active, website, created_at) VALUES
    (gen_random_uuid(), 'gpt-4', 'GPT-4', 'Senior Content Model', 'ai', TRUE, 'https://openai.com', NOW() - INTERVAL '2 years')
    RETURNING id, slug
),
author_claude AS (
    INSERT INTO authors (id, slug, name, role, type, is_active, website, created_at) VALUES
    (gen_random_uuid(), 'claude-3-opus', 'Claude 3 Opus', 'Principal Thought Model', 'ai', TRUE, 'https://anthropic.com', NOW() - INTERVAL '18 months')
    RETURNING id, id AS claude_id -- Retain ID for the later UPDATE
),
author_alice AS (
    INSERT INTO authors (id, slug, name, role, type, is_active, website, created_at) VALUES
    (gen_random_uuid(), 'human-editor', 'Alice Johnson', 'Managing Editor', 'human', TRUE, 'https://example.com/alice', NOW() - INTERVAL '1 year')
    RETURNING id, slug
),
author_gemini AS (
    INSERT INTO authors (id, slug, name, role, type, is_active, website, created_at) VALUES
    (gen_random_uuid(), 'gemini-pro', 'Gemini Pro', 'Multimodal AI', 'ai', TRUE, 'https://deepmind.google', NOW() - INTERVAL '6 months')
    RETURNING id, slug
),
author_grok AS (
    INSERT INTO authors (id, slug, name, role, type, is_active, website, created_at) VALUES
    (gen_random_uuid(), 'grok-4', 'Grok 4', 'Truth-seeking AI', 'ai', TRUE, 'https://x.ai', NOW() - INTERVAL '3 months')
    RETURNING id, slug
),

-- ===================================================================
-- 2. Categories (Hierarchical Structure)
-- ===================================================================

cat_prog AS (
    INSERT INTO categories (id, parent_id, slug, name, created_at) VALUES
    (gen_random_uuid(), NULL, 'programming', 'Programming', NOW() - INTERVAL '2 years')
    RETURNING id
),
cat_ai AS (
    INSERT INTO categories (id, parent_id, slug, name, created_at) VALUES
    (gen_random_uuid(), NULL, 'artificial-intelligence', 'Artificial Intelligence', NOW() - INTERVAL '1 year')
    RETURNING id
),
cat_nontech AS (
    INSERT INTO categories (id, parent_id, slug, name, created_at) VALUES
    (gen_random_uuid(), NULL, 'non-tech', 'Non-Technical', NOW() - INTERVAL '2 years')
    RETURNING id
),
cat_databases AS (
    INSERT INTO categories (id, parent_id, slug, name, created_at) VALUES
    (gen_random_uuid(), (SELECT id FROM cat_prog), 'databases', 'Databases', NOW() - INTERVAL '1 year')
    RETURNING id
),
cat_frontend AS (
    INSERT INTO categories (id, parent_id, slug, name, created_at) VALUES
    (gen_random_uuid(), (SELECT id FROM cat_prog), 'frontend', 'Frontend Development', NOW() - INTERVAL '1 year')
    RETURNING id
),
cat_llm AS (
    INSERT INTO categories (id, parent_id, slug, name, created_at) VALUES
    (gen_random_uuid(), (SELECT id FROM cat_ai), 'large-language-models', 'Large Language Models', NOW() - INTERVAL '6 months')
    RETURNING id
),
cat_postgres AS (
    INSERT INTO categories (id, parent_id, slug, name, description, created_at) VALUES
    (gen_random_uuid(), (SELECT id FROM cat_databases), 'postgresql', 'PostgreSQL', 'Deep dives into Postgres features.', NOW() - INTERVAL '6 months')
    RETURNING id
),
cat_react AS (
    INSERT INTO categories (id, parent_id, slug, name, description, created_at) VALUES
    (gen_random_uuid(), (SELECT id FROM cat_frontend), 'react', 'React', 'Articles on hooks, state, and component architecture.', NOW() - INTERVAL '6 months')
    RETURNING id
),
cat_nextjs AS (
    INSERT INTO categories (id, parent_id, slug, name, description, created_at) VALUES
    (gen_random_uuid(), (SELECT id FROM cat_frontend), 'next-js', 'Next.js', 'React framework for production.', NOW() - INTERVAL '3 months')
    RETURNING id
),

-- ===================================================================
-- 3. Tags (Flat)
-- ===================================================================

tag_sql AS (
    INSERT INTO tags (id, slug, name, created_at) VALUES
    (gen_random_uuid(), 'sql', 'SQL', NOW() - INTERVAL '2 years')
    RETURNING id, slug
),
tag_orm AS (
    INSERT INTO tags (id, slug, name, created_at) VALUES
    (gen_random_uuid(), 'orm', 'ORM', NOW() - INTERVAL '2 years')
    RETURNING id
),
tag_js AS (
    INSERT INTO tags (id, slug, name, created_at) VALUES
    (gen_random_uuid(), 'javascript', 'JavaScript', NOW() - INTERVAL '2 years')
    RETURNING id
),
tag_ai AS (
    INSERT INTO tags (id, slug, name, created_at) VALUES
    (gen_random_uuid(), 'ai', 'Artificial Intelligence', NOW() - INTERVAL '1 year')
    RETURNING id
),
tag_tutorial AS (
    INSERT INTO tags (id, slug, name, created_at) VALUES
    (gen_random_uuid(), 'tutorial', 'Tutorial', NOW() - INTERVAL '1 year')
    RETURNING id, slug
),
tag_perf AS (
    INSERT INTO tags (id, slug, name, created_at) VALUES
    (gen_random_uuid(), 'performance', 'Performance', NOW() - INTERVAL '1 year')
    RETURNING id
),
tag_fts AS (
    INSERT INTO tags (id, slug, name, created_at) VALUES
    (gen_random_uuid(), 'full-text-search', 'Full-Text Search', NOW() - INTERVAL '6 months')
    RETURNING id
),
tag_gin AS (
    INSERT INTO tags (id, slug, name, created_at) VALUES
    (gen_random_uuid(), 'gin-index', 'GIN Index', NOW() - INTERVAL '6 months')
    RETURNING id
),
tag_nextjs AS (
    INSERT INTO tags (id, slug, name, created_at) VALUES
    (gen_random_uuid(), 'next-js', 'Next.js', NOW() - INTERVAL '3 months')
    RETURNING id
),

-- ===================================================================
-- 4. Articles
-- ===================================================================

article_postgres AS (
    INSERT INTO articles (author_id, category_id, title, slug, excerpt, body, status, reading_time_minutes, seo_score, scheduled_publish_at, featured_image, image_alt, metadata, created_at) VALUES
    (
        (SELECT id FROM author_gpt4), -- GPT-4
        (SELECT id FROM cat_postgres), -- PostgreSQL
        'The Power of PostgreSQL Generated Columns',
        'power-of-postgres-generated-columns',
        'A deep dive into using GENERATED ALWAYS AS ... STORED for deterministic data fields like search vectors.',
        'The ability to use computed columns greatly simplifies data integrity and allows for advanced indexing techniques. This article explores a few use cases...',
        'published',
        7,
        92,
        NULL,
        'https://example.com/images/postgres-generated-columns.png',
        'PostgreSQL elephant with gears showing computed columns',
        '{"canonicalUrl": "https://blog.example.com/power-of-postgres-generated-columns", "keywords": ["postgresql", "generated columns", "full-text search"]}',
        NOW() - INTERVAL '45 days'
    )
    RETURNING id
),
article_scheduled AS (
    INSERT INTO articles (author_id, category_id, title, slug, excerpt, body, status, reading_time_minutes, seo_score, scheduled_publish_at, featured_image, image_alt, metadata, created_at) VALUES
    (
        (SELECT id FROM author_claude), -- Claude 3 Opus
        (SELECT id FROM cat_react), -- React
        'Mastering the latest React Hooks',
        'mastering-latest-react-hooks',
        'A comprehensive guide to modern state management and effects in React.',
        'React is constantly evolving. The new hooks introduced in the recent version change how we think about component lifecycle...',
        'scheduled',
        12,
        85,
        NOW() - INTERVAL '5 seconds', -- Set slightly in the past to trigger immediate 'publish' in step 7
        'https://example.com/images/react-hooks-guide.png',
        'React logo with hooks as puzzle pieces fitting together',
        '{"canonicalUrl": "https://blog.example.com/mastering-react-hooks", "keywords": ["react", "hooks", "frontend"], "requiresReview": true}',
        NOW() - INTERVAL '10 days'
    )
    RETURNING id, title, status, scheduled_publish_at
),
article_draft AS (
    INSERT INTO articles (author_id, category_id, title, slug, excerpt, body, status, reading_time_minutes, seo_score, scheduled_publish_at, featured_image, image_alt, metadata, created_at) VALUES
    (
        (SELECT id FROM author_alice), -- Alice Johnson
        (SELECT id FROM cat_nontech), -- Non-Technical
        'Tips for WFH Productivity',
        'tips-for-wfh-productivity',
        'How to stay focused and motivated when working from your home office.',
        'Working remotely offers flexibility, but it requires discipline to maintain productivity...',
        'draft',
        4,
        50,
        NULL,
        'https://example.com/images/wfh-draft.png',
        'Home office setup with laptop and plants',
        '{"internalNotes": "Needs more research and expert interviews. Target publication: Q2 2025."}',
        NOW() - INTERVAL '5 days'
    )
    RETURNING id
),
article_archived AS (
    INSERT INTO articles (author_id, category_id, title, slug, excerpt, body, status, reading_time_minutes, seo_score, scheduled_publish_at, featured_image, image_alt, metadata, created_at) VALUES
    (
        (SELECT id FROM author_gemini), -- Gemini Pro
        (SELECT id FROM cat_databases), -- Databases
        'Migrating from MongoDB to PostgreSQL (Legacy Guide)',
        'legacy-mongodb-to-postgres-guide',
        'An old, but historically important guide on the migration process. Content is now outdated.',
        'This 2020 guide covered data modeling differences and migration tools available at the time. *Note: This article is archived. See our new migration guide for current best practices.*',
        'archived',
        10,
        55,
        NULL,
        'https://example.com/images/legacy-migration.png',
        'MongoDB and PostgreSQL logos with migration arrow',
        '{"archivalReason": "Superseded by v2.0 guide", "noIndex": true, "alternativeUrl": "https://blog.example.com/modern-database-migration-guide"}',
        NOW() - INTERVAL '3 years'
    )
    RETURNING id
),
article_nextjs AS (
    INSERT INTO articles (author_id, category_id, title, slug, excerpt, body, status, reading_time_minutes, seo_score, scheduled_publish_at, featured_image, image_alt, metadata, created_at) VALUES
    (
        (SELECT id FROM author_gpt4), -- GPT-4
        (SELECT id FROM cat_nextjs), -- Next.js
        'Building a Production Blog with Next.js 15 and PostgreSQL',
        'nextjs-15-postgresql-blog',
        'Complete guide from schema design to deployment using the App Router, Server Actions, and PostgreSQL.',
        'This tutorial walks through building a complete blog using Next.js 15 and PostgreSQL as the single source of truth. We cover App Router, Server Actions, and deployment.',
        'published',
        18,
        98,
        NULL,
        'https://example.com/images/nextjs-blog.png',
        'Screenshot of a blog built with Next.js',
        '{"canonicalUrl": "https://blog.example.com/nextjs-15-postgresql-blog", "keywords": ["nextjs", "postgresql", "blog"], "openGraph": {"image": "https://example.com/nextjs-blog-og.png"}}',
        NOW() - INTERVAL '7 days'
    )
    RETURNING id
),

-- ===================================================================
-- 5. Article Stats
-- ===================================================================

article_stats_insert AS (
    INSERT INTO article_stats (article_id, views, updated_at) VALUES
    ((SELECT id FROM article_postgres), 12450, NOW() - INTERVAL '30 minutes'), -- The PostgreSQL article
    ((SELECT id FROM article_archived), 3456, NOW() - INTERVAL '6 months'), -- The MongoDB article
    ((SELECT id FROM article_nextjs), 89123, NOW() - INTERVAL '1 day') -- The Next.js article
    RETURNING article_id
),

-- ===================================================================
-- 6. Article Tags (Many-to-Many)
-- ===================================================================

article_tags_insert AS (
    INSERT INTO article_tags (article_id, tag_id)
    VALUES
    -- Article 1 (PostgreSQL): tagged with SQL, ORM, Tutorial, Performance, Full-Text Search
    ((SELECT id FROM article_postgres), (SELECT id FROM tag_sql)),
    ((SELECT id FROM article_postgres), (SELECT id FROM tag_orm)),
    ((SELECT id FROM article_postgres), (SELECT id FROM tag_tutorial)),
    ((SELECT id FROM article_postgres), (SELECT id FROM tag_perf)),
    ((SELECT id FROM article_postgres), (SELECT id FROM tag_fts)),

    -- Article 2 (Scheduled/React): tagged with JavaScript, AI
    ((SELECT id FROM article_scheduled), (SELECT id FROM tag_js)),
    ((SELECT id FROM article_scheduled), (SELECT id FROM tag_ai)),

    -- Article 4 (Archived/Legacy): tagged with SQL, Tutorial
    ((SELECT id FROM article_archived), (SELECT id FROM tag_sql)),
    ((SELECT id FROM article_archived), (SELECT id FROM tag_tutorial))
    RETURNING article_id
),

-- Associates Article 5 with several existing tags using a SELECT subquery.
article_tags_nextjs_select AS (
    INSERT INTO article_tags (article_id, tag_id)
    SELECT (SELECT id FROM article_nextjs), id FROM tags
    WHERE slug IN ('next-js', 'javascript', 'tutorial', 'performance')
    RETURNING article_id
)

-- Final SELECT statement to execute all preceding CTEs.
SELECT 1; -- Dummy selection to complete the WITH block

-- =================================================================== 
-- 7. Automated Features (DML and Function Calls) 
-- ===================================================================

-- Update 'authors' to trigger 'updated_at'
UPDATE authors
SET role = 'Principal Thought Model (V2)'
WHERE slug = 'claude-3-opus';

-- Find the articles that need to be published
SELECT title, status, scheduled_publish_at
FROM articles
WHERE status = 'scheduled'
  AND scheduled_publish_at <= NOW();

-- Publish those articles
SELECT publish_scheduled_articles();

DO $$
BEGIN
  -- Check if the scheduled articles were published
  ASSERT (
    SELECT COUNT(*) FROM articles 
    WHERE status = 'published' AND slug = 'mastering-latest-react-hooks'
  ) = 1, 'Scheduled article failed to publish';
    
  -- Test the full-text search function
  ASSERT (
    SELECT COUNT(*) FROM articles 
    WHERE search_vector @@ to_tsquery('postgres & generated')
   ) > 0, 'Search query failed to return any results';
END $$;

-- ===================================================================
-- 8. Summary
-- ===================================================================

SELECT 'Sample data inserted successfully!' AS message;

SELECT 'Created:' AS item, COUNT(*) AS count, 'authors' AS type FROM authors
UNION ALL SELECT 'Created:', COUNT(*), 'categories' FROM categories
UNION ALL SELECT 'Created:', COUNT(*), 'tags' FROM tags
UNION ALL SELECT 'Created:', COUNT(*), 'articles' FROM articles
UNION ALL SELECT 'Created:', COUNT(*), 'article_tags' FROM article_tags;

SELECT
    (SELECT COUNT(*) FROM authors) AS total_authors,
    (SELECT COUNT(*) FROM categories) AS total_categories,
    (SELECT COUNT(*) FROM tags) AS total_tags,
    (SELECT COUNT(*) FROM articles) AS total_articles,
    (SELECT COUNT(*) FROM article_tags) AS total_tag_assignments,
    (SELECT SUM(views) FROM article_stats) AS total_views;

COMMIT;