/**
 * Common Validation Schemas
 *
 * Reusable Zod schemas for common fields and operations
 */

import { z } from 'zod'

/**
 * Pagination Schema
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

/**
 * ID Parameter Schema
 */
export const idParamSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
})

/**
 * Search Query Schema
 */
export const searchQuerySchema = z.object({
  q: z.string().min(1).max(200).optional(),
})

/**
 * Sort Schema
 */
export const sortSchema = z.object({
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
})

/**
 * Date Range Schema
 */
export const dateRangeSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
})

/**
 * Phone Number Schema (Indian format)
 */
export const phoneNumberSchema = z
  .string()
  .regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number')

/**
 * Pincode Schema (Indian format)
 */
export const pincodeSchema = z
  .string()
  .regex(/^\d{6}$/, 'Invalid pincode')

/**
 * Email Schema
 */
export const emailSchema = z
  .string()
  .email('Invalid email address')
  .toLowerCase()

/**
 * Name Schema
 */
export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name must not exceed 100 characters')
  .trim()

/**
 * Price Schema
 */
export const priceSchema = z
  .number()
  .min(0, 'Price must be positive')
  .max(9999999.99, 'Price is too high')

/**
 * Quantity Schema
 */
export const quantitySchema = z
  .number()
  .int()
  .min(1, 'Quantity must be at least 1')
  .max(999, 'Quantity cannot exceed 999')

/**
 * Rating Schema
 */
export const ratingSchema = z
  .number()
  .int()
  .min(1, 'Rating must be at least 1')
  .max(5, 'Rating cannot exceed 5')

/**
 * Image URL Schema
 */
export const imageUrlSchema = z
  .string()
  .url('Invalid image URL')
  .max(500, 'URL too long')
