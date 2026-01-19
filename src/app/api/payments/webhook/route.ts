/**
 * Payment API - Webhook Handler
 *
 * POST /api/payments/webhook - Handle Razorpay webhook events
 */

import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@/lib/supabase/server';
import { errorResponse, successResponse } from '@/lib/api/response';

/**
 * POST /api/payments/webhook - Handle webhook events
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    if (!signature) {
      return errorResponse('Missing signature', 400);
    }

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      return errorResponse('Invalid webhook signature', 401);
    }

    const event = JSON.parse(body);
    const supabase = await createClient();

    // Handle different webhook events
    switch (event.event) {
      case 'payment.captured':
        // Payment was captured successfully
        if (event.payload?.payment?.entity) {
          const payment = event.payload.payment.entity;
          
          // Find order by Razorpay order ID
          const { data: order } = await supabase
            .from('orders')
            .select('id, user_id, total_amount')
            .ilike('admin_notes', `%${payment.order_id}%`)
            .single();

          if (order) {
            // Update order
            await supabase
              .from('orders')
              .update({
                payment_status: 'paid',
                status: 'confirmed',
              })
              .eq('id', order.id);

            // Create or update payment record
            const paymentData: any = {
              order_id: order.id,
              user_id: order.user_id,
              provider: 'razorpay',
              provider_payment_id: payment.id,
              provider_order_id: payment.order_id,
              amount: payment.amount ? payment.amount / 100 : order.total_amount,
              currency: payment.currency || 'INR',
              status: 'captured',
              method: payment.method || 'card',
              raw_payload: JSON.stringify(payment),
            };

            // Check if payment already exists
            const { data: existingPayment } = await supabase
              .from('payments')
              .select('id')
              .eq('provider_payment_id', payment.id)
              .single();

            if (existingPayment) {
              await supabase
                .from('payments')
                .update(paymentData)
                .eq('id', existingPayment.id);
            } else {
              await supabase.from('payments').insert(paymentData);
            }
          }
        }
        break;

      case 'payment.failed':
        // Payment failed
        if (event.payload?.payment?.entity) {
          const payment = event.payload.payment.entity;
          
          // Find order by Razorpay order ID
          const { data: order } = await supabase
            .from('orders')
            .select('id, user_id, total_amount')
            .ilike('admin_notes', `%${payment.order_id}%`)
            .single();

          if (order) {
            // Update order
            await supabase
              .from('orders')
              .update({
                payment_status: 'failed',
              })
              .eq('id', order.id);

            // Create or update payment record
            const paymentData: any = {
              order_id: order.id,
              user_id: order.user_id,
              provider: 'razorpay',
              provider_payment_id: payment.id,
              provider_order_id: payment.order_id,
              amount: payment.amount ? payment.amount / 100 : order.total_amount,
              currency: payment.currency || 'INR',
              status: 'failed',
              method: payment.method || 'card',
              error_code: payment.error_code || null,
              error_description: payment.error_description || null,
              raw_payload: JSON.stringify(payment),
            };

            const { data: existingPayment } = await supabase
              .from('payments')
              .select('id')
              .eq('provider_payment_id', payment.id)
              .single();

            if (existingPayment) {
              await supabase
                .from('payments')
                .update(paymentData)
                .eq('id', existingPayment.id);
            } else {
              await supabase.from('payments').insert(paymentData);
            }
          }
        }
        break;

      case 'order.paid':
        // Order was paid
        if (event.payload?.order?.entity) {
          const razorpayOrder = event.payload.order.entity;
          
          const { data: order } = await supabase
            .from('orders')
            .select('id, user_id, total_amount')
            .ilike('admin_notes', `%${razorpayOrder.id}%`)
            .single();

          if (order) {
            await supabase
              .from('orders')
              .update({
                status: 'confirmed',
                payment_status: 'paid',
              })
              .eq('id', order.id);
          }
        }
        break;

      default:
        console.log('Unhandled webhook event:', event.event);
    }

    return successResponse(null, 'Webhook processed');
  } catch (error) {
    console.error('Error processing webhook:', error);
    return errorResponse('Failed to process webhook', 500);
  }
}
