import { z } from 'zod';
import { uuidSchema, slugSchema } from '../utils/validation.js';

/**
 * Create Tag Request Body
 * 
 * Validates data for POST /api/tags
 */
export const createTagSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  slug: slugSchema.optional(),
});

/**
 * Update Tag Request Body
 * 
 * Validates data for PATCH /api/tags/:id
 * All fields are optional (partial update).
 */
export const updateTagSchema = createTagSchema.partial();

/**
 * Tag ID Parameter
 * 
 * Validates UUID in route params
 * Example: /api/tags/:id
 */
export const tagIdSchema = z.object({
  id: uuidSchema,
});

/**
 * Tag Slug Parameter
 * 
 * Validates slug in route params
 * Example: /api/tags/by-slug/:slug
 */
export const tagSlugSchema = z.object({
  slug: slugSchema,
});