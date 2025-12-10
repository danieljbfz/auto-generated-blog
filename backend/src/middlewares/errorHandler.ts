import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors.js';
import logger from '../utils/logger.js';
import { env } from '../config/env.js';

/**
 * Global error handler
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  
  logger.error({
    err,
    method: req.method,
    url: req.originalUrl,
    statusCode,
  }, 'Request error');
  
  const response = {
    success: false,
    error: {
      message: getErrorMessage(err),
      code: err.constructor.name,
      statusCode,
      ...(env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  };
  
  res.status(statusCode).json(response);
};

/**
 * Get user-safe error message
 */
function getErrorMessage(err: Error): string {
  if (env.NODE_ENV === 'development') {
    return err.message;
  }
  
  if (err instanceof AppError) {
    return err.message;
  }
  
  return 'An unexpected error occurred';
}

/**
 * 404 handler for undefined routes
 */
export const notFoundHandler = (req: Request, _res: Response, next: NextFunction): void => {
  const error = new AppError(`Cannot ${req.method} ${req.originalUrl}`, 404);
  next(error);
};

export default errorHandler;