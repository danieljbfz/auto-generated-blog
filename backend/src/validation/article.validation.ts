import { z } from 'zod';
import { ArticleStatus } from '../types/article.js';
import { uuidSchema, slugSchema, paginationSchema, sortSchema } from '../utils/validation.js';


/**
 * Create Article Request Body
 * 
 * Validates data for POST /api/articles
 * Required fields are enforced at runtime.
 */
export const createArticleSchema = z.object({
  authorId: uuidSchema,
  categoryId: uuidSchema,
  title: z.string().min(10, 'Title must be at least 10 characters').max(200, 'Title too long'),
  slug: slugSchema.optional(),
  excerpt: z.string().min(50, 'Excerpt must be at least 50 characters').max(500, 'Excerpt too long').optional(),
  body: z.string().min(100, 'Body must be at least 100 characters'),
  status: z.enum(ArticleStatus).optional().default(ArticleStatus.DRAFT),
  tags: z.array(z.string().min(1).max(50)).max(10, 'Maximum 10 tags allowed').optional(),
  featuredImage: z.url('Invalid image URL').optional(),
  imageAlt: z.string().max(300, 'Image alt text too long').optional(),
  scheduledPublishAt: z.iso.datetime().optional(),
  metadata: z.object({
    metaTitle: z.string().max(60).optional(),
    metaDescription: z.string().max(160).optional(),
    keywords: z.array(z.string()).optional(),
    canonicalUrl: z.url().optional(),
  }).optional(),
});

/**
 * Update Article Request Body
 * 
 * Validates data for PATCH /api/articles/:id
 * All fields are optional (partial update).
 */
export const updateArticleSchema = createArticleSchema.partial();

/**
 * Article Query Parameters
 * 
 * Validates query strings for GET /api/articles
 * Example: ?status=published&categoryId=123&page=1&limit=10
 */
export const articleQuerySchema = z.object({
  ...paginationSchema.shape,
  ...sortSchema.shape,
  status: z.union([
    z.enum(ArticleStatus),
    z.string().transform(val => val.split(',') as ArticleStatus[]),
  ]).optional(),
  categoryId: uuidSchema.optional(),
  authorId: uuidSchema.optional(),
  tagIds: z.string().transform(val => val.split(',')).optional(),
  searchTerm: z.string().min(2, 'Search term must be at least 2 characters').optional(),
  publishedAfter: z.iso.datetime().optional(),
  publishedBefore: z.iso.datetime().optional(),
  includeCategory: z.string().transform(val => val === 'true').optional(),
  includeTags: z.string().transform(val => val === 'true').optional(),
  includeStats: z.string().transform(val => val === 'true').optional(),
  includeAuthor: z.string().transform(val => val === 'true').optional(),
});

/**
 * Article ID Parameter
 * 
 * Validates UUID in route params
 * Example: /api/articles/:id
 */
export const articleIdSchema = z.object({
  id: uuidSchema,
});

/**
 * Article Slug Parameter
 * 
 * Validates slug in route params
 * Example: /api/articles/by-slug/:slug
 */
export const articleSlugSchema = z.object({
  slug: slugSchema,
});