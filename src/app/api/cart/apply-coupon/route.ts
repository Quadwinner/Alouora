/**
 * Apply Coupon API
 *
 * POST /api/cart/apply-coupon - Apply coupon to cart
 * DELETE /api/cart/apply-coupon - Remove applied coupon
 */

import { createClient } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api/response';
import { applyCouponSchema } from '@/lib/api/schemas/coupon';

// POST - Apply coupon
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return errorResponse('Please sign in to apply coupons', 401);
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = applyCouponSchema.safeParse(body);

    if (!validationResult.success) {
      return errorResponse(
        validationResult.error.issues[0]?.message || 'Invalid coupon code',
        400
      );
    }

    const { coupon_code } = validationResult.data;

    // Fetch coupon
    const { data: coupon, error: couponError } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', coupon_code)
      .eq('is_active', true)
      .single();

    if (couponError || !coupon) {
      return errorResponse('Invalid or expired coupon code', 404);
    }

    // Check validity period
    const now = new Date();
    const validFrom = new Date(coupon.valid_from);
    const validUntil = new Date(coupon.valid_until);

    if (now < validFrom || now > validUntil) {
      return errorResponse('This coupon is not valid at this time', 400);
    }

    // Check usage limits
    if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
      return errorResponse('This coupon has reached its usage limit', 400);
    }

    // Get cart to check minimum order amount
    const { data: cartItems } = await supabase
      .from('cart_items')
      .select(`
        quantity,
        price,
        product:products(price)
      `)
      .eq('user_id', user.id);

    if (!cartItems || cartItems.length === 0) {
      return errorResponse('Your cart is empty', 400);
    }

    // Calculate cart total
    const cartTotal = cartItems.reduce((sum, item) => {
      const product = Array.isArray(item.product) ? item.product[0] : item.product;
      return sum + (product?.price || item.price) * item.quantity;
    }, 0);

    // Check minimum order amount
    if (cartTotal < coupon.min_order_amount) {
      return errorResponse(
        `Minimum order amount of ₹${coupon.min_order_amount} required for this coupon`,
        400
      );
    }

    // Check user's previous usage (if max_uses_per_user is set)
    if (coupon.max_uses_per_user > 0) {
      const { count: usageCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('coupon_code', coupon.code);

      if (usageCount && usageCount >= coupon.max_uses_per_user) {
        return errorResponse(
          `You have already used this coupon ${coupon.max_uses_per_user} time(s)`,
          400
        );
      }
    }

    // Calculate discount amount
    let calculatedDiscount = 0;
    if (coupon.discount_type === 'percentage') {
      calculatedDiscount = (cartTotal * coupon.discount_value) / 100;
      // Apply max discount limit if set
      if (coupon.max_discount_amount && calculatedDiscount > coupon.max_discount_amount) {
        calculatedDiscount = coupon.max_discount_amount;
      }
    } else {
      // Fixed discount
      calculatedDiscount = coupon.discount_value;
      // Don't exceed cart total
      if (calculatedDiscount > cartTotal) {
        calculatedDiscount = cartTotal;
      }
    }

    // Check if user already has a coupon applied
    const { data: existingCoupon } = await supabase
      .from('user_cart_coupons')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (existingCoupon) {
      // Update existing coupon
      const { error: updateError } = await supabase
        .from('user_cart_coupons')
        .update({
          coupon_id: coupon.id,
          coupon_code: coupon.code,
          discount_type: coupon.discount_type,
          discount_value: coupon.discount_value,
          max_discount_amount: coupon.max_discount_amount,
          calculated_discount: calculatedDiscount,
          cart_subtotal: cartTotal,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Error updating cart coupon:', updateError);
        return errorResponse('Failed to apply coupon', 500);
      }
    } else {
      // Insert new coupon
      const { error: insertError } = await supabase
        .from('user_cart_coupons')
        .insert({
          user_id: user.id,
          coupon_id: coupon.id,
          coupon_code: coupon.code,
          discount_type: coupon.discount_type,
          discount_value: coupon.discount_value,
          max_discount_amount: coupon.max_discount_amount,
          calculated_discount: calculatedDiscount,
          cart_subtotal: cartTotal,
        });

      if (insertError) {
        console.error('Error inserting cart coupon:', insertError);
        return errorResponse('Failed to apply coupon', 500);
      }
    }

    return successResponse({
      coupon: {
        id: coupon.id,
        code: coupon.code,
        name: coupon.name,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        max_discount_amount: coupon.max_discount_amount,
        calculated_discount: calculatedDiscount,
      },
      message: 'Coupon applied successfully',
    });
  } catch (error) {
    console.error('Apply coupon error:', error);
    return errorResponse('Internal server error', 500);
  }
}

// DELETE - Remove applied coupon
export async function DELETE() {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return errorResponse('Please sign in', 401);
    }

    // Delete applied coupon from database
    const { error: deleteError } = await supabase
      .from('user_cart_coupons')
      .delete()
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Error removing cart coupon:', deleteError);
      return errorResponse('Failed to remove coupon', 500);
    }

    return successResponse({
      message: 'Coupon removed successfully',
    });
  } catch (error) {
    console.error('Remove coupon error:', error);
    return errorResponse('Internal server error', 500);
  }
}
