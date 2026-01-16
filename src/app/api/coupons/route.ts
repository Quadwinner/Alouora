/**
 * Coupons API
 *
 * GET /api/coupons - List available coupons
 */

import { createClient } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api/response';
import { couponListQuerySchema } from '@/lib/api/schemas/coupon';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;

    // Parse and validate query parameters
    const query = couponListQuerySchema.parse({
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
      is_active: searchParams.get('is_active') || undefined,
      applicable_to: searchParams.get('applicable_to') || undefined,
      min_order_amount: searchParams.get('min_order_amount') || undefined,
    });

    // Build query
    let couponQuery = supabase
      .from('coupons')
      .select('*', { count: 'exact' })
      .eq('is_active', true)
      .gte('valid_until', new Date().toISOString())
      .lte('valid_from', new Date().toISOString());

    // Apply filters
    if (query.is_active !== undefined) {
      couponQuery = couponQuery.eq('is_active', query.is_active);
    }

    if (query.applicable_to) {
      couponQuery = couponQuery.eq('applicable_to', query.applicable_to);
    }

    if (query.min_order_amount !== undefined) {
      couponQuery = couponQuery.lte('min_order_amount', query.min_order_amount);
    }

    // Apply pagination
    const from = (query.page - 1) * query.limit;
    const to = from + query.limit - 1;
    couponQuery = couponQuery.range(from, to);

    // Order by validity (soonest to expire first)
    couponQuery = couponQuery.order('valid_until', { ascending: true });

    // Execute query
    const { data: coupons, error, count } = await couponQuery;

    if (error) {
      console.error('Coupons query error:', error);
      return errorResponse('Failed to fetch coupons', 500);
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / query.limit);

    return successResponse({
      coupons: coupons || [],
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages,
        hasMore: query.page < totalPages,
      },
    });
  } catch (error) {
    console.error('Coupons API error:', error);
    return errorResponse('Internal server error', 500);
  }
}
