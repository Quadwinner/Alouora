/**
 * Coupon Validation Schemas
 *
 * Zod schemas for coupon operations
 */

import { z } from 'zod'
import { paginationSchema, priceSchema } from './common'

/**
 * Coupon Code Schema
 * For applying coupons to cart
 */
export const couponCodeSchema = z
  .string()
  .min(3, 'Coupon code must be at least 3 characters')
  .max(50, 'Coupon code must not exceed 50 characters')
  .toUpperCase()
  .trim()

/**
 * Apply Coupon Schema
 */
export const applyCouponSchema = z.object({
  coupon_code: couponCodeSchema,
})

/**
 * Coupon List Query Schema
 * For fetching available coupons
 */
export const couponListQuerySchema = paginationSchema.extend({
  is_active: z.coerce.boolean().optional(),
  applicable_to: z.enum(['all', 'category', 'brand', 'product']).optional(),
  min_order_amount: z.coerce.number().min(0).optional(),
})

/**
 * Create Coupon Schema (Admin)
 */
export const createCouponSchema = z.object({
  code: couponCodeSchema,
  name: z.string().min(3, 'Name must be at least 3 characters').max(200),
  description: z.string().max(1000).optional(),
  discount_type: z.enum(['percentage', 'fixed']),
  discount_value: priceSchema,
  max_discount_amount: priceSchema.optional(),
  min_order_amount: priceSchema.default(0),
  max_uses: z.number().int().min(1).optional(),
  max_uses_per_user: z.number().int().min(1).default(1),
  valid_from: z.string().datetime('Invalid start date'),
  valid_until: z.string().datetime('Invalid end date'),
  applicable_to: z.enum(['all', 'category', 'brand', 'product']).default('all'),
  applicable_ids: z.array(z.string().uuid()).optional(),
  is_active: z.boolean().default(true),
})

/**
 * Update Coupon Schema (Admin)
 */
export const updateCouponSchema = createCouponSchema.partial().extend({
  code: couponCodeSchema.optional(),
})

/**
 * Validate Coupon Validity Schema
 * For checking if a coupon is valid for a specific cart
 */
export const validateCouponSchema = z.object({
  coupon_code: couponCodeSchema,
  cart_total: priceSchema,
  product_ids: z.array(z.string().uuid()).optional(),
  category_ids: z.array(z.string().uuid()).optional(),
  brand_ids: z.array(z.string().uuid()).optional(),
})
