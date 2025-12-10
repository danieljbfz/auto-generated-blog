import { Request } from 'express';
import { InternalError } from './errors.js';

/**
 * Get validated request body
 * 
 * @param req - Express request object
 * @returns Typed request body
 * @throws InternalError if the validation middleware did not run
 */
export function getValidatedBody<T>(req: Request): T {
  if (!req.validated?.body) {
    throw new InternalError('Validation middleware did not run for request body');
  }
  return req.validated.body as T;
}

/**
 * Get validated query parameters
 * 
 * @param req - Express request object
 * @returns Typed query parameters
 * @throws InternalError if the validation middleware did not run
 */
export function getValidatedQuery<T>(req: Request): T {
  if (!req.validated?.query) {
    throw new InternalError('Validation middleware did not run for query parameters');
  }
  return req.validated.query as T;
}

/**
 * Get validated route parameters
 * 
 * @param req - Express request object
 * @returns Typed route parameters
 * @throws InternalError if the validation middleware did not run
 */
export function getValidatedParams<T>(req: Request): T {
  if (!req.validated?.params) {
    throw new InternalError('Validation middleware did not run for route parameters');
  }
  return req.validated.params as T;
}