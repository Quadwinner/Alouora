/**
 * Brands API
 *
 * GET /api/brands - List all active brands
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  successResponse,
  errorResponse,
} from '@/lib/api/response';
import type { Brand } from '@/types/product';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    
    // Optional query parameters
    const includeProducts = searchParams.get('includeProducts') === 'true';
    const sort = searchParams.get('sort') || 'display_order'; // display_order, name, product_count

    // Build query
    let query = supabase
      .from('brands')
      .select(`
        id,
        name,
        slug,
        description,
        logo_url,
        website_url,
        is_active,
        display_order,
        meta_title,
        meta_description,
        created_at,
        updated_at
      `)
      .eq('is_active', true);

    // Apply sorting
    switch (sort) {
      case 'name':
        query = query.order('name', { ascending: true });
        break;
      case 'product_count':
        // Will sort after fetching product counts
        query = query.order('display_order', { ascending: true });
        break;
      case 'display_order':
      default:
        query = query.order('display_order', { ascending: true });
        break;
    }

    const { data: brands, error } = await query;

    if (error) {
      console.error('Brands query error:', error);
      return errorResponse('Failed to fetch brands', 500);
    }

    // If includeProducts, get product counts for each brand
    let brandsWithCounts: (Brand & { product_count?: number })[] = brands || [];
    
    if (includeProducts && brands && brands.length > 0) {
      const brandIds = brands.map(b => b.id);
      
      // Get product counts per brand
      const { data: productCounts } = await supabase
        .from('products')
        .select('brand_id')
        .eq('is_active', true)
        .in('brand_id', brandIds);

      const countMap = new Map<string, number>();
      productCounts?.forEach(p => {
        if (p.brand_id) {
          const current = countMap.get(p.brand_id) || 0;
          countMap.set(p.brand_id, current + 1);
        }
      });

      brandsWithCounts = brands.map(brand => ({
        ...brand,
        product_count: countMap.get(brand.id) || 0,
      }));

      // Sort by product count if requested
      if (sort === 'product_count') {
        brandsWithCounts.sort((a, b) => (b.product_count || 0) - (a.product_count || 0));
      }
    }

    return successResponse(brandsWithCounts);
  } catch (error) {
    console.error('Brands API error:', error);
    return errorResponse('Internal server error', 500);
  }
}
