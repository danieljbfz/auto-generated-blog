import { Router } from 'express';
import { categoryController } from '../controllers/category.controller.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { validate } from '../utils/validation.js';
import {
  createCategorySchema,
  updateCategorySchema,
  categoryIdSchema,
} from '../validation/category.validation.js';

/**
 * Category Routes
 * 
 * Route Structure:
 * - GET    /api/categories                 - List all categories (flat)
 * - POST   /api/categories                 - Create category
 * - GET    /api/categories/tree            - Get category tree (hierarchical)
 * - GET    /api/categories/roots           - Get root categories (no parent)
 * - GET    /api/categories/:id             - Get category by ID
 * - PATCH  /api/categories/:id             - Update category
 * - DELETE /api/categories/:id             - Delete category
 * - GET    /api/categories/:id/children    - Get children of category
 */
const router = Router();

/**
 * List Categories
 * 
 * GET /api/categories
 */
router.get(
  '/',
  asyncHandler(categoryController.getAll.bind(categoryController))
);

/**
 * Get Category Tree
 * 
 * GET /api/categories/tree
 */
router.get(
  '/tree',
  asyncHandler(categoryController.getTree.bind(categoryController))
);

/**
 * Get Root Categories
 * 
 * GET /api/categories/roots
 */
router.get(
  '/roots',
  asyncHandler(categoryController.getRoots.bind(categoryController))
);

/**
 * Create Category
 * 
 * POST /api/categories
 */
router.post(
  '/',
  validate(createCategorySchema, 'body'),
  asyncHandler(categoryController.create.bind(categoryController))
);

/**
 * Get Category by ID
 * 
 * GET /api/categories/:id
 */
router.get(
  '/:id',
  validate(categoryIdSchema, 'params'),
  asyncHandler(categoryController.getById.bind(categoryController))
);

/**
 * Update Category
 * 
 * PATCH /api/categories/:id
 */
router.patch(
  '/:id',
  validate(categoryIdSchema, 'params'),
  validate(updateCategorySchema, 'body'),
  asyncHandler(categoryController.update.bind(categoryController))
);

/**
 * Delete Category
 * 
 * DELETE /api/categories/:id
 * 
 * @remarks
 * This is a hard delete, not a soft delete.
 */
router.delete(
  '/:id',
  validate(categoryIdSchema, 'params'),
  asyncHandler(categoryController.delete.bind(categoryController))
);

/**
 * Get Children Categories
 * 
 * GET /api/categories/:id/children
 */
router.get(
  '/:id/children',
  validate(categoryIdSchema, 'params'),
  asyncHandler(categoryController.getChildren.bind(categoryController))
);

export default router;