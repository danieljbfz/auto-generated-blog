import { Router } from 'express';
import { tagController } from '../controllers/tag.controller.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { validate } from '../utils/validation.js';
import {
  createTagSchema,
  updateTagSchema,
  tagIdSchema,
  tagSlugSchema,
} from '../validation/tag.validation.js';

/**
 * Tag Routes
 * 
 * Route Structure:
 * - GET    /api/tags                   - List all tags
 * - POST   /api/tags                   - Create tag
 * - GET    /api/tags/popular           - Get popular tags (by article count)
 * - GET    /api/tags/by-slug/:slug     - Get tag by slug
 * - GET    /api/tags/:id               - Get tag by ID
 * - PATCH  /api/tags/:id               - Update tag
 * - DELETE /api/tags/:id               - Delete tag
 */
const router = Router();

/**
 * List Tags
 * 
 * GET /api/tags
 */
router.get(
  '/',
  asyncHandler(tagController.getAll.bind(tagController))
);

/**
 * Get Popular Tags
 * 
 * GET /api/tags/popular?limit=20
 * 
 * @remarks
 * Returns a list of tags ordered by the number of published articles.
 */
router.get(
  '/popular',
  asyncHandler(tagController.getPopular.bind(tagController))
);

/**
 * Get Tag by Slug
 * 
 * GET /api/tags/by-slug/:slug
 */
router.get(
  '/by-slug/:slug',
  validate(tagSlugSchema, 'params'),
  asyncHandler(tagController.getBySlug.bind(tagController))
);

/**
 * Create Tag
 * 
 * POST /api/tags
 */
router.post(
  '/',
  validate(createTagSchema, 'body'),
  asyncHandler(tagController.create.bind(tagController))
);

/**
 * Get Tag by ID
 * 
 * GET /api/tags/:id
 */
router.get(
  '/:id',
  validate(tagIdSchema, 'params'),
  asyncHandler(tagController.getById.bind(tagController))
);

/**
 * Update Tag
 * 
 * PATCH /api/tags/:id
 */
router.patch(
  '/:id',
  validate(tagIdSchema, 'params'),
  validate(updateTagSchema, 'body'),
  asyncHandler(tagController.update.bind(tagController))
);

/**
 * Delete Tag
 * 
 * DELETE /api/tags/:id
 * 
 * @remarks
 * This is a hard delete, not a soft delete.
 */
router.delete(
  '/:id',
  validate(tagIdSchema, 'params'),
  asyncHandler(tagController.delete.bind(tagController))
);

export default router;