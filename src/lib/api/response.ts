/**
 * API Response Utilities
 *
 * Standard response formatters for consistent API responses
 */

import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

/**
 * Standard API Response Interface
 */
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

/**
 * Success Response
 * Returns a standardized success response
 */
export function successResponse<T>(
  data: T,
  message?: string,
  statusCode: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(message && { message }),
    },
    { status: statusCode }
  )
}

/**
 * Error Response
 * Returns a standardized error response
 */
export function errorResponse(
  error: string,
  statusCode: number = 500
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error,
    },
    { status: statusCode }
  )
}

/**
 * Validation Error Response
 * Formats Zod validation errors into user-friendly messages
 */
export function validationErrorResponse(
  zodError: ZodError | Error
): NextResponse<ApiResponse> {
  if (zodError instanceof ZodError) {
    const firstError = zodError.issues?.[0]
    const errorMessage = firstError?.message || 'Validation failed'
    
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 400 }
    )
  }
  
  // Fallback for non-Zod errors
  return NextResponse.json(
    {
      success: false,
      error: zodError.message || 'Validation failed',
    },
    { status: 400 }
  )
}

/**
 * Not Found Response
 */
export function notFoundResponse(
  resource: string = 'Resource'
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: `${resource} not found`,
    },
    { status: 404 }
  )
}

/**
 * Unauthorized Response
 */
export function unauthorizedResponse(
  message: string = 'Unauthorized access'
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status: 401 }
  )
}

/**
 * Forbidden Response
 */
export function forbiddenResponse(
  message: string = 'Access forbidden'
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status: 403 }
  )
}

/**
 * Bad Request Response
 */
export function badRequestResponse(
  message: string = 'Bad request'
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status: 400 }
  )
}

/**
 * Pagination Metadata Interface
 */
export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

/**
 * Paginated Response
 * Returns data with pagination metadata
 */
export function paginatedResponse<T>(
  data: T[],
  pagination: PaginationMeta,
  message?: string
): NextResponse<ApiResponse<{ items: T[]; pagination: PaginationMeta }>> {
  return NextResponse.json(
    {
      success: true,
      data: {
        items: data,
        pagination,
      },
      ...(message && { message }),
    },
    { status: 200 }
  )
}

/**
 * Calculate Pagination Metadata
 */
export function calculatePagination(
  page: number,
  limit: number,
  total: number
): PaginationMeta {
  const totalPages = Math.ceil(total / limit)

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  }
}
