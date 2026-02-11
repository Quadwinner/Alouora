/**
 * Admin Products API
 *
 * GET  /api/admin/products - List all products (including inactive)
 * POST /api/admin/products - Create a new product
 */

import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/api/admin'
import {
    successResponse,
    errorResponse,
    validationErrorResponse,
    forbiddenResponse,
    calculatePagination,
} from '@/lib/api/response'
import {
    adminProductListSchema,
    createProductSchema,
} from '@/lib/api/schemas/admin-product'

/**
 * Helper: generate slug from name
 */
function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
}

/**
 * GET /api/admin/products - List all products with pagination, search, filters
 */
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Check admin access
        const admin = await requireAdmin(supabase)
        if (!admin) {
            return forbiddenResponse('Admin access required')
        }

        // Parse query params
        const { searchParams } = new URL(request.url)
        const params = {
            page: searchParams.get('page') || '1',
            limit: searchParams.get('limit') || '20',
            search: searchParams.get('search') || undefined,
            sort: searchParams.get('sort') || 'newest',
            status: searchParams.get('status') || 'all',
            category_id: searchParams.get('category_id') || undefined,
            brand_id: searchParams.get('brand_id') || undefined,
        }

        const validationResult = adminProductListSchema.safeParse(params)
        if (!validationResult.success) {
            return validationErrorResponse(validationResult.error)
        }

        const { page, limit, search, sort, status, category_id, brand_id } =
            validationResult.data

        // Use admin client to bypass RLS (see all products including inactive)
        const adminSupabase = createAdminClient()

        // Build query
        let query = adminSupabase
            .from('products')
            .select(
                `
        id, name, slug, price, original_price, discount_percentage,
        thumbnail, images, stock_quantity, sku,
        is_active, is_featured, rating_average, rating_count,
        sales_count, badges, created_at, updated_at,
        brand:brands(id, name),
        category:categories(id, name)
      `,
                { count: 'exact' }
            )

        // Apply status filter
        if (status === 'active') {
            query = query.eq('is_active', true)
        } else if (status === 'inactive') {
            query = query.eq('is_active', false)
        }

        // Apply search
        if (search) {
            query = query.ilike('name', `%${search}%`)
        }

        // Apply category filter
        if (category_id) {
            query = query.eq('category_id', category_id)
        }

        // Apply brand filter
        if (brand_id) {
            query = query.eq('brand_id', brand_id)
        }

        // Apply sorting
        switch (sort) {
            case 'oldest':
                query = query.order('created_at', { ascending: true })
                break
            case 'name_asc':
                query = query.order('name', { ascending: true })
                break
            case 'name_desc':
                query = query.order('name', { ascending: false })
                break
            case 'price_asc':
                query = query.order('price', { ascending: true })
                break
            case 'price_desc':
                query = query.order('price', { ascending: false })
                break
            case 'stock_asc':
                query = query.order('stock_quantity', { ascending: true })
                break
            case 'stock_desc':
                query = query.order('stock_quantity', { ascending: false })
                break
            case 'newest':
            default:
                query = query.order('created_at', { ascending: false })
                break
        }

        // Apply pagination
        const from = (page - 1) * limit
        const to = from + limit - 1
        query = query.range(from, to)

        const { data: products, error, count } = await query

        if (error) {
            console.error('Error fetching admin products:', error)
            return errorResponse('Failed to fetch products', 500)
        }

        const pagination = calculatePagination(page, limit, count || 0)

        return successResponse({
            products: products || [],
            pagination,
        })
    } catch (error) {
        console.error('Admin products list error:', error)
        return errorResponse('Failed to fetch products', 500)
    }
}

/**
 * POST /api/admin/products - Create a new product
 */
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Check admin access
        const admin = await requireAdmin(supabase)
        if (!admin) {
            return forbiddenResponse('Admin access required')
        }

        // Parse and validate body
        const body = await request.json()
        const validationResult = createProductSchema.safeParse(body)

        if (!validationResult.success) {
            return validationErrorResponse(validationResult.error)
        }

        const data = validationResult.data

        // Auto-generate slug if not provided
        if (!data.slug) {
            data.slug = generateSlug(data.name) + '-' + Date.now().toString(36)
        }

        // Use admin client to bypass RLS
        const adminSupabase = createAdminClient()

        // Check slug uniqueness
        const { data: existingProduct } = await adminSupabase
            .from('products')
            .select('id')
            .eq('slug', data.slug)
            .single()

        if (existingProduct) {
            return errorResponse('A product with this slug already exists', 400)
        }

        // Insert product
        const { data: newProduct, error } = await adminSupabase
            .from('products')
            .insert(data)
            .select(
                `
        id, name, slug, price, original_price, discount_percentage,
        thumbnail, images, stock_quantity, sku,
        is_active, is_featured, badges, created_at,
        brand:brands(id, name),
        category:categories(id, name)
      `
            )
            .single()

        if (error) {
            console.error('Error creating product:', error)
            if (error.code === '23505') {
                return errorResponse(
                    'A product with this slug or SKU already exists',
                    400
                )
            }
            return errorResponse('Failed to create product', 500)
        }

        return successResponse(newProduct, 'Product created successfully')
    } catch (error) {
        console.error('Admin create product error:', error)
        return errorResponse('Failed to create product', 500)
    }
}
