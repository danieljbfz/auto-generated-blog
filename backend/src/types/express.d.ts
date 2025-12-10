import 'express-serve-static-core';

/**
 * Express Request Type Augmentation
 * 
 * Extends the Express Request interface to include validated data
 * from our Zod validation middleware.
 */
declare module 'express-serve-static-core' {
  interface Request {
    validated?: {
      /** Validated request body (POST, PUT, PATCH) */
      body?: unknown;

      /** Validated query parameters (GET) */
      query?: unknown;

      /** Validated route parameters (:id, :slug) */
      params?: unknown;
    };
  }
}