/**
 * Admin Single Product API
 *
 * GET    /api/admin/products/:id - Get product details
 * PUT    /api/admin/products/:id - Update product
 * DELETE /api/admin/products/:id - Soft-delete product
 */

import { NextRequest } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/api/admin'
import {
    successResponse,
    errorResponse,
    validationErrorResponse,
    forbiddenResponse,
    notFoundResponse,
} from '@/lib/api/response'
import { updateProductSchema } from '@/lib/api/schemas/admin-product'

interface RouteParams {
    params: Promise<{ id: string }>
}

/**
 * GET /api/admin/products/:id
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const supabase = await createClient()
        const admin = await requireAdmin(supabase)
        if (!admin) return forbiddenResponse('Admin access required')

        const { id } = await params
        const adminSupabase = createAdminClient()

        const { data: product, error } = await adminSupabase
            .from('products')
            .select(
                `
        *,
        brand:brands(id, name, slug),
        category:categories(id, name, slug),
        variants:product_variants(*)
      `
            )
            .eq('id', id)
            .single()

        if (error || !product) {
            return notFoundResponse('Product')
        }

        return successResponse(product)
    } catch (error) {
        console.error('Admin get product error:', error)
        return errorResponse('Failed to fetch product', 500)
    }
}

/**
 * PUT /api/admin/products/:id
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const supabase = await createClient()
        const admin = await requireAdmin(supabase)
        if (!admin) return forbiddenResponse('Admin access required')

        const { id } = await params

        // Parse and validate body
        const body = await request.json()
        const validationResult = updateProductSchema.safeParse(body)

        if (!validationResult.success) {
            return validationErrorResponse(validationResult.error)
        }

        const data = validationResult.data
        const adminSupabase = createAdminClient()

        // Check product exists
        const { data: existing } = await adminSupabase
            .from('products')
            .select('id')
            .eq('id', id)
            .single()

        if (!existing) {
            return notFoundResponse('Product')
        }

        // If slug is being changed, check uniqueness
        if (data.slug) {
            const { data: slugConflict } = await adminSupabase
                .from('products')
                .select('id')
                .eq('slug', data.slug)
                .neq('id', id)
                .single()

            if (slugConflict) {
                return errorResponse('A product with this slug already exists', 400)
            }
        }

        // Update product
        const { data: updatedProduct, error } = await adminSupabase
            .from('products')
            .update(data)
            .eq('id', id)
            .select(
                `
        *,
        brand:brands(id, name),
        category:categories(id, name)
      `
            )
            .single()

        if (error) {
            console.error('Error updating product:', error)
            if (error.code === '23505') {
                return errorResponse('A product with this slug or SKU already exists', 400)
            }
            return errorResponse('Failed to update product', 500)
        }

        return successResponse(updatedProduct, 'Product updated successfully')
    } catch (error) {
        console.error('Admin update product error:', error)
        return errorResponse('Failed to update product', 500)
    }
}

/**
 * DELETE /api/admin/products/:id - Soft delete (set is_active = false)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const supabase = await createClient()
        const admin = await requireAdmin(supabase)
        if (!admin) return forbiddenResponse('Admin access required')

        const { id } = await params
        const adminSupabase = createAdminClient()

        // Check product exists
        const { data: existing } = await adminSupabase
            .from('products')
            .select('id, name')
            .eq('id', id)
            .single()

        if (!existing) {
            return notFoundResponse('Product')
        }

        // Soft delete
        const { error } = await adminSupabase
            .from('products')
            .update({ is_active: false })
            .eq('id', id)

        if (error) {
            console.error('Error deleting product:', error)
            return errorResponse('Failed to delete product', 500)
        }

        return successResponse(
            { id, name: existing.name },
            'Product deleted successfully'
        )
    } catch (error) {
        console.error('Admin delete product error:', error)
        return errorResponse('Failed to delete product', 500)
    }
}
