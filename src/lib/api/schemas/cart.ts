/**
 * Cart Validation Schemas
 *
 * Zod schemas for cart operations
 */

import { z } from 'zod'
import { quantitySchema } from './common'
import { couponCodeSchema } from './coupon'

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

/**
 * Apply Coupon Schema
 * Uses couponCodeSchema from coupon schemas for consistency
 */
export const applyCouponSchema = z.object({
  coupon_code: couponCodeSchema,
})
