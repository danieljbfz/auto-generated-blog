import { Router } from 'express';
import { authorController } from '../controllers/author.controller.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { validate } from '../utils/validation.js';
import {
  createAuthorSchema,
  updateAuthorSchema,
  authorIdSchema,
  authorSlugSchema,
} from '../validation/author.validation.js';

/**
 * Author Routes
 * 
 * Route Structure:
 * - GET    /api/authors                - List all active authors
 * - POST   /api/authors                - Create author
 * - GET    /api/authors/by-slug/:slug  - Get author by slug
 * - GET    /api/authors/:id            - Get author by ID
 * - PATCH  /api/authors/:id            - Update author
 * - DELETE /api/authors/:id            - Delete author
 */
const router = Router();

/**
 * List Authors
 * 
 * GET /api/authors
 */
router.get(
  '/',
  asyncHandler(authorController.getAll.bind(authorController))
);

/**
 * Get Author by Slug
 * 
 * GET /api/authors/by-slug/:slug
 */
router.get(
  '/by-slug/:slug',
  validate(authorSlugSchema, 'params'),
  asyncHandler(authorController.getBySlug.bind(authorController))
);

/**
 * Create Author
 * 
 * POST /api/authors
 */
router.post(
  '/',
  validate(createAuthorSchema, 'body'),
  asyncHandler(authorController.create.bind(authorController))
);

/**
 * Get Author by ID
 * 
 * GET /api/authors/:id
 */
router.get(
  '/:id',
  validate(authorIdSchema, 'params'),
  asyncHandler(authorController.getById.bind(authorController))
);

/**
 * Update Author
 * 
 * PATCH /api/authors/:id
 */
router.patch(
  '/:id',
  validate(authorIdSchema, 'params'),
  validate(updateAuthorSchema, 'body'),
  asyncHandler(authorController.update.bind(authorController))
);

/**
 * Delete Author
 * 
 * DELETE /api/authors/:id
 * 
 * @remarks
 * This is a hard delete, not a soft delete.
 */
router.delete(
  '/:id',
  validate(authorIdSchema, 'params'),
  asyncHandler(authorController.delete.bind(authorController))
);

export default router;