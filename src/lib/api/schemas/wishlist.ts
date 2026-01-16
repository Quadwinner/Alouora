/**
 * Wishlist Validation Schemas
 *
 * Zod schemas for wishlist operations
 */

import { z } from 'zod';
import { idParamSchema } from './common';

/**
 * Add to Wishlist Schema
 */
export const addToWishlistSchema = z.object({
  product_id: z.string().uuid('Invalid product ID'),
  variant_id: z.string().uuid('Invalid variant ID').optional(),
});

/**
 * Wishlist ID Parameter Schema
 */
export const wishlistIdSchema = idParamSchema;
