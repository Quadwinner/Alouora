/**
 * Product Detail API
 *
 * GET /api/products/[id] - Get single product with full details
 */

import type { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  successResponse,
  errorResponse,
  notFoundResponse,
} from '@/lib/api/response';
import type { ProductDetail } from '@/types/product';

// Helper to check if string is UUID
function isUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

// Calculate rating distribution from reviews
async function calculateRatingDistribution(
  supabase: any,
  productId: string
): Promise<{ 1: number; 2: number; 3: number; 4: number; 5: number }> {
  const { data: reviews } = await supabase
    .from('reviews')
    .select('rating')
    .eq('product_id', productId)
    .eq('is_approved', true);

  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  if (reviews) {
    reviews.forEach((review: { rating: number }) => {
      const rating = Math.floor(review.rating) as 1 | 2 | 3 | 4 | 5;
      if (rating >= 1 && rating <= 5) {
        distribution[rating]++;
      }
    });
  }

  return distribution;
}

// Fetch related products
async function fetchRelatedProducts(
  supabase: any,
  productId: string,
  categoryId: string | null,
  brandId: string | null,
  limit: number = 6
): Promise<any[]> {
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
      badges
    `)
    .eq('is_active', true)
    .neq('id', productId)
    .limit(limit);

  // Prioritize same category, then same brand
  if (categoryId) {
    query = query.eq('category_id', categoryId);
  } else if (brandId) {
    query = query.eq('brand_id', brandId);
  }

  // Order by popularity
  query = query.order('sales_count', { ascending: false });

  const { data: relatedProducts } = await query;

  return (relatedProducts || []).map((product: any) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    original_price: product.original_price,
    discount_percentage: product.discount_percentage,
    rating_average: product.rating_average || 0,
    rating_count: product.rating_count || 0,
    thumbnail: product.thumbnail || (product.images && product.images[0]) || null,
    badges: product.badges,
  }));
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Validate ID format (can be UUID or slug)
    if (!id) {
      return errorResponse('Product ID is required', 400);
    }

    // Build product query - support both UUID and slug
    let productQuery = supabase
      .from('products')
      .select(`
        id,
        name,
        slug,
        brand_id,
        category_id,
        description,
        ingredients,
        how_to_use,
        price,
        original_price,
        discount_percentage,
        images,
        thumbnail,
        stock_quantity,
        sku,
        is_active,
        is_featured,
        rating_average,
        rating_count,
        sales_count,
        view_count,
        badges,
        meta_title,
        meta_description,
        created_at,
        updated_at,
        brand:brands(
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
        ),
        category:categories(
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
        )
      `)
      .eq('is_active', true);

    // Try UUID first, then slug
    if (isUUID(id)) {
      productQuery = productQuery.eq('id', id);
    } else {
      productQuery = productQuery.eq('slug', id);
    }

    const { data: productData, error: productError } = await productQuery.single();

    if (productError || !productData) {
      return notFoundResponse('Product not found');
    }

    // Fetch product variants
    const { data: variants } = await supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', productData.id)
      .eq('is_active', true)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: true });

    // Calculate rating distribution
    const ratingDistribution = await calculateRatingDistribution(supabase, productData.id);

    // Fetch related products
    const relatedProducts = await fetchRelatedProducts(
      supabase,
      productData.id,
      productData.category_id,
      productData.brand_id,
      6
    );

    // Transform brand and category (handle array responses)
    const brand = Array.isArray(productData.brand) ? productData.brand[0] : productData.brand;
    const category = Array.isArray(productData.category) ? productData.category[0] : productData.category;

    // Build ProductDetail response
    const productDetail: ProductDetail = {
      id: productData.id,
      name: productData.name,
      slug: productData.slug,
      brand_id: productData.brand_id,
      category_id: productData.category_id,
      description: productData.description,
      ingredients: productData.ingredients,
      how_to_use: productData.how_to_use,
      price: productData.price,
      original_price: productData.original_price,
      discount_percentage: productData.discount_percentage,
      images: productData.images,
      thumbnail: productData.thumbnail,
      stock_quantity: productData.stock_quantity,
      sku: productData.sku,
      is_active: productData.is_active,
      is_featured: productData.is_featured,
      rating_average: productData.rating_average || 0,
      rating_count: productData.rating_count || 0,
      sales_count: productData.sales_count || 0,
      view_count: productData.view_count || 0,
      badges: productData.badges,
      meta_title: productData.meta_title,
      meta_description: productData.meta_description,
      created_at: productData.created_at,
      updated_at: productData.updated_at,
      brand: brand || null,
      category: category || null,
      variants: variants || [],
      related_products: relatedProducts,
      rating_distribution: ratingDistribution,
    };

    // Increment view count (non-blocking)
    Promise.resolve(
      supabase
        .from('products')
        .update({ view_count: (productData.view_count || 0) + 1 })
        .eq('id', productData.id)
    ).catch((err: any) => {
      console.error('Error updating view count:', err);
    });

    return successResponse(productDetail);
  } catch (error) {
    console.error('Product detail API error:', error);
    return errorResponse('Internal server error', 500);
  }
}
