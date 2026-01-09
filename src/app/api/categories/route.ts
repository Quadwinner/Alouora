/**
 * Categories API
 *
 * GET /api/categories - List all active categories
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  successResponse,
  errorResponse,
} from '@/lib/api/response';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    
    // Optional parent slug filter
    const parentSlug = searchParams.get('parent') || undefined;
    const includeProducts = searchParams.get('includeProducts') === 'true';

    // Build query
    let query = supabase
      .from('categories')
      .select(`
        id,
        name,
        slug,
        description,
        image_url,
        parent_id,
        display_order,
        is_active,
        meta_title,
        meta_description,
        created_at,
        updated_at
      `)
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    // Filter by parent
    if (parentSlug === 'root' || parentSlug === 'null') {
      query = query.is('parent_id', null);
    } else if (parentSlug) {
      // Get parent category first
      const { data: parentCategory } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', parentSlug)
        .single();

      if (parentCategory) {
        query = query.eq('parent_id', parentCategory.id);
      }
    }

    const { data: categories, error } = await query;

    if (error) {
      console.error('Categories query error:', error);
      return errorResponse('Failed to fetch categories', 500);
    }

    // If includeProducts, get product counts for each category
    let categoriesWithCounts = categories || [];
    
    if (includeProducts && categories && categories.length > 0) {
      const categoryIds = categories.map(c => c.id);
      
      // Get product counts per category
      const { data: productCounts } = await supabase
        .from('products')
        .select('category_id')
        .eq('is_active', true)
        .in('category_id', categoryIds);

      const countMap = new Map<string, number>();
      productCounts?.forEach(p => {
        const current = countMap.get(p.category_id) || 0;
        countMap.set(p.category_id, current + 1);
      });

      categoriesWithCounts = categories.map(cat => ({
        ...cat,
        product_count: countMap.get(cat.id) || 0,
      }));
    }

    return successResponse(categoriesWithCounts);
  } catch (error) {
    console.error('Categories API error:', error);
    return errorResponse('Internal server error', 500);
  }
}
