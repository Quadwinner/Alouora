/**
 * Products API
 *
 * GET /api/products - List products with filters, search, and pagination
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  successResponse,
  errorResponse,
} from '@/lib/api/response';
import type { ProductListItem, ProductFilters, ProductSortOption } from '@/types/product';

// Parse query parameters into ProductFilters
function parseFilters(searchParams: URLSearchParams): ProductFilters {
  const category = searchParams.get('category') || undefined;
  const brand = searchParams.getAll('brand').length > 0 
    ? searchParams.getAll('brand') 
    : searchParams.get('brand') || undefined;
  const minPrice = searchParams.get('minPrice') 
    ? parseFloat(searchParams.get('minPrice')!) 
    : undefined;
  const maxPrice = searchParams.get('maxPrice') 
    ? parseFloat(searchParams.get('maxPrice')!) 
    : undefined;
  const color = searchParams.getAll('color').length > 0 
    ? searchParams.getAll('color') 
    : searchParams.get('color') || undefined;
  const rating = searchParams.get('rating') 
    ? parseInt(searchParams.get('rating')!) 
    : undefined;
  const format = searchParams.get('format') || undefined;
  const search = searchParams.get('search') || searchParams.get('q') || undefined;
  const sort = (searchParams.get('sort') as ProductSortOption) || 'popularity';
  const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1;
  const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20;
  const featured = searchParams.get('featured') === 'true';

  return {
    category,
    brand,
    minPrice,
    maxPrice,
    color,
    rating,
    format,
    search,
    sort,
    page: Math.max(1, page),
    limit: Math.min(100, Math.max(1, limit)),
    featured,
  };
}

// Apply sorting to query
function applySorting(query: any, sort: ProductSortOption): any {
  switch (sort) {
    case 'newest':
      return query.order('created_at', { ascending: false });
    case 'price_low_to_high':
      return query.order('price', { ascending: true });
    case 'price_high_to_low':
      return query.order('price', { ascending: false });
    case 'rating':
      return query.order('rating_average', { ascending: false });
    case 'discount':
      return query.order('discount_percentage', { ascending: false, nullsFirst: false });
    case 'popularity':
    default:
      return query.order('sales_count', { ascending: false });
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const filters = parseFilters(request.nextUrl.searchParams);

    // Build query
    let query = supabase
      .from('products')
      .select(`
        id,
        name,
        slug,
        price,
        original_price,
        discount_percentage,
        thumbnail,
        images,
        rating_average,
        rating_count,
        badges,
        is_featured,
        stock_quantity,
        brand:brands(id, name, slug),
        category:categories(id, name, slug)
      `, { count: 'exact' })
      .eq('is_active', true);

    // Apply category filter
    if (filters.category) {
      // First, get the category by slug
      const { data: categoryData } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', filters.category)
        .single();

      if (categoryData) {
        query = query.eq('category_id', categoryData.id);
      }
    }

    // Apply brand filter
    if (filters.brand) {
      const brandSlugs = Array.isArray(filters.brand) ? filters.brand : [filters.brand];
      const { data: brandData } = await supabase
        .from('brands')
        .select('id')
        .in('slug', brandSlugs);

      if (brandData && brandData.length > 0) {
        const brandIds = brandData.map(b => b.id);
        query = query.in('brand_id', brandIds);
      }
    }

    // Apply price range filter
    if (filters.minPrice !== undefined) {
      query = query.gte('price', filters.minPrice);
    }
    if (filters.maxPrice !== undefined) {
      query = query.lte('price', filters.maxPrice);
    }

    // Apply rating filter
    if (filters.rating !== undefined) {
      query = query.gte('rating_average', filters.rating);
    }

    // Apply featured filter
    if (filters.featured) {
      query = query.eq('is_featured', true);
    }

    // Apply search filter (full-text search)
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    // Apply sorting
    query = applySorting(query, filters.sort || 'popularity');

    // Apply pagination
    const from = (filters.page! - 1) * filters.limit!;
    const to = from + filters.limit! - 1;
    query = query.range(from, to);

    // Execute query
    const { data: products, error, count } = await query;

    if (error) {
      console.error('Products query error:', error);
      return errorResponse('Failed to fetch products', 500);
    }

    // Transform products to match ProductListItem type
    const transformedProducts: ProductListItem[] = (products || []).map((product: any) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      original_price: product.original_price,
      discount_percentage: product.discount_percentage,
      thumbnail: product.thumbnail || (product.images && product.images[0]) || null,
      images: product.images,
      rating_average: product.rating_average,
      rating_count: product.rating_count,
      badges: product.badges,
      is_featured: product.is_featured,
      stock_quantity: product.stock_quantity,
      brand: product.brand,
      category: product.category,
    }));

    const total = count || 0;
    const totalPages = Math.ceil(total / filters.limit!);

    return successResponse({
      products: transformedProducts,
      pagination: {
        page: filters.page!,
        limit: filters.limit!,
        total,
        totalPages,
        hasMore: filters.page! < totalPages,
      },
    });
  } catch (error) {
    console.error('Products API error:', error);
    return errorResponse('Internal server error', 500);
  }
}
