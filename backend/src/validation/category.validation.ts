import { z } from 'zod';
import { uuidSchema, slugSchema } from '../utils/validation.js';

/**
 * Create Category Request Body
 * 
 * Validates data for POST /api/categories
 */
export const createCategorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(120, 'Name too long'),
  slug: slugSchema.optional(),
  description: z.string().max(500, 'Description too long').optional(),
  parentId: uuidSchema.nullable().optional(),
  isActive: z.boolean().optional().default(true),
});

/**
 * Update Category Request Body
 * 
 * Validates data for PATCH /api/categories/:id
 * All fields are optional (partial update).
 */
export const updateCategorySchema = createCategorySchema.partial();

/**
 * Category ID Parameter
 * 
 * Validates UUID in route params
 * Example: /api/categories/:id
 */
export const categoryIdSchema = z.object({
  id: uuidSchema,
});

/**
 * Category Slug Parameter
 * 
 * Validates slug in route params
 * Example: /api/categories/by-slug/:slug
 */
export const categorySlugSchema = z.object({
  slug: slugSchema,
});