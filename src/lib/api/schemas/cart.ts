/**
 * Cart Validation Schemas
 *
 * Zod schemas for cart operations
 */

import { z } from 'zod'
import { quantitySchema } from './common'

/**
 * Add to Cart Schema
 */
export const addToCartSchema = z.object({
  product_id: z.string().uuid('Invalid product ID'),
  variant_id: z.string().uuid('Invalid variant ID').optional(),
  quantity: quantitySchema,
})

/**
 * Update Cart Item Schema
 */
export const updateCartItemSchema = z.object({
  quantity: quantitySchema,
})

// Note: applyCouponSchema is exported from './coupon' to avoid duplication
// Import it directly from coupon.ts when needed
