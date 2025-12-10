-- ===================================================================
-- Insert Sample Data
-- ===================================================================
-- This script populates the tables with sample data to test
-- relationships, indexes, triggers, and constraints.
--
-- Note: UUIDs are inserted manually for easy cross-referencing
-- between the articles and article_tags tables. In a real application,
-- the 'DEFAULT gen_random_uuid()' would generate these automatically.
-- ===================================================================

BEGIN TRANSACTION;

-- ===================================================================
-- 1. Authors
-- ===================================================================

INSERT INTO authors (id, slug, name, role, type, is_active, website, created_at) VALUES
('b301a2f0-7b3e-4d43-982c-4e5678901234', 'gpt-4', 'GPT-4', 'Senior Content Model', 'ai', TRUE, 'https://openai.com', NOW() - INTERVAL '2 years'),
('c4d2b3a1-8c4f-4e54-993d-5f6789012345', 'claude-3-opus', 'Claude 3 Opus', 'Principal Thought Model', 'ai', TRUE, 'https://anthropic.com', NOW() - INTERVAL '18 months'),
('e6f4d5c3-9d6a-4f65-0a4e-7f8901234567', 'human-editor', 'Alice Johnson', 'Managing Editor', 'human', TRUE, 'https://example.com/alice', NOW() - INTERVAL '1 year'),
('f7f8f9f0-f1f2-f3f4-f5f6-f7f8f9f0f1f2', 'gemini-pro', 'Gemini Pro', 'Multimodal AI', 'ai', TRUE, 'https://deepmind.google', NOW() - INTERVAL '6 months'),
('f8f9f0f1-f2f3-f4f5-f6f7-f8f9f0f1f2f3', 'grok-4', 'Grok 4', 'Truth-seeking AI', 'ai', TRUE, 'https://x.ai', NOW() - INTERVAL '3 months');

-- ===================================================================
-- 2. Categories (Hierarchical Structure)
--
-- Programming -> Databases -> PostgreSQL
-- Programming -> Frontend -> React
-- Programming -> Frontend -> Next.js
-- Artificial Intelligence -> Large Language Models
-- Non-Tech
-- ===================================================================

-- Root Categories (Parent IS NULL)
INSERT INTO categories (id, parent_id, slug, name, created_at) VALUES
('1a1b1c1d-1111-2222-3333-100000000001', NULL, 'programming', 'Programming', NOW() - INTERVAL '2 years'),
('2b2c2d2e-2222-3333-4444-200000000002', NULL, 'artificial-intelligence', 'Artificial Intelligence', NOW() - INTERVAL '1 year'),
('3c3d3e3f-3333-4444-5555-300000000003', NULL, 'non-tech', 'Non-Technical', NOW() - INTERVAL '2 years');

-- Level 2 Categories
INSERT INTO categories (id, parent_id, slug, name, created_at) VALUES
('4d4e4f4a-4444-5555-6666-400000000004', '1a1b1c1d-1111-2222-3333-100000000001', 'databases', 'Databases', NOW() - INTERVAL '1 year'),
('5e5f5a5b-5555-6666-7777-500000000005', '1a1b1c1d-1111-2222-3333-100000000001', 'frontend', 'Frontend Development', NOW() - INTERVAL '1 year'),
('6f6a6b6c-6666-7777-8888-600000000006', '2b2c2d2e-2222-3333-4444-200000000002', 'large-language-models', 'Large Language Models', NOW() - INTERVAL '6 months');

-- Level 3 Categories
INSERT INTO categories (id, parent_id, slug, name, description, created_at) VALUES
('7a7b7c7d-7777-8888-9999-700000000007', '4d4e4f4a-4444-5555-6666-400000000004', 'postgresql', 'PostgreSQL', 'Deep dives into Postgres features.', NOW() - INTERVAL '6 months'),
('8b8c8d8e-8888-9999-0000-800000000008', '5e5f5a5b-5555-6666-7777-500000000005', 'react', 'React', 'Articles on hooks, state, and component architecture.', NOW() - INTERVAL '6 months'),
('9c9d9e9f-9999-0000-1111-900000000009', '5e5f5a5b-5555-6666-7777-500000000005', 'next-js', 'Next.js', 'React framework for production.', NOW() - INTERVAL '3 months');

-- ===================================================================
-- 3. Tags (Flat)
-- ===================================================================

INSERT INTO tags (id, slug, name, created_at) VALUES
('b1000000-0000-0000-0000-000000000001', 'sql', 'SQL', NOW() - INTERVAL '2 years'),
('b1000000-0000-0000-0000-000000000002', 'orm', 'ORM', NOW() - INTERVAL '2 years'),
('b1000000-0000-0000-0000-000000000003', 'javascript', 'JavaScript', NOW() - INTERVAL '2 years'),
('b1000000-0000-0000-0000-000000000004', 'ai', 'Artificial Intelligence', NOW() - INTERVAL '1 year'),
('b1000000-0000-0000-0000-000000000005', 'tutorial', 'Tutorial', NOW() - INTERVAL '1 year'),
('b1000000-0000-0000-0000-000000000006', 'performance', 'Performance', NOW() - INTERVAL '1 year'),
('b1000000-0000-0000-0000-000000000007', 'full-text-search', 'Full-Text Search', NOW() - INTERVAL '6 months'),
('b1000000-0000-0000-0000-000000000008', 'gin-index', 'GIN Index', NOW() - INTERVAL '6 months'),
('b1000000-0000-0000-0000-000000000009', 'next-js', 'Next.js', NOW() - INTERVAL '3 months');

-- ===================================================================
-- 4. Articles
--
-- Article 1: Published, PostgreSQL category, GPT-4 author.
-- Article 2: Scheduled, React category, Claude 3 author. (Scheduled for 5 min from now)
-- Article 3: Draft, Non-Tech category, Alice author.
-- Article 4: Archived, Databases category, Gemini Pro author.
-- Article 5: Published, Next.js category, GPT-4 author.
-- ===================================================================

INSERT INTO articles (id, author_id, category_id, title, slug, excerpt, body, status, reading_time_minutes, seo_score, scheduled_publish_at, featured_image, image_alt, metadata, created_at) VALUES
(
  'a1000000-0000-0000-0000-000000000001',
  'b301a2f0-7b3e-4d43-982c-4e5678901234', -- GPT-4
  '7a7b7c7d-7777-8888-9999-700000000007', -- PostgreSQL
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
),
(
  'a1000000-0000-0000-0000-000000000002',
  'c4d2b3a1-8c4f-4e54-993d-5f6789012345', -- Claude 3 Opus
  '8b8c8d8e-8888-9999-0000-800000000008', -- React
  'Mastering the latest React Hooks',
  'mastering-latest-react-hooks',
  'A comprehensive guide to modern state management and effects in React.',
  'React is constantly evolving. The new hooks introduced in the recent version change how we think about component lifecycle...',
  'scheduled',
  12,
  85,
  NOW() - INTERVAL '5 minutes', -- Set slightly in the past to trigger immediate 'publish' in step 7
  'https://example.com/images/react-hooks-guide.png',
  'React logo with hooks as puzzle pieces fitting together',
  '{"canonicalUrl": "https://blog.example.com/mastering-react-hooks", "keywords": ["react", "hooks", "frontend"], "requiresReview": true}',
  NOW() - INTERVAL '10 days'
),
(
  'a1000000-0000-0000-0000-000000000003',
  'e6f4d5c3-9d6a-4f65-0a4e-7f8901234567', -- Alice Johnson
  '3c3d3e3f-3333-4444-5555-300000000003', -- Non-Technical
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
),
(
  'a1000000-0000-0000-0000-000000000004',
  'f7f8f9f0-f1f2-f3f4-f5f6-f7f8f9f0f1f2', -- Gemini Pro
  '4d4e4f4a-4444-5555-6666-400000000004', -- Databases
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
),
(
  'a1000000-0000-0000-0000-000000000005',
  'b301a2f0-7b3e-4d43-982c-4e5678901234', -- GPT-4
  '9c9d9e9f-9999-0000-1111-900000000009', -- Next.js
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
);

-- ===================================================================
-- 5. Article Stats
--
-- Only for the published article to simulate live traffic.
-- ===================================================================

INSERT INTO article_stats (article_id, views, updated_at) VALUES
('a1000000-0000-0000-0000-000000000001', 12450, NOW() - INTERVAL '30 minutes'), -- The PostgreSQL article
('a1000000-0000-0000-0000-000000000004', 3456, NOW() - INTERVAL '6 months'), -- The MongoDB article
('a1000000-0000-0000-0000-000000000005', 89123, NOW() - INTERVAL '1 day'); -- The Next.js article

-- ===================================================================
-- 6. Article Tags (Many-to-Many)
-- ===================================================================

INSERT INTO article_tags (article_id, tag_id) VALUES
-- Article 1 (PostgreSQL): tagged with SQL, ORM, Tutorial, Performance, Full-Text Search
('a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001'), -- SQL
('a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000002'), -- ORM
('a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000005'), -- Tutorial
('a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000006'), -- Performance
('a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000007'), -- Full-Text Search

-- Article 2 (React): tagged with JavaScript, AI
('a1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000003'), -- JavaScript
('a1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000004'), -- AI

-- Article 4 (PostgreSQL Legacy): tagged with SQL, Tutorial
('a1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000001'), -- SQL
('a1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000005'); -- Tutorial

-- Associates Article 5 with several existing tags using a SELECT subquery.
INSERT INTO article_tags (article_id, tag_id)
SELECT 'a1000000-0000-0000-0000-000000000005', id FROM tags 
WHERE slug IN ('next-js', 'javascript', 'tutorial', 'performance');

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
  (SELECT COUNT(*) FROM authors)         AS total_authors,
  (SELECT COUNT(*) FROM categories)      AS total_categories,
  (SELECT COUNT(*) FROM tags)            AS total_tags,
  (SELECT COUNT(*) FROM articles)        AS total_articles,
  (SELECT COUNT(*) FROM article_tags)    AS total_tag_assignments,
  (SELECT SUM(views) FROM article_stats) AS total_views;

COMMIT;