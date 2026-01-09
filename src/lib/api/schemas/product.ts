/**
 * Product Validation Schemas
 *
 * Zod schemas for product-related operations
 */

import { z } from 'zod'
import { paginationSchema, searchQuerySchema, sortSchema } from './common'

/**
 * Product List Query Schema
 */
export const productListQuerySchema = paginationSchema
  .merge(searchQuerySchema)
  .merge(sortSchema)
  .extend({
    category: z.string().uuid().optional(),
    brand: z.array(z.string().uuid()).or(z.string().uuid()).optional(),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
    colors: z.array(z.string()).or(z.string()).optional(),
    rating: z.coerce.number().int().min(1).max(5).optional(),
    sort: z
      .enum(['popularity', 'price_asc', 'price_desc', 'newest', 'rating'])
      .default('popularity'),
    inStock: z.coerce.boolean().optional(),
  })

/**
 * Product ID Parameter Schema
 */
export const productIdSchema = z.object({
  id: z.string().uuid('Invalid product ID'),
})
