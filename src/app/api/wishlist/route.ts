/**
 * Wishlist API
 *
 * GET /api/wishlist - Get user's wishlist
 * POST /api/wishlist - Add item to wishlist
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  unauthorizedResponse,
} from '@/lib/api/response';
import { addToWishlistSchema } from '@/lib/api/schemas/wishlist';

/**
 * GET /api/wishlist - Get user's wishlist with product details
 */
export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return unauthorizedResponse('Please sign in to view your wishlist');
    }

    // Fetch wishlist items with product details
    const { data: wishlistItems, error: wishlistError } = await supabase
      .from('wishlist')
      .select(`
        id,
        product_id,
        variant_id,
        added_at,
        product:products(
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
          stock_quantity,
          is_active,
          is_featured,
          badges,
          brand:brands(id, name, slug),
          category:categories(id, name, slug)
        ),
        variant:product_variants(
          id,
          name,
          color,
          size,
          price_adjustment,
          stock_quantity,
          sku,
          is_active
        )
      `)
      .eq('user_id', user.id)
      .order('added_at', { ascending: false });

    if (wishlistError) {
      console.error('Error fetching wishlist:', wishlistError);
      return errorResponse('Failed to load wishlist', 500);
    }

    // Transform wishlist items
    const formattedItems = (wishlistItems || []).map((item: any) => {
      const product = Array.isArray(item.product) ? item.product[0] : item.product;
      const variant = Array.isArray(item.variant) ? item.variant[0] : item.variant;
      const brand = product?.brand ? (Array.isArray(product.brand) ? product.brand[0] : product.brand) : null;
      const category = product?.category ? (Array.isArray(product.category) ? product.category[0] : product.category) : null;

      return {
        id: item.id,
        product_id: item.product_id,
        variant_id: item.variant_id,
        added_at: item.added_at,
        product: product ? {
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
          stock_quantity: product.stock_quantity,
          is_active: product.is_active,
          is_featured: product.is_featured,
          badges: product.badges,
          brand: brand || null,
          category: category || null,
        } : null,
        variant: variant || null,
        is_available: product?.is_active && (variant ? variant.is_active : true) && (product.stock_quantity > 0 || (variant && variant.stock_quantity > 0)),
      };
    });

    return successResponse({
      items: formattedItems,
      total: formattedItems.length,
    });
  } catch (error) {
    console.error('Wishlist API error:', error);
    return errorResponse('Internal server error', 500);
  }
}

/**
 * POST /api/wishlist - Add item to wishlist
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return unauthorizedResponse('Please sign in to add items to wishlist');
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = addToWishlistSchema.safeParse(body);

    if (!validationResult.success) {
      return validationErrorResponse(validationResult.error);
    }

    const { product_id, variant_id } = validationResult.data;

    // Check if product exists and is active
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, name, is_active')
      .eq('id', product_id)
      .single();

    if (productError || !product) {
      return errorResponse('Product not found', 404);
    }

    if (!product.is_active) {
      return errorResponse('Product is not available', 400);
    }

    // If variant_id provided, validate it exists and belongs to product
    if (variant_id) {
      const { data: variant, error: variantError } = await supabase
        .from('product_variants')
        .select('id, product_id, is_active')
        .eq('id', variant_id)
        .single();

      if (variantError || !variant) {
        return errorResponse('Product variant not found', 404);
      }

      if (variant.product_id !== product_id) {
        return errorResponse('Variant does not belong to this product', 400);
      }

      if (!variant.is_active) {
        return errorResponse('Product variant is not available', 400);
      }
    }

    // Check if item already exists in wishlist (UNIQUE constraint will handle this, but we check first for better error message)
    const { data: existingItem } = await supabase
      .from('wishlist')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', product_id)
      .eq('variant_id', variant_id || null)
      .single();

    if (existingItem) {
      return errorResponse('Item is already in your wishlist', 409);
    }

    // Add to wishlist
    const { data: wishlistItem, error: insertError } = await supabase
      .from('wishlist')
      .insert({
        user_id: user.id,
        product_id,
        variant_id: variant_id || null,
      })
      .select()
      .single();

    if (insertError) {
      // Handle unique constraint violation
      if (insertError.code === '23505') {
        return errorResponse('Item is already in your wishlist', 409);
      }
      console.error('Error adding to wishlist:', insertError);
      return errorResponse('Failed to add item to wishlist', 500);
    }

    return successResponse(
      {
        id: wishlistItem.id,
        product_id: wishlistItem.product_id,
        variant_id: wishlistItem.variant_id,
        added_at: wishlistItem.added_at,
      },
      'Item added to wishlist'
    );
  } catch (error) {
    console.error('Wishlist API error:', error);
    return errorResponse('Internal server error', 500);
  }
}
