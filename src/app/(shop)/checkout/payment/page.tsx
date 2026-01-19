'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface CartItem {
  id: string;
  productId: string;
  name: string;
  slug: string;
  image: string;
  quantity: number;
  price: number;
  originalPrice: number;
  priceSnapshot: number;
  variantId: string | null;
  itemTotal: number;
}

interface CartData {
  items: CartItem[];
  summary: {
    subtotal: number;
    totalItems: number;
    totalSavings: number;
    couponDiscount?: number;
    shippingCost: number;
    grandTotal: number;
  };
  appliedCoupon: {
    id: string;
    code: string;
    name: string;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    calculated_discount: number;
  } | null;
}

export default function PaymentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [cartData, setCartData] = useState<CartData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCartData();
  }, []);

  const fetchCartData = async () => {
    try {
      const response = await fetch('/api/cart');
      const data = await response.json();

      if (response.ok && data.success) {
        setCartData(data.data);
      } else {
        if (response.status === 401) {
          router.push('/signin?redirectTo=/checkout/payment');
        } else {
          setError(data.error || 'Failed to load cart');
        }
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
      setError('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!cartData || cartData.items.length === 0) {
      setError('Your cart is empty');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Step 1: Create Razorpay order
      const orderResponse = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
          amount: Number(cartData.summary.grandTotal),
          currency: 'INR',
          receipt: `order_${Date.now()}`,
          notes: {
            cart_items: String(cartData.items.length),
            coupon_code: cartData.appliedCoupon?.code || '',
          },
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok || !orderData.success) {
        throw new Error(orderData.error || 'Failed to create payment order');
      }

      const { order_id, db_order_id, amount, currency } = orderData.data;

      // Step 2: Initialize Razorpay checkout
      if (!window.Razorpay) {
        throw new Error('Razorpay SDK not loaded');
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
        amount: amount,
        currency: currency,
        name: 'ALOUORA',
        description: `Order for ${cartData.items.length} item(s)`,
        order_id: order_id,
        handler: async function (response: any) {
          // Step 3: Verify payment signature
          try {
            const verifyResponse = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                order_id: db_order_id || order_id, // Use database order ID if available
              }),
            });

            const verifyData = await verifyResponse.json();

            if (verifyResponse.ok && verifyData.success) {
              // Payment successful - redirect to success page
              router.push(`/orders?payment_id=${response.razorpay_payment_id}&order_id=${order_id}`);
            } else {
              throw new Error(verifyData.error || 'Payment verification failed');
            }
          } catch (err: any) {
            console.error('Payment verification error:', err);
            setError(err.message || 'Payment verification failed');
            setProcessing(false);
          }
        },
        prefill: {
          name: '',
          email: '',
          contact: '',
        },
        theme: {
          color: '#b8860b',
        },
        modal: {
          ondismiss: function () {
            setProcessing(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', function (response: any) {
        console.error('Payment failed:', response);
        setError(response.error.description || 'Payment failed');
        setProcessing(false);
      });

      razorpay.open();
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.message || 'Failed to initiate payment');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (error && !cartData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/cart')}
            className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600"
          >
            Back to Cart
          </button>
        </div>
      </div>
    );
  }

  if (!cartData || cartData.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Your cart is empty</p>
          <button
            onClick={() => router.push('/products')}
            className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
        onLoad={() => {
          console.log('Razorpay SDK loaded');
        }}
      />

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment</h1>
            <p className="text-gray-600">Complete your purchase securely</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Summary */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>

              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {cartData.items.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b border-gray-100">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.image || '/images/placeholder.png'}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                      <p className="text-sm font-medium text-gray-900 mt-1">
                        ₹{item.priceSnapshot.toFixed(2)} × {item.quantity} = ₹
                        {item.itemTotal.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{cartData.summary.subtotal.toFixed(2)}</span>
                </div>
                {cartData.summary.couponDiscount && cartData.summary.couponDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Coupon Discount ({cartData.appliedCoupon?.code})</span>
                    <span>-₹{cartData.summary.couponDiscount.toFixed(2)}</span>
                  </div>
                )}
                {cartData.summary.shippingCost > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>₹{cartData.summary.shippingCost.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span>₹{cartData.summary.grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Payment Section */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment</h2>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-4">
                    You will be redirected to Razorpay's secure payment gateway to complete your
                    purchase.
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <svg
                      className="w-5 h-5 text-green-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    <span>Secure Payment</span>
                  </div>
                </div>

                <button
                  onClick={handlePayment}
                  disabled={processing || !window.Razorpay}
                  className={`w-full py-3 rounded-lg font-medium text-white transition-colors ${
                    processing || !window.Razorpay
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-pink-500 hover:bg-pink-600'
                  }`}
                >
                  {processing ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </span>
                  ) : (
                    `Pay ₹${cartData.summary.grandTotal.toFixed(2)}`
                  )}
                </button>

                <button
                  onClick={() => router.push('/cart')}
                  className="w-full mt-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Back to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
