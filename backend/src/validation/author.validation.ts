import { z } from 'zod';
import { uuidSchema, slugSchema } from '../utils/validation.js';

/**
 * Create Author Request Body
 * 
 * Validates data for POST /api/authors
 */
export const createAuthorSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(120, 'Name too long'),
  slug: slugSchema.optional(),
  role: z.string().max(120, 'Role too long').optional(),
  avatarUrl: z.url('Invalid avatar URL').max(500, 'Avatar URL too long').optional(),
  bio: z.string().max(1000, 'Bio too long').optional(),
  website: z.url('Invalid website URL').max(500, 'Website URL too long').optional(),
  type: z.enum(['ai', 'human']).optional().default('ai'),
  isActive: z.boolean().optional().default(true),
});

/**
 * Update Author Request Body
 * 
 * Validates data for PATCH /api/authors/:id
 * All fields are optional (partial update).
 */
export const updateAuthorSchema = createAuthorSchema.partial();

/**
 * Author ID Parameter
 * 
 * Validates UUID in route params
 * Example: /api/authors/:id
 */
export const authorIdSchema = z.object({
  id: uuidSchema,
});

/**
 * Author Slug Parameter
 * 
 * Validates slug in route params
 * Example: /api/authors/by-slug/:slug
 */
export const authorSlugSchema = z.object({
  slug: slugSchema,
});