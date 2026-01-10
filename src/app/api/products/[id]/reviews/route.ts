import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const rating = searchParams.get('rating');
    const withImages = searchParams.get('withImages') === 'true';
    const sort = searchParams.get('sort') || 'newest'; // newest, helpful, rating_high, rating_low

    // Build query
    let query = supabase
      .from('reviews')
      .select(`
        *,
        user:users(id, full_name, avatar_url)
      `, { count: 'exact' })
      .eq('product_id', id)
      .eq('is_approved', true);

    // Apply filters
    if (rating) {
      query = query.eq('rating', parseInt(rating));
    }

    if (withImages) {
      query = query.not('images', 'is', null);
    }

    // Apply sorting
    switch (sort) {
      case 'helpful':
        query = query.order('is_helpful', { ascending: false });
        break;
      case 'rating_high':
        query = query.order('rating', { ascending: false });
        break;
      case 'rating_low':
        query = query.order('rating', { ascending: true });
        break;
      case 'newest':
      default:
        query = query.order('created_at', { ascending: false });
        break;
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: reviews, error, count } = await query;

    if (error) {
      console.error('Error fetching reviews:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch reviews' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: reviews || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
        hasMore: (count || 0) > page * limit,
      },
    });
  } catch (error) {
    console.error('Error in reviews API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: productId } = await params;
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { rating, title, comment, images, order_id } = body;

    // Validate required fields
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: 'Invalid rating' },
        { status: 400 }
      );
    }

    // Check if product exists
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id')
      .eq('id', productId)
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if user already reviewed this product
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('product_id', productId)
      .eq('user_id', user.id)
      .single();

    if (existingReview) {
      return NextResponse.json(
        { success: false, error: 'You have already reviewed this product' },
        { status: 400 }
      );
    }

    // Determine if it's a verified purchase
    let isVerifiedPurchase = false;
    if (order_id) {
      const { data: order } = await supabase
        .from('order_items')
        .select('id')
        .eq('order_id', order_id)
        .eq('product_id', productId)
        .single();
      
      isVerifiedPurchase = !!order;
    }

    // Create review
    const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .insert({
        product_id: productId,
        user_id: user.id,
        order_id: order_id || null,
        rating,
        title: title || null,
        comment: comment || null,
        images: images || null,
        is_verified_purchase: isVerifiedPurchase,
        is_approved: false, // Reviews need approval
        is_helpful: 0,
      })
      .select()
      .single();

    if (reviewError) {
      console.error('Error creating review:', reviewError);
      return NextResponse.json(
        { success: false, error: 'Failed to create review' },
        { status: 500 }
      );
    }

    // Update product rating statistics
    const { data: stats } = await supabase
      .from('reviews')
      .select('rating')
      .eq('product_id', productId)
      .eq('is_approved', true);

    if (stats && stats.length > 0) {
      const totalRating = stats.reduce((sum, r) => sum + r.rating, 0);
      const avgRating = totalRating / stats.length;

      await supabase
        .from('products')
        .update({
          rating_average: avgRating,
          rating_count: stats.length,
        })
        .eq('id', productId);
    }

    return NextResponse.json({
      success: true,
      data: review,
      message: 'Review submitted successfully and is pending approval',
    });
  } catch (error) {
    console.error('Error in create review API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
