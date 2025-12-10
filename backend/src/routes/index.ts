import { Router } from 'express';
import articleRoutes from './article.routes.js';
import authorRoutes from './author.routes.js';
import categoryRoutes from './category.routes.js';
import tagRoutes from './tag.routes.js';
import healthRoutes from './health.routes.js';

/**
 * API Routes Aggregator
 * 
 * Combines all route modules into a single router with consistent prefixes.
 * 
 * Route Structure:
 * - /api/articles     - Article operations
 * - /api/authors      - Author operations
 * - /api/categories   - Category operations
 * - /api/tags         - Tag operations
 * - /api/health       - Health checks
 * 
 * Usage in main app:
 *   app.use('/api', routes);
 */
const router = Router();

// Mount route modules
router.use('/articles', articleRoutes);
router.use('/authors', authorRoutes);
router.use('/categories', categoryRoutes);
router.use('/tags', tagRoutes);
router.use('/health', healthRoutes);

/**
 * API Root
 * 
 * GET /api
 */
router.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'Auto-Generated Blog API',
    version: '1.0.0',
    endpoints: {
      articles: '/api/articles',
      authors: '/api/authors',
      categories: '/api/categories',
      tags: '/api/tags',
      health: '/api/health',
    },
    documentation: 'https://github.com/danieljbfz/...',
  });
});

export default router;