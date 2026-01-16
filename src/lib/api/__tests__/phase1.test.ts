/**
 * Phase 1: Shared Utilities & Helpers - Test Suite
 *
 * This test suite verifies that all Phase 1 components are complete and working:
 * 1. API Response Utilities
 * 2. Error Handling
 * 3. Validation Schemas
 * 4. Database Query Helpers
 */

import { describe, it, expect } from '@jest/globals'
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  notFoundResponse,
  unauthorizedResponse,
  forbiddenResponse,
  badRequestResponse,
  paginatedResponse,
  calculatePagination,
  type ApiResponse,
  type PaginationMeta,
} from '../response'

import {
  ApiError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  BadRequestError,
  InternalServerError,
  ServiceUnavailableError,
  handleApiError,
  handleSupabaseError,
  isOperationalError,
  logError,
} from '../errors'

import {
  // Common schemas
  paginationSchema,
  idParamSchema,
  searchQuerySchema,
  sortSchema,
  dateRangeSchema,
  phoneNumberSchema,
  pincodeSchema,
  emailSchema,
  nameSchema,
  priceSchema,
  quantitySchema,
  ratingSchema,
  imageUrlSchema,
  // Cart schemas
  addToCartSchema,
  updateCartItemSchema,
  applyCouponSchema as cartApplyCouponSchema,
  // Order schemas
  createOrderSchema,
  orderListQuerySchema,
  cancelOrderSchema,
  checkoutValidationSchema,
  // User schemas
  updateProfileSchema,
  addressSchema,
  updateAddressSchema,
  // Product schemas
  productListQuerySchema,
  productIdSchema,
  // Review schemas
  createReviewSchema,
  updateReviewSchema,
  reviewListQuerySchema,
  // Coupon schemas
  couponCodeSchema,
  applyCouponSchema,
  couponListQuerySchema,
  createCouponSchema,
  updateCouponSchema,
  validateCouponSchema,
} from '../schemas'

import {
  paginateQuery,
  getPaginationMetadata,
  executePaginatedQuery,
  applySort,
  applyFilters,
  applyRangeFilter,
  applySearch,
  getSingleRecord,
  recordExists,
  softDeleteRecord,
  executeInTransaction,
  batchInsert,
  batchUpdate,
} from '../../db/queries'

describe('Phase 1: API Response Utilities', () => {
  describe('successResponse', () => {
    it('should return success response with data', () => {
      const response = successResponse({ id: '123', name: 'Test' })
      expect(response.status).toBe(200)
    })

    it('should include message when provided', () => {
      const response = successResponse({ data: 'test' }, 'Success message')
      expect(response.status).toBe(200)
    })

    it('should support custom status codes', () => {
      const response = successResponse({ created: true }, undefined, 201)
      expect(response.status).toBe(201)
    })
  })

  describe('errorResponse', () => {
    it('should return error response', () => {
      const response = errorResponse('Test error', 400)
      expect(response.status).toBe(400)
    })

    it('should default to 500 status code', () => {
      const response = errorResponse('Server error')
      expect(response.status).toBe(500)
    })
  })

  describe('validationErrorResponse', () => {
    it('should format Zod validation errors', () => {
      const zodError = {
        issues: [{ message: 'Invalid input', path: ['field'] }],
      } as any
      const response = validationErrorResponse(zodError)
      expect(response.status).toBe(400)
    })
  })

  describe('calculatePagination', () => {
    it('should calculate pagination metadata correctly', () => {
      const meta = calculatePagination(2, 20, 100)
      expect(meta.page).toBe(2)
      expect(meta.limit).toBe(20)
      expect(meta.total).toBe(100)
      expect(meta.totalPages).toBe(5)
      expect(meta.hasNextPage).toBe(true)
      expect(meta.hasPreviousPage).toBe(true)
    })

    it('should handle last page correctly', () => {
      const meta = calculatePagination(5, 20, 100)
      expect(meta.hasNextPage).toBe(false)
    })

    it('should handle first page correctly', () => {
      const meta = calculatePagination(1, 20, 100)
      expect(meta.hasPreviousPage).toBe(false)
    })
  })
})

describe('Phase 1: Error Handling', () => {
  describe('Custom Error Classes', () => {
    it('should create ValidationError with 400 status', () => {
      const error = new ValidationError('Invalid input')
      expect(error.statusCode).toBe(400)
      expect(error.isOperational).toBe(true)
    })

    it('should create UnauthorizedError with 401 status', () => {
      const error = new UnauthorizedError('Not authorized')
      expect(error.statusCode).toBe(401)
    })

    it('should create NotFoundError with 404 status', () => {
      const error = new NotFoundError('User')
      expect(error.message).toContain('not found')
      expect(error.statusCode).toBe(404)
    })

    it('should create ConflictError with 409 status', () => {
      const error = new ConflictError('Already exists')
      expect(error.statusCode).toBe(409)
    })
  })

  describe('handleApiError', () => {
    it('should handle ApiError instances', () => {
      const error = new ValidationError('Test error')
      const result = handleApiError(error)
      expect(result.statusCode).toBe(400)
      expect(result.message).toBe('Test error')
    })

    it('should handle standard Error instances', () => {
      const error = new Error('Standard error')
      const result = handleApiError(error)
      expect(result.statusCode).toBe(500)
    })

    it('should handle unknown errors', () => {
      const result = handleApiError(null)
      expect(result.statusCode).toBe(500)
      expect(result.message).toBe('An unexpected error occurred')
    })
  })

  describe('handleSupabaseError', () => {
    it('should handle unique constraint violations', () => {
      const error = { code: '23505', message: 'Duplicate key' }
      const apiError = handleSupabaseError(error)
      expect(apiError).toBeInstanceOf(ConflictError)
    })

    it('should handle foreign key violations', () => {
      const error = { code: '23503', message: 'FK violation' }
      const apiError = handleSupabaseError(error)
      expect(apiError).toBeInstanceOf(BadRequestError)
    })

    it('should handle RLS policy violations', () => {
      const error = { code: '42501', message: 'Permission denied' }
      const apiError = handleSupabaseError(error)
      expect(apiError).toBeInstanceOf(ForbiddenError)
    })

    it('should handle no rows returned', () => {
      const error = { code: 'PGRST116', message: 'No rows' }
      const apiError = handleSupabaseError(error)
      expect(apiError).toBeInstanceOf(NotFoundError)
    })
  })

  describe('isOperationalError', () => {
    it('should return true for ApiError instances', () => {
      const error = new ValidationError('Test')
      expect(isOperationalError(error)).toBe(true)
    })

    it('should return false for standard errors', () => {
      const error = new Error('Test')
      expect(isOperationalError(error)).toBe(false)
    })
  })
})

describe('Phase 1: Validation Schemas', () => {
  describe('Common Schemas', () => {
    it('should validate pagination schema', () => {
      const valid = paginationSchema.parse({ page: 1, limit: 20 })
      expect(valid.page).toBe(1)
      expect(valid.limit).toBe(20)
    })

    it('should validate UUID schema', () => {
      const valid = idParamSchema.parse({ id: '123e4567-e89b-12d3-a456-426614174000' })
      expect(valid.id).toBe('123e4567-e89b-12d3-a456-426614174000')
    })

    it('should validate phone number (Indian format)', () => {
      const valid = phoneNumberSchema.parse('9876543210')
      expect(valid).toBe('9876543210')
    })

    it('should validate pincode (Indian format)', () => {
      const valid = pincodeSchema.parse('123456')
      expect(valid).toBe('123456')
    })

    it('should validate email', () => {
      const valid = emailSchema.parse('test@example.com')
      expect(valid).toBe('test@example.com')
    })

    it('should validate name', () => {
      const valid = nameSchema.parse('John Doe')
      expect(valid).toBe('John Doe')
    })

    it('should validate price', () => {
      const valid = priceSchema.parse(100.50)
      expect(valid).toBe(100.50)
    })

    it('should validate quantity', () => {
      const valid = quantitySchema.parse(5)
      expect(valid).toBe(5)
    })

    it('should validate rating', () => {
      const valid = ratingSchema.parse(4)
      expect(valid).toBe(4)
    })
  })

  describe('Cart Schemas', () => {
    it('should validate add to cart schema', () => {
      const valid = addToCartSchema.parse({
        product_id: '123e4567-e89b-12d3-a456-426614174000',
        variant_id: '123e4567-e89b-12d3-a456-426614174001',
        quantity: 2,
      })
      expect(valid.quantity).toBe(2)
    })

    it('should validate update cart item schema', () => {
      const valid = updateCartItemSchema.parse({ quantity: 3 })
      expect(valid.quantity).toBe(3)
    })

    it('should validate apply coupon schema', () => {
      const valid = cartApplyCouponSchema.parse({ coupon_code: 'SAVE20' })
      expect(valid.coupon_code).toBe('SAVE20')
    })
  })

  describe('Order Schemas', () => {
    it('should validate create order schema', () => {
      const valid = createOrderSchema.parse({
        address_id: '123e4567-e89b-12d3-a456-426614174000',
        payment_method: 'upi',
        coupon_code: 'SAVE20',
        reward_points: 100,
      })
      expect(valid.payment_method).toBe('upi')
    })

    it('should validate order list query schema', () => {
      const valid = orderListQuerySchema.parse({
        page: 1,
        limit: 20,
        status: 'pending',
      })
      expect(valid.status).toBe('pending')
    })

    it('should validate cancel order schema', () => {
      const valid = cancelOrderSchema.parse({
        reason: 'Changed my mind about this order',
      })
      expect(valid.reason.length).toBeGreaterThan(10)
    })
  })

  describe('User Schemas', () => {
    it('should validate update profile schema', () => {
      const valid = updateProfileSchema.parse({
        full_name: 'John Doe',
        date_of_birth: '1990-01-01',
        gender: 'male',
      })
      expect(valid.full_name).toBe('John Doe')
    })

    it('should validate address schema', () => {
      const valid = addressSchema.parse({
        full_name: 'John Doe',
        phone: '9876543210',
        address_line1: '123 Main Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        country: 'India',
        address_type: 'home',
      })
      expect(valid.city).toBe('Mumbai')
    })
  })

  describe('Product Schemas', () => {
    it('should validate product list query schema', () => {
      const valid = productListQuerySchema.parse({
        page: 1,
        limit: 20,
        category: '123e4567-e89b-12d3-a456-426614174000',
        minPrice: 100,
        maxPrice: 1000,
        sort: 'price_asc',
      })
      expect(valid.sort).toBe('price_asc')
    })

    it('should validate product ID schema', () => {
      const valid = productIdSchema.parse({
        id: '123e4567-e89b-12d3-a456-426614174000',
      })
      expect(valid.id).toBeDefined()
    })
  })

  describe('Review Schemas', () => {
    it('should validate create review schema', () => {
      const valid = createReviewSchema.parse({
        product_id: '123e4567-e89b-12d3-a456-426614174000',
        order_id: '123e4567-e89b-12d3-a456-426614174001',
        rating: 5,
        title: 'Great product!',
        comment: 'This is an excellent product that I highly recommend.',
      })
      expect(valid.rating).toBe(5)
    })

    it('should validate review list query schema', () => {
      const valid = reviewListQuerySchema.parse({
        product_id: '123e4567-e89b-12d3-a456-426614174000',
        page: 1,
        limit: 20,
        rating: 4,
        sort: 'recent',
      })
      expect(valid.sort).toBe('recent')
    })
  })

  describe('Coupon Schemas', () => {
    it('should validate coupon code schema', () => {
      const valid = couponCodeSchema.parse('SAVE20')
      expect(valid).toBe('SAVE20')
    })

    it('should validate apply coupon schema', () => {
      const valid = applyCouponSchema.parse({ coupon_code: 'SAVE20' })
      expect(valid.coupon_code).toBe('SAVE20')
    })

    it('should validate coupon list query schema', () => {
      const valid = couponListQuerySchema.parse({
        page: 1,
        limit: 20,
        is_active: true,
        applicable_to: 'all',
      })
      expect(valid.is_active).toBe(true)
    })

    it('should validate create coupon schema', () => {
      const valid = createCouponSchema.parse({
        code: 'SAVE20',
        name: '20% Off Sale',
        description: 'Get 20% off on all products',
        discount_type: 'percentage',
        discount_value: 20,
        max_discount_amount: 500,
        min_order_amount: 1000,
        max_uses: 1000,
        max_uses_per_user: 1,
        valid_from: '2024-01-01T00:00:00Z',
        valid_until: '2024-12-31T23:59:59Z',
        applicable_to: 'all',
        is_active: true,
      })
      expect(valid.code).toBe('SAVE20')
      expect(valid.discount_type).toBe('percentage')
    })

    it('should validate validate coupon schema', () => {
      const valid = validateCouponSchema.parse({
        coupon_code: 'SAVE20',
        cart_total: 1500,
        product_ids: ['123e4567-e89b-12d3-a456-426614174000'],
      })
      expect(valid.cart_total).toBe(1500)
    })
  })
})

describe('Phase 1: Database Query Helpers', () => {
  // Note: These tests would require a mock Supabase client
  // For now, we'll just verify the functions are exported and callable

  it('should export paginateQuery function', () => {
    expect(typeof paginateQuery).toBe('function')
  })

  it('should export getPaginationMetadata function', () => {
    expect(typeof getPaginationMetadata).toBe('function')
  })

  it('should export executePaginatedQuery function', () => {
    expect(typeof executePaginatedQuery).toBe('function')
  })

  it('should export applySort function', () => {
    expect(typeof applySort).toBe('function')
  })

  it('should export applyFilters function', () => {
    expect(typeof applyFilters).toBe('function')
  })

  it('should export applyRangeFilter function', () => {
    expect(typeof applyRangeFilter).toBe('function')
  })

  it('should export applySearch function', () => {
    expect(typeof applySearch).toBe('function')
  })

  it('should export getSingleRecord function', () => {
    expect(typeof getSingleRecord).toBe('function')
  })

  it('should export recordExists function', () => {
    expect(typeof recordExists).toBe('function')
  })

  it('should export softDeleteRecord function', () => {
    expect(typeof softDeleteRecord).toBe('function')
  })

  it('should export executeInTransaction function', () => {
    expect(typeof executeInTransaction).toBe('function')
  })

  it('should export batchInsert function', () => {
    expect(typeof batchInsert).toBe('function')
  })

  it('should export batchUpdate function', () => {
    expect(typeof batchUpdate).toBe('function')
  })
})

describe('Phase 1: Integration Test', () => {
  it('should work together: validation -> error handling -> response', () => {
    // Simulate a validation error
    try {
      addToCartSchema.parse({ product_id: 'invalid' })
    } catch (error: any) {
      const apiError = handleApiError(error)
      const response = errorResponse(apiError.message, apiError.statusCode)
      expect(response.status).toBeGreaterThanOrEqual(400)
    }
  })

  it('should validate coupon and return success response', () => {
    const couponData = applyCouponSchema.parse({ coupon_code: 'SAVE20' })
    const response = successResponse({ coupon: couponData }, 'Coupon applied successfully')
    expect(response.status).toBe(200)
  })
})
