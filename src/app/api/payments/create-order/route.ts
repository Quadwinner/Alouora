/**
 * Payment API - Create Razorpay Order
 *
 * POST /api/payments/create-order - Create order for Razorpay payment
 */

import { NextRequest } from 'next/server';
import Razorpay from 'razorpay';
import { createClient } from '@/lib/supabase/server';
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  unauthorizedResponse,
} from '@/lib/api/response';
import { createPaymentOrderSchema } from '@/lib/api/schemas/payment';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

/**
 * POST /api/payments/create-order - Create Razorpay order
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return unauthorizedResponse('Please sign in to proceed with payment');
    }

    // Parse and validate request body
    const body = await request.json();
    console.log('Create order request body:', body);
    
    const validationResult = createPaymentOrderSchema.safeParse(body);

    if (!validationResult.success) {
      console.error('Validation error:', validationResult.error);
      return validationErrorResponse(validationResult.error);
    }

    const { amount, currency, receipt, notes } = validationResult.data;

    // Verify cart exists
    const { data: cartItems, error: cartError } = await supabase
      .from('cart_items')
      .select('id')
      .eq('user_id', user.id)
      .limit(1);

    if (cartError) {
      console.error('Error fetching cart:', cartError);
      return errorResponse('Failed to fetch cart items', 500);
    }

    if (!cartItems || cartItems.length === 0) {
      return errorResponse('Your cart is empty', 400);
    }

    // Amount should be in paise (smallest currency unit)
    // Frontend sends amount in rupees, convert to paise
    const amountInPaise = Math.round(amount * 100);

    // Create Razorpay order
    const orderOptions: any = {
      amount: amountInPaise,
      currency: currency.toUpperCase(),
      receipt: receipt || `order_${Date.now()}_${user.id.slice(0, 8)}`,
      notes: {
        user_id: user.id,
        cart_items_count: cartItems.length,
        ...notes,
      },
    };

    // Validate Razorpay keys
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error('Razorpay keys not configured');
      return errorResponse('Payment gateway not configured', 500);
    }

    // Get user's default address for shipping_address (required field)
    const { data: defaultAddress } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false })
      .limit(1)
      .single();

    // Create shipping address JSONB (required field)
    // Use default address if available, otherwise create a placeholder
    const shippingAddress = defaultAddress
      ? {
          full_name: defaultAddress.full_name,
          phone: defaultAddress.phone,
          address_line1: defaultAddress.address_line1,
          address_line2: defaultAddress.address_line2 || null,
          landmark: defaultAddress.landmark || null,
          city: defaultAddress.city,
          state: defaultAddress.state,
          pincode: defaultAddress.pincode,
          address_type: defaultAddress.address_type,
        }
      : {
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Customer',
          phone: user.phone || '',
          address_line1: 'Address to be updated',
          city: '',
          state: '',
          pincode: '',
        };

    // Get cart data for order items
    const { data: fullCartItems } = await supabase
      .from('cart_items')
      .select(`
        quantity,
        price,
        product:products(id, name, thumbnail, images, sku)
      `)
      .eq('user_id', user.id);

    // Get applied coupon
    const { data: appliedCouponData } = await supabase
      .from('user_cart_coupons')
      .select('coupon_code, calculated_discount')
      .eq('user_id', user.id)
      .single();

    // Calculate totals
    const subtotal = fullCartItems?.reduce((sum, item) => sum + item.price * item.quantity, 0) || amount;
    const couponDiscount = appliedCouponData?.calculated_discount || 0;
    const finalTotal = subtotal - couponDiscount;

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create(orderOptions);

    // Store order in database
    const orderData: any = {
      user_id: user.id,
      total_amount: finalTotal,
      subtotal: subtotal,
      discount_amount: couponDiscount,
      coupon_discount: couponDiscount,
      coupon_code: appliedCouponData?.coupon_code || null,
      status: 'pending',
      payment_status: 'pending',
      payment_method: 'card', // Razorpay processes card payments
      shipping_address: shippingAddress,
      billing_address: shippingAddress,
      admin_notes: `Razorpay Order ID: ${razorpayOrder.id}`, // Store Razorpay order ID in admin notes
    };

    let dbOrder = null;
    try {
      const { data: insertedOrder, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select('id, order_number')
        .single();

      if (orderError) {
        console.error('Error storing order in database:', orderError);
        console.error('Order data:', JSON.stringify(orderData, null, 2));
        // Continue even if order storage fails - Razorpay order is created
      } else {
        dbOrder = insertedOrder;
      }
    } catch (dbError) {
      console.error('Database error:', dbError);
      // Continue - Razorpay order is already created
    }

    // Return both Razorpay order ID and database order ID
    return successResponse({
      order_id: razorpayOrder.id,
      db_order_id: dbOrder?.id || null,
      order_number: dbOrder?.order_number || null,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      receipt: razorpayOrder.receipt,
    });

  } catch (error: any) {
    console.error('Error creating Razorpay order:', error);
    
    if (error.statusCode) {
      return errorResponse(
        error.error?.description || error.error?.reason || 'Failed to create payment order',
        error.statusCode
      );
    }

    return errorResponse(
      error.message || 'Failed to create payment order',
      500
    );
  }
}
