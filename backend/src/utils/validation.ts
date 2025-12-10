import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { ValidationError } from './errors.js';

// UUID validation (PostgreSQL UUIDs)
export const uuidSchema = z.uuid('Invalid UUID format');

// Slug validation (URL-safe identifiers)
export const slugSchema = z
  .string()
  .min(1, 'Slug cannot be empty')
  .max(220, 'Slug too long')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens');

// Pagination parameters 
export const paginationSchema = z.object({
  page: z
    .coerce.number()  // Handles string-to-number conversion
    .int('Page must be an integer')
    .positive('Page must be positive')
    .default(1),
  limit: z
    .coerce.number()
    .int('Limit must be an integer')
    .positive('Limit must be positive')
    .max(100, 'Limit cannot exceed 100')
    .default(10),
})

// Sort parameters
export const sortSchema = z.object({
  sortBy: z
    .enum(['createdAt', 'updatedAt', 'publishedAt', 'title', 'views'])
    .optional()
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

/**
 * Express Validation Middleware Factory
 *
 * Creates Express middleware that validates a request source (body, query, or params) 
 * against a Zod schema.
 *
 * @param schema - The Zod schema to enforce.
 * @param source - The request property to validate ('body', 'query', or 'params'). Defaults to 'body'.
 * @returns Express middleware function.
 *
 * @example
 * router.post('/articles', validate(createArticleSchema, 'body'), createController);
 */
export function validate(
  schema: z.ZodSchema,
  source: 'body' | 'query' | 'params' = 'body'
) {
  // Return the middleware function
  return (req: Request, _res: Response, next: NextFunction): void => {
    // Validate and parse the data
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      // Transform Zod errors into a user-friendly format
      const formattedErrors = result.error.issues.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code,
      }));

      // Pass error to the Express error handler
      next(new ValidationError('Validation failed', {
        errors: formattedErrors,
        source,
      }));
      return;
    }

    // Attach the type-safe, validated data back to the request
    req.validated = req.validated || {};
    req.validated[source] = result.data;

    next();
  };
}

/**
 * Slug Generator
 *
 * Converts arbitrary strings into URL-safe slugs.
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize('NFD')                 // Decompose accented characters
    .replace(/[\u0300-\u036f]/g, '')  // Remove diacritics
    .replace(/[^a-z0-9\s-]/g, '')     // Remove special chars
    .replace(/\s+/g, '-')             // Replace spaces with hyphens
    .replace(/-+/g, '-')              // Replace multiple hyphens with single
    .replace(/^-|-$/g, '');           // Trim hyphens from ends
}

/**
 * Word Counter
 *
 * Counts the number of words in a string.
 */
export function countWords(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
}

/**
 * Reading Time Estimator
 *
 * Estimates reading time based on word count.
 */
export function calculateReadingTime(wordCount: number): number {
  const wordsPerMinute = 200;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return Math.max(1, minutes);  // Minimum 1 minute
}