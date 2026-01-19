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
          await supabase
            .from('orders')
            .update({
              payment_status: 'captured',
              razorpay_payment_id: payment.id,
            })
            .eq('razorpay_order_id', payment.order_id);
        }
        break;

      case 'payment.failed':
        // Payment failed
        if (event.payload?.payment?.entity) {
          const payment = event.payload.payment.entity;
          await supabase
            .from('orders')
            .update({
              payment_status: 'failed',
              razorpay_payment_id: payment.id,
            })
            .eq('razorpay_order_id', payment.order_id);
        }
        break;

      case 'order.paid':
        // Order was paid
        if (event.payload?.order?.entity) {
          const order = event.payload.order.entity;
          await supabase
            .from('orders')
            .update({
              status: 'confirmed',
              payment_status: 'paid',
            })
            .eq('razorpay_order_id', order.id);
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
