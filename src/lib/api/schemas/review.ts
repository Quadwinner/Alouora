/**
 * Review Validation Schemas
 *
 * Zod schemas for product review operations
 */

import { z } from 'zod'
import { paginationSchema, ratingSchema } from './common'

/**
 * Create Review Schema
 */
export const createReviewSchema = z.object({
  product_id: z.string().uuid('Invalid product ID'),
  order_id: z.string().uuid('Invalid order ID'),
  rating: ratingSchema,
  title: z.string().min(5, 'Title must be at least 5 characters').max(100).optional(),
  comment: z.string().min(10, 'Review must be at least 10 characters').max(1000),
  images: z.array(z.string().url()).max(5, 'Maximum 5 images allowed').optional(),
})

/**
 * Update Review Schema
 */
export const updateReviewSchema = z.object({
  rating: ratingSchema.optional(),
  title: z.string().min(5).max(100).optional(),
  comment: z.string().min(10).max(1000).optional(),
  images: z.array(z.string().url()).max(5).optional(),
})

/**
 * Review List Query Schema
 */
export const reviewListQuerySchema = paginationSchema.extend({
  product_id: z.string().uuid('Invalid product ID'),
  rating: ratingSchema.optional(),
  sort: z.enum(['recent', 'helpful', 'rating_high', 'rating_low']).default('recent'),
})
