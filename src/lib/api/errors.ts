/**
 * API Error Handling Utilities
 *
 * Custom error classes and error handling middleware
 */

/**
 * Base API Error Class
 */
export class ApiError extends Error {
  statusCode: number
  isOperational: boolean

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational
    Error.captureStackTrace(this, this.constructor)
  }
}

/**
 * Validation Error (400)
 */
export class ValidationError extends ApiError {
  constructor(message: string = 'Validation failed') {
    super(message, 400)
    this.name = 'ValidationError'
  }
}

/**
 * Unauthorized Error (401)
 */
export class UnauthorizedError extends ApiError {
  constructor(message: string = 'Unauthorized access') {
    super(message, 401)
    this.name = 'UnauthorizedError'
  }
}

/**
 * Forbidden Error (403)
 */
export class ForbiddenError extends ApiError {
  constructor(message: string = 'Access forbidden') {
    super(message, 403)
    this.name = 'ForbiddenError'
  }
}

/**
 * Not Found Error (404)
 */
export class NotFoundError extends ApiError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404)
    this.name = 'NotFoundError'
  }
}

/**
 * Conflict Error (409)
 */
export class ConflictError extends ApiError {
  constructor(message: string = 'Resource already exists') {
    super(message, 409)
    this.name = 'ConflictError'
  }
}

/**
 * Bad Request Error (400)
 */
export class BadRequestError extends ApiError {
  constructor(message: string = 'Bad request') {
    super(message, 400)
    this.name = 'BadRequestError'
  }
}

/**
 * Internal Server Error (500)
 */
export class InternalServerError extends ApiError {
  constructor(message: string = 'Internal server error') {
    super(message, 500)
    this.name = 'InternalServerError'
  }
}

/**
 * Service Unavailable Error (503)
 */
export class ServiceUnavailableError extends ApiError {
  constructor(message: string = 'Service temporarily unavailable') {
    super(message, 503)
    this.name = 'ServiceUnavailableError'
  }
}

/**
 * Error Logger
 * Logs errors with context for debugging
 */
export function logError(error: Error | ApiError, context?: Record<string, any>): void {
  const timestamp = new Date().toISOString()
  const errorData = {
    timestamp,
    name: error.name,
    message: error.message,
    stack: error.stack,
    ...(error instanceof ApiError && {
      statusCode: error.statusCode,
      isOperational: error.isOperational,
    }),
    ...(context && { context }),
  }

  // Log to console (in production, you'd send this to a logging service like Sentry)
  console.error('API Error:', JSON.stringify(errorData, null, 2))
}

/**
 * Handle API Error
 * Determines the appropriate response for different error types
 */
export function handleApiError(error: unknown): {
  message: string
  statusCode: number
} {
  // Handle known API errors
  if (error instanceof ApiError) {
    return {
      message: error.message,
      statusCode: error.statusCode,
    }
  }

  // Handle standard JavaScript errors
  if (error instanceof Error) {
    return {
      message: error.message || 'An unexpected error occurred',
      statusCode: 500,
    }
  }

  // Handle unknown errors
  return {
    message: 'An unexpected error occurred',
    statusCode: 500,
  }
}

/**
 * Is Operational Error
 * Determines if an error is expected (operational) or a programming error
 */
export function isOperationalError(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.isOperational
  }
  return false
}

/**
 * Supabase Error Handler
 * Converts Supabase errors to user-friendly messages
 */
export function handleSupabaseError(error: any): ApiError {
  // Handle specific Supabase error codes
  if (error.code === '23505') {
    // Unique constraint violation
    return new ConflictError('This record already exists')
  }

  if (error.code === '23503') {
    // Foreign key violation
    return new BadRequestError('Invalid reference to related record')
  }

  if (error.code === '42501') {
    // Insufficient privilege (RLS)
    return new ForbiddenError('You do not have permission to access this resource')
  }

  if (error.code === 'PGRST116') {
    // No rows returned
    return new NotFoundError()
  }

  // Default to generic error
  return new InternalServerError(error.message || 'Database operation failed')
}
