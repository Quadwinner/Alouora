/**
 * Product Validation Schemas
 *
 * Zod schemas for product-related operations
 */

import { z } from 'zod'
import { paginationSchema } from './common'

/**
 * Product List Query Schema
 * Supports both UUID and slug for category/brand
 */
export const productListQuerySchema = paginationSchema
  .extend({
    q: z.string().min(1).max(200).optional(),
    search: z.string().min(1).max(200).optional(),
    category: z.string().optional(), // Can be UUID or slug
    brand: z.array(z.string()).or(z.string()).optional(), // Can be UUID or slug
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
    colors: z.array(z.string()).or(z.string()).optional(),
    rating: z.coerce.number().int().min(1).max(5).optional(),
    sort: z
      .enum(['popularity', 'price_low_to_high', 'price_high_to_low', 'newest', 'rating', 'discount'])
      .default('popularity'),
    inStock: z.coerce.boolean().optional(),
    featured: z.coerce.boolean().optional(),
  })

/**
 * Product ID Parameter Schema
 */
export const productIdSchema = z.object({
  id: z.string().uuid('Invalid product ID'),
})
