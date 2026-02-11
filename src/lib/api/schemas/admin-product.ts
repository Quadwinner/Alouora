/**
 * Admin Product Schemas
 *
 * Zod validation schemas for admin product CRUD operations
 */

import { z } from 'zod'

/**
 * Create Product Schema
 */
export const createProductSchema = z.object({
    name: z.string().min(2, 'Product name must be at least 2 characters'),
    slug: z
        .string()
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens')
        .optional(),
    brand_id: z.string().uuid('Invalid brand ID').nullable().optional(),
    category_id: z.string().uuid('Invalid category ID').nullable().optional(),
    description: z.string().nullable().optional(),
    ingredients: z.array(z.string()).nullable().optional(),
    how_to_use: z.array(z.string()).nullable().optional(),
    price: z.number().positive('Price must be a positive number'),
    original_price: z.number().positive().nullable().optional(),
    images: z.array(z.string().url()).nullable().optional(),
    thumbnail: z.string().url().nullable().optional(),
    stock_quantity: z.number().int().min(0).default(0),
    sku: z.string().nullable().optional(),
    is_active: z.boolean().default(true),
    is_featured: z.boolean().default(false),
    badges: z.array(z.string()).nullable().optional(),
    meta_title: z.string().nullable().optional(),
    meta_description: z.string().nullable().optional(),
})

export type CreateProductInput = z.infer<typeof createProductSchema>

/**
 * Update Product Schema (all fields optional)
 */
export const updateProductSchema = z.object({
    name: z.string().min(2).optional(),
    slug: z
        .string()
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
        .optional(),
    brand_id: z.string().uuid().nullable().optional(),
    category_id: z.string().uuid().nullable().optional(),
    description: z.string().nullable().optional(),
    ingredients: z.array(z.string()).nullable().optional(),
    how_to_use: z.array(z.string()).nullable().optional(),
    price: z.number().positive().optional(),
    original_price: z.number().positive().nullable().optional(),
    images: z.array(z.string().url()).nullable().optional(),
    thumbnail: z.string().url().nullable().optional(),
    stock_quantity: z.number().int().min(0).optional(),
    sku: z.string().nullable().optional(),
    is_active: z.boolean().optional(),
    is_featured: z.boolean().optional(),
    badges: z.array(z.string()).nullable().optional(),
    meta_title: z.string().nullable().optional(),
    meta_description: z.string().nullable().optional(),
})

export type UpdateProductInput = z.infer<typeof updateProductSchema>

/**
 * Admin product list query params
 */
export const adminProductListSchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().optional(),
    sort: z
        .enum(['newest', 'oldest', 'name_asc', 'name_desc', 'price_asc', 'price_desc', 'stock_asc', 'stock_desc'])
        .default('newest'),
    status: z.enum(['all', 'active', 'inactive']).default('all'),
    category_id: z.string().uuid().optional(),
    brand_id: z.string().uuid().optional(),
})

export type AdminProductListQuery = z.infer<typeof adminProductListSchema>
