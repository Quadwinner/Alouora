/**
 * Admin Image Upload API
 *
 * POST /api/admin/upload - Upload image to Supabase Storage
 */

import { NextRequest } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/api/admin'
import {
    successResponse,
    errorResponse,
    forbiddenResponse,
} from '@/lib/api/response'

/**
 * POST /api/admin/upload - Upload image
 */
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Check admin access
        const admin = await requireAdmin(supabase)
        if (!admin) {
            return forbiddenResponse('Admin access required')
        }

        // Parse multipart form data
        const formData = await request.formData()
        const file = formData.get('file') as File | null
        const folder = (formData.get('folder') as string) || 'products'

        if (!file) {
            return errorResponse('No file provided', 400)
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
        if (!allowedTypes.includes(file.type)) {
            return errorResponse(
                'Invalid file type. Allowed: JPEG, PNG, WebP, GIF',
                400
            )
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024
        if (file.size > maxSize) {
            return errorResponse('File size must be less than 5MB', 400)
        }

        // Generate unique file name
        const ext = file.name.split('.').pop() || 'jpg'
        const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`

        // Upload to Supabase Storage using admin client
        const adminSupabase = createAdminClient()
        const buffer = Buffer.from(await file.arrayBuffer())

        const { data: uploadData, error: uploadError } = await adminSupabase.storage
            .from('product-images')
            .upload(fileName, buffer, {
                contentType: file.type,
                cacheControl: '3600',
                upsert: false,
            })

        if (uploadError) {
            console.error('Upload error:', uploadError)
            return errorResponse(
                uploadError.message || 'Failed to upload image',
                500
            )
        }

        // Get public URL
        const {
            data: { publicUrl },
        } = adminSupabase.storage.from('product-images').getPublicUrl(uploadData.path)

        return successResponse(
            {
                url: publicUrl,
                path: uploadData.path,
                fileName: file.name,
                size: file.size,
                type: file.type,
            },
            'Image uploaded successfully'
        )
    } catch (error) {
        console.error('Admin upload error:', error)
        return errorResponse('Failed to upload image', 500)
    }
}
