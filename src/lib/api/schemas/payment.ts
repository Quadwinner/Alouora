/**
 * Payment Validation Schemas
 *
 * Zod schemas for payment operations
 */

import { z } from 'zod';

/**
 * Create Payment Order Schema
 * For creating Razorpay payment order
 */
export const createPaymentOrderSchema = z.object({
  amount: z.number().min(0, 'Amount must be positive').max(9999999.99, 'Amount is too high'),
  currency: z.string().length(3, 'Currency must be 3 characters').default('INR'),
  receipt: z.string().max(40, 'Receipt ID must not exceed 40 characters').optional(),
  notes: z.record(z.any()).optional(),
});

/**
 * Verify Payment Schema
 * For verifying Razorpay payment signature
 */
export const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
  order_id: z.string().uuid('Invalid order ID'),
});

/**
 * Payment Webhook Schema
 */
export const paymentWebhookSchema = z.object({
  event: z.string(),
  payload: z.record(z.any()),
});
