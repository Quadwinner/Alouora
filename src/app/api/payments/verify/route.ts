/**
 * Payment API - Verify Payment
 *
 * POST /api/payments/verify - Verify Razorpay payment signature
 */

import { NextRequest } from 'next/server';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { createClient } from '@/lib/supabase/server';
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  unauthorizedResponse,
} from '@/lib/api/response';
import { verifyPaymentSchema } from '@/lib/api/schemas/payment';

/**
 * POST /api/payments/verify - Verify payment signature
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return unauthorizedResponse('Please sign in to verify payment');
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = verifyPaymentSchema.safeParse(body);

    if (!validationResult.success) {
      return validationErrorResponse(validationResult.error);
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } =
      validationResult.data;

    // Get Razorpay credentials (reused throughout the function)
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || '';

    // Verify signature
    const generatedSignature = crypto
      .createHmac('sha256', razorpayKeySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return errorResponse('Invalid payment signature', 400);
    }

    // Find order by Razorpay order ID (stored in admin_notes) or by database order ID
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, user_id, status, admin_notes, total_amount')
      .or(`id.eq.${order_id},admin_notes.ilike.%${razorpay_order_id}%`)
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .single();

    if (orderError || !order) {
      console.error('Order not found:', orderError);
      // Try to find by Razorpay order ID in admin_notes
      const { data: orderByRazorpayId } = await supabase
        .from('orders')
        .select('id, user_id, status')
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .ilike('admin_notes', `%${razorpay_order_id}%`)
        .single();

      if (!orderByRazorpayId) {
        return errorResponse('Order not found', 404);
      }

      // Fetch payment details from Razorpay
      let paymentDetails: any = null;
      if (razorpayKeyId && razorpayKeySecret) {
        try {
          const razorpayClient = new Razorpay({
            key_id: razorpayKeyId,
            key_secret: razorpayKeySecret,
          });
          paymentDetails = await razorpayClient.payments.fetch(razorpay_payment_id);
        } catch (razorpayError) {
          console.error('Error fetching payment details from Razorpay:', razorpayError);
        }
      }

      // Update order with payment details
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          status: 'confirmed',
          payment_status: 'paid',
          admin_notes: `Razorpay Payment ID: ${razorpay_payment_id}`,
        })
        .eq('id', orderByRazorpayId.id);

      if (updateError) {
        console.error('Error updating order:', updateError);
        return errorResponse('Failed to update order', 500);
      }

      // Create payment record in payments table
      const { data: orderForPayment } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('id', orderByRazorpayId.id)
        .single();

      const paymentData: any = {
        order_id: orderByRazorpayId.id,
        user_id: user.id,
        provider: 'razorpay',
        provider_payment_id: razorpay_payment_id,
        provider_order_id: razorpay_order_id,
        amount: paymentDetails?.amount ? paymentDetails.amount / 100 : orderForPayment?.total_amount || 0,
        currency: paymentDetails?.currency || 'INR',
        status: 'captured',
        method: paymentDetails?.method || 'card',
        raw_payload: paymentDetails ? JSON.stringify(paymentDetails) : null,
      };

      await supabase.from('payments').insert(paymentData);

      // Clear cart and coupon
      await supabase.from('cart_items').delete().eq('user_id', user.id);
      await supabase.from('user_cart_coupons').delete().eq('user_id', user.id);

      return successResponse(
        {
          order_id: orderByRazorpayId.id,
          payment_id: razorpay_payment_id,
          status: 'verified',
        },
        'Payment verified successfully'
      );
    }

    if (order.status !== 'pending') {
      return errorResponse('Order already processed', 400);
    }

    // Fetch payment details from Razorpay
    let paymentDetails: any = null;
    if (razorpayKeyId && razorpayKeySecret) {
      try {
        const razorpayClient = new Razorpay({
          key_id: razorpayKeyId,
          key_secret: razorpayKeySecret,
        });
        paymentDetails = await razorpayClient.payments.fetch(razorpay_payment_id);
      } catch (razorpayError) {
        console.error('Error fetching payment details from Razorpay:', razorpayError);
        // Continue without payment details
      }
    }

    // Update order with payment details
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'confirmed',
        payment_status: 'paid',
        admin_notes: `${order.admin_notes || ''}\nRazorpay Payment ID: ${razorpay_payment_id}`,
      })
      .eq('id', order.id);

    if (updateError) {
      console.error('Error updating order:', updateError);
      return errorResponse('Failed to update order', 500);
    }

    // Create payment record in payments table
    const paymentData: any = {
      order_id: order.id,
      user_id: user.id,
      provider: 'razorpay',
      provider_payment_id: razorpay_payment_id,
      provider_order_id: razorpay_order_id,
      amount: paymentDetails?.amount ? paymentDetails.amount / 100 : order.total_amount, // Razorpay amount is in paise
      currency: paymentDetails?.currency || 'INR',
      status: 'captured',
      method: paymentDetails?.method || 'card',
      raw_payload: paymentDetails ? JSON.stringify(paymentDetails) : null,
    };

    const { error: paymentInsertError } = await supabase
      .from('payments')
      .insert(paymentData);

    if (paymentInsertError) {
      console.error('Error creating payment record:', paymentInsertError);
      // Don't fail the request if payment record creation fails
    }

    // Clear cart after successful payment
    const { error: cartError } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id);

    if (cartError) {
      console.error('Error clearing cart:', cartError);
      // Don't fail the request if cart clearing fails
    }

    // Clear applied coupon
    await supabase.from('user_cart_coupons').delete().eq('user_id', user.id);

    return successResponse(
      {
        order_id: order_id,
        payment_id: razorpay_payment_id,
        status: 'verified',
      },
      'Payment verified successfully'
    );
  } catch (error) {
    console.error('Error verifying payment:', error);
    return errorResponse('Failed to verify payment', 500);
  }
}
