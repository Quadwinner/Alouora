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
  validationErrorResponse,
} from '@/lib/api/response';
import { productListQuerySchema } from '@/lib/api/schemas/product';
import { paginateQuery, applyRangeFilter } from '@/lib/db/queries';
import type { ProductListItem, ProductSortOption, AvailableFilters } from '@/types/product';

// Helper to check if string is UUID
function isUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
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

// Calculate available filters for aggregation
async function calculateAvailableFilters(
  supabase: any,
  baseQuery: any
): Promise<AvailableFilters> {
  // Get all active products matching current filters (for aggregation)
  const { data: allProducts } = await baseQuery.select('id, category_id, brand_id, price, rating_average');

  // Get unique category IDs
  const categoryIds = [...new Set(allProducts?.map((p: any) => p.category_id).filter(Boolean) || [])];
  // Get unique brand IDs
  const brandIds = [...new Set(allProducts?.map((p: any) => p.brand_id).filter(Boolean) || [])];

  // Fetch categories with counts
  let categories: AvailableFilters['categories'] = [];
  if (categoryIds.length > 0) {
    const { data: categoryData } = await supabase
      .from('categories')
      .select('id, name, slug')
      .in('id', categoryIds)
      .eq('is_active', true);

    if (categoryData) {
      const categoryCounts = new Map<string, number>();
      allProducts?.forEach((p: any) => {
        if (p.category_id) {
          categoryCounts.set(p.category_id, (categoryCounts.get(p.category_id) || 0) + 1);
        }
      });

      categories = categoryData.map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        count: categoryCounts.get(cat.id) || 0,
      }));
    }
  }

  // Fetch brands with counts
  let brands: AvailableFilters['brands'] = [];
  if (brandIds.length > 0) {
    const { data: brandData } = await supabase
      .from('brands')
      .select('id, name, slug')
      .in('id', brandIds)
      .eq('is_active', true);

    if (brandData) {
      const brandCounts = new Map<string, number>();
      allProducts?.forEach((p: any) => {
        if (p.brand_id) {
          brandCounts.set(p.brand_id, (brandCounts.get(p.brand_id) || 0) + 1);
        }
      });

      brands = brandData.map((b: any) => ({
        id: b.id,
        name: b.name,
        slug: b.slug,
        count: brandCounts.get(b.id) || 0,
      }));
    }
  }

  // Calculate price range
  const prices = allProducts?.map((p: any) => p.price).filter((p: number) => p != null) || [];
  const priceRange = {
    min: prices.length > 0 ? Math.min(...prices) : 0,
    max: prices.length > 0 ? Math.max(...prices) : 0,
  };

  // Calculate rating distribution
  const ratingCounts = new Map<number, number>();
  allProducts?.forEach((p: any) => {
    if (p.rating_average) {
      const rating = Math.floor(p.rating_average);
      ratingCounts.set(rating, (ratingCounts.get(rating) || 0) + 1);
    }
  });

  const ratings: AvailableFilters['ratings'] = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: ratingCounts.get(rating) || 0,
  }));

  // Colors - placeholder (would need variant data)
  const colors: AvailableFilters['colors'] = [];

  return {
    categories,
    brands,
    colors,
    priceRange,
    ratings,
  };
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;

    // Prepare query params for Zod validation
    const queryParams: Record<string, any> = {};
    searchParams.forEach((value, key) => {
      if (key === 'brand' || key === 'colors') {
        // Handle array params
        if (!queryParams[key]) {
          queryParams[key] = [];
        }
        queryParams[key].push(value);
      } else {
        queryParams[key] = value;
      }
    });

    // Validate query parameters with Zod
    const validationResult = productListQuerySchema.safeParse(queryParams);

    if (!validationResult.success) {
      return validationErrorResponse(validationResult.error);
    }

    const filters = validationResult.data;
    const searchTerm = filters.search || filters.q;

    // Build base query for products
    let baseQuery = supabase
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
        category_id,
        brand_id,
        brand:brands(id, name, slug),
        category:categories(id, name, slug)
      `, { count: 'exact' })
      .eq('is_active', true);

    // Apply category filter (support both UUID and slug)
    if (filters.category) {
      if (isUUID(filters.category)) {
        baseQuery = baseQuery.eq('category_id', filters.category);
      } else {
        // It's a slug, get category ID first
        const { data: categoryData } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', filters.category)
          .eq('is_active', true)
          .single();

        if (categoryData) {
          baseQuery = baseQuery.eq('category_id', categoryData.id);
        } else {
          // Category not found, return empty results
          return successResponse({
            products: [],
            pagination: {
              page: filters.page,
              limit: filters.limit,
              total: 0,
              totalPages: 0,
              hasMore: false,
            },
            filters: {
              categories: [],
              brands: [],
              colors: [],
              priceRange: { min: 0, max: 0 },
              ratings: [],
            },
          });
        }
      }
    }

    // Apply brand filter (support both UUID and slug)
    if (filters.brand) {
      const brandValues = Array.isArray(filters.brand) ? filters.brand : [filters.brand];
      const brandIds: string[] = [];
      const brandSlugs: string[] = [];

      brandValues.forEach((brand) => {
        if (isUUID(brand)) {
          brandIds.push(brand);
        } else {
          brandSlugs.push(brand);
        }
      });

      // Fetch brand IDs for slugs
      if (brandSlugs.length > 0) {
        const { data: brandData } = await supabase
          .from('brands')
          .select('id')
          .in('slug', brandSlugs)
          .eq('is_active', true);

        if (brandData) {
          brandIds.push(...brandData.map((b) => b.id));
        }
      }

      if (brandIds.length > 0) {
        baseQuery = baseQuery.in('brand_id', brandIds);
      } else if (brandSlugs.length > 0) {
        // No brands found, return empty results
        return successResponse({
          products: [],
          pagination: {
            page: filters.page,
            limit: filters.limit,
            total: 0,
            totalPages: 0,
            hasMore: false,
          },
          filters: {
            categories: [],
            brands: [],
            colors: [],
            priceRange: { min: 0, max: 0 },
            ratings: [],
          },
        });
      }
    }

    // Apply price range filter
    baseQuery = applyRangeFilter(baseQuery, 'price', filters.minPrice, filters.maxPrice);

    // Apply rating filter
    if (filters.rating !== undefined) {
      baseQuery = baseQuery.gte('rating_average', filters.rating);
    }

    // Apply featured filter
    if (filters.featured) {
      baseQuery = baseQuery.eq('is_featured', true);
    }

    // Apply in-stock filter
    if (filters.inStock) {
      baseQuery = baseQuery.gt('stock_quantity', 0);
    }

    // Apply search filter (Enhanced full-text search)
    if (searchTerm) {
      const sanitizedTerm = searchTerm.trim();
      
      // Search in product name, description, and SKU
      baseQuery = baseQuery.or(
        `name.ilike.%${sanitizedTerm}%,description.ilike.%${sanitizedTerm}%,sku.ilike.%${sanitizedTerm}%`
      );
    }

    // Calculate available filters (before pagination)
    const availableFilters = await calculateAvailableFilters(supabase, baseQuery);

    // Apply sorting
    baseQuery = applySorting(baseQuery, filters.sort || 'popularity');

    // Apply pagination
    const paginatedQuery = paginateQuery(baseQuery, filters.page, filters.limit);

    // Execute query
    const { data: products, error, count } = await paginatedQuery;

    if (error) {
      console.error('Products query error:', error);
      return errorResponse('Failed to fetch products', 500);
    }

    // Transform products to match ProductListItem type
    const transformedProducts: ProductListItem[] = (products || []).map((product: any) => {
      const brand = Array.isArray(product.brand) ? product.brand[0] : product.brand;
      const category = Array.isArray(product.category) ? product.category[0] : product.category;

      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        original_price: product.original_price,
        discount_percentage: product.discount_percentage,
        thumbnail: product.thumbnail || (product.images && product.images[0]) || null,
        images: product.images,
        rating_average: product.rating_average || 0,
        rating_count: product.rating_count || 0,
        badges: product.badges,
        is_featured: product.is_featured,
        stock_quantity: product.stock_quantity,
        brand: brand || null,
        category: category || null,
      };
    });

    const total = count || 0;
    const totalPages = Math.ceil(total / filters.limit);

    return successResponse({
      products: transformedProducts,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages,
        hasMore: filters.page < totalPages,
      },
      filters: availableFilters,
    });
  } catch (error) {
    console.error('Products API error:', error);
    return errorResponse('Internal server error', 500);
  }
}
