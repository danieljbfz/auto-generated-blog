-- ===================================================================
-- Publishing Platform Schema
-- ===================================================================
-- This schema is designed with the following goals in mind:
-- • Modern PostgreSQL 12+ features (generated columns, pgcrypto)
-- • Rich, realistic indexing strategy
-- • Complete automation of published_at and updated_at
-- • Clear, pedagogical comments suitable for team onboarding
-- ===================================================================

-- Use the current official extension for cryptographically secure UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- replaces deprecated uuid-ossp
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- fuzzy matching support

-- CREATE EXTENSION IF NOT EXISTS "pg_cron"; -- cron scheduling