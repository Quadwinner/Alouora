/**
 * Order Validation Schemas
 *
 * Zod schemas for order and checkout operations
 */

import { z } from 'zod'
import { paginationSchema } from './common'

/**
 * Create Order Schema
 */
export const createOrderSchema = z.object({
  address_id: z.string().uuid('Invalid address ID'),
  payment_method: z.enum(['upi', 'card', 'netbanking', 'wallet', 'cod']),
  coupon_code: z.string().optional(),
  reward_points: z.number().int().min(0).optional(),
  special_instructions: z.string().max(500).optional(),
})

/**
 * Order List Query Schema
 */
export const orderListQuerySchema = paginationSchema.extend({
  status: z
    .enum(['pending', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'])
    .optional(),
})

/**
 * Cancel Order Schema
 */
export const cancelOrderSchema = z.object({
  reason: z.string().min(10, 'Please provide a reason').max(500),
})

/**
 * Checkout Validation Schema
 */
export const checkoutValidationSchema = z.object({
  address_id: z.string().uuid('Invalid address ID'),
  coupon_code: z.string().optional(),
})
