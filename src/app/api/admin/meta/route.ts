/**
 * Admin Categories & Brands API
 *
 * GET /api/admin/categories - List all categories
 * GET /api/admin/brands - not here, see separate file
 *
 * Also used by the add/edit product forms for dropdowns
 */

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/api/admin'
import { successResponse, errorResponse, forbiddenResponse } from '@/lib/api/response'

/**
 * GET /api/admin/categories - List all categories for dropdowns
 */
export async function GET() {
    try {
        const supabase = await createClient()
        const admin = await requireAdmin(supabase)
        if (!admin) return forbiddenResponse('Admin access required')

        const adminSupabase = createAdminClient()

        const { data: categories, error } = await adminSupabase
            .from('categories')
            .select('id, name, slug, is_active, parent_id')
            .order('display_order', { ascending: true })
            .order('name', { ascending: true })

        if (error) {
            console.error('Error fetching categories:', error)
            return errorResponse('Failed to fetch categories', 500)
        }

        const { data: brands, error: brandsError } = await adminSupabase
            .from('brands')
            .select('id, name, slug, is_active')
            .order('display_order', { ascending: true })
            .order('name', { ascending: true })

        if (brandsError) {
            console.error('Error fetching brands:', brandsError)
            return errorResponse('Failed to fetch brands', 500)
        }

        return successResponse({ categories: categories || [], brands: brands || [] })
    } catch (error) {
        console.error('Admin meta error:', error)
        return errorResponse('Failed to fetch data', 500)
    }
}
