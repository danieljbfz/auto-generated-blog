/**
 * Base application error
 */
export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly metadata?: Record<string, any>
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 400 - Bad Request
 */
export class ValidationError extends AppError {
  constructor(message: string, metadata?: Record<string, any>) {
    super(message, 400, metadata);
  }
}

/**
 * 401 - Unauthorized
 */
export class UnauthorizedError extends AppError {
  constructor(message: string, metadata?: Record<string, any>) {
    super(message, 401, metadata);
  }
}

/**
 * 404 - Not Found
 */
export class NotFoundError extends AppError {
  constructor(message: string, metadata?: Record<string, any>) {
    super(message, 404, metadata);
  }
}

/**
 * 409 - Conflict
 */
export class ConflictError extends AppError {
  constructor(message: string, metadata?: Record<string, any>) {
    super(message, 409, metadata);
  }
}


/**
 * 500 - Internal Server Error
 */
export class InternalError extends AppError {
  constructor(message: string = 'Internal server error', metadata?: Record<string, any>) {
    super(message, 500, metadata);
  }
}

/**
 * 503 - Service Unavailable
 */
export class ServiceUnavailableError extends AppError {
  constructor(message: string = 'Service unavailable', metadata?: Record<string, any>) {
    super(message, 503, metadata);
  }
}