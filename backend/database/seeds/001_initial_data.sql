-- Initial seed data for auto-blog
-- 
-- This file seeds categories only.
-- The AI author is created dynamically from environment variables
-- when the application starts for the first time (see ai.service.ts)

-- Categories (flat structure)
INSERT INTO categories (slug, name, description, is_active) VALUES
  ('web-development', 'Web Development', 'Modern web development practices and frameworks', true),
  ('javascript', 'JavaScript', 'JavaScript language features and best practices', true),
  ('typescript', 'TypeScript', 'TypeScript programming and type safety', true),
  ('react', 'React', 'React framework and ecosystem', true),
  ('backend', 'Backend Development', 'Server-side development and APIs', true),
  ('databases', 'Databases', 'Database design and optimization', true),
  ('devops', 'DevOps', 'Deployment, CI/CD, and infrastructure', true),
  ('docker', 'Docker', 'Containerization and Docker best practices', true),
  ('kubernetes', 'Kubernetes', 'Container orchestration', true),
  ('testing', 'Testing', 'Software testing strategies and tools', true),
  ('security', 'Security', 'Application security and best practices', true),
  ('performance', 'Performance', 'Optimization and performance tuning', true),
  ('architecture', 'Architecture', 'Software architecture patterns', true),
  ('cloud', 'Cloud Computing', 'Cloud platforms and services', true)
ON CONFLICT (slug, parent_id) DO NOTHING;