import { Router } from 'express';
import { articleController } from '../controllers/article.controller.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { validate } from '../utils/validation.js';
import {
  createArticleSchema,
  updateArticleSchema,
  articleQuerySchema,
  articleIdSchema,
  articleSlugSchema,
} from '../validation/article.validation.js';

/**
 * Article Routes
 * 
 * Defines all HTTP endpoints for article operations.
 * 
 * Route Structure:
 * - GET    /api/articles                       - List articles (with filters)
 * - POST   /api/articles                       - Create article
 * - GET    /api/articles/feed                  - Get published feed (optimized)
 * - POST   /api/articles/generate              - Generate AI article
 * - POST   /api/articles/publish-scheduled     - Publish scheduled articles
 * - GET    /api/articles/:id                   - Get article by ID
 * - PATCH  /api/articles/:id                   - Update article
 * - DELETE /api/articles/:id                   - Delete article
 * - GET    /api/articles/by-slug/:slug         - Get article by slug (public view)
 */
const router = Router();

/**
 * List Articles
 * 
 * GET /api/articles?status=published&page=1&limit=10
 */
router.get(
  '/',
  validate(articleQuerySchema, 'query'),
  asyncHandler(articleController.getAll.bind(articleController))
);

/**
 * Get Published Feed
 * 
 * GET /api/articles/feed?page=1&limit=10
 */
router.get(
  '/feed',
  asyncHandler(articleController.getFeed.bind(articleController))
);

/**
 * Generate Article (AI)
 * 
 * POST /api/articles/generate
 * 
 * @remarks
 * We should rate limit this endpoint in production to prevent abuse.
 */
router.post(
  '/generate',
  asyncHandler(articleController.generate.bind(articleController))
);

/**
 * Publish Scheduled Articles
 * 
 * POST /api/articles/publish-scheduled
 */
router.post(
  '/publish-scheduled',
  asyncHandler(articleController.publishScheduled.bind(articleController))
);

/**
 * Get Article by Slug
 * 
 * GET /api/articles/by-slug/:slug
 * 
 * @remarks
 * This endpoint also increments the view counter automatically.
 */
router.get(
  '/by-slug/:slug',
  validate(articleSlugSchema, 'params'),
  asyncHandler(articleController.getBySlug.bind(articleController))
);

/**
 * Create Article
 * 
 * POST /api/articles
 */
router.post(
  '/',
  validate(createArticleSchema, 'body'),
  asyncHandler(articleController.create.bind(articleController))
);

/**
 * Get Article by ID
 * 
 * GET /api/articles/:id
 */
router.get(
  '/:id',
  validate(articleIdSchema, 'params'),
  asyncHandler(articleController.getById.bind(articleController))
);

/**
 * Update Article
 * 
 * PATCH /api/articles/:id
 */
router.patch(
  '/:id',
  validate(articleIdSchema, 'params'),
  validate(updateArticleSchema, 'body'),
  asyncHandler(articleController.update.bind(articleController))
);

/**
 * Delete Article
 * 
 * DELETE /api/articles/:id
 * 
 * @remarks
 * This is a hard delete, not a soft delete.
 * It also deletes all tags and stats associated with the article.
 */
router.delete(
  '/:id',
  validate(articleIdSchema, 'params'),
  asyncHandler(articleController.delete.bind(articleController))
);

export default router;