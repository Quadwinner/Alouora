'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import Footer from '@/components/layout/Footer';
import CouponsDrawer from '@/components/cart/CouponsDrawer';

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
  isActive: boolean;
  stockAvailable: number;
  isOutOfStock: boolean;
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
    amountForFreeShipping: number;
    rewardPoints: number;
    grandTotal: number;
    freeShippingThreshold: number;
  };
  appliedCoupon: {
    id: string;
    code: string;
    name: string;
    description: string | null;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    max_discount_amount: number | null;
    calculated_discount: number;
  } | null;
}

export default function CartPage() {
  const [cart, setCart] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  const [isCouponsDrawerOpen, setIsCouponsDrawerOpen] = useState(false);
  const [appliedCouponCode, setAppliedCouponCode] = useState<string | null>(null);

  // Fetch cart data
  const fetchCart = async () => {
    try {
      const response = await fetch('/api/cart');
      const data = await response.json();

      if (response.ok && data.success) {
        setCart(data.data);
        setAppliedCouponCode(data.data.appliedCoupon?.code || null);
        setError(null);
      } else {
        setError(data.error || 'Failed to load cart');
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // Update item quantity
  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1 || newQuantity > 10) return;
    
    setUpdatingItems(prev => new Set(prev).add(itemId));
    
    try {
      const response = await fetch(`/api/cart/items/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      if (response.ok) {
        await fetchCart();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to update quantity');
      }
    } catch (err) {
      console.error('Error updating quantity:', err);
      alert('Something went wrong');
    } finally {
      setUpdatingItems(prev => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  // Remove item from cart
  const removeItem = async (itemId: string) => {
    setUpdatingItems(prev => new Set(prev).add(itemId));
    
    try {
      const response = await fetch(`/api/cart/items/${itemId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchCart();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to remove item');
      }
    } catch (err) {
      console.error('Error removing item:', err);
      alert('Something went wrong');
    } finally {
      setUpdatingItems(prev => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  // Apply coupon
  const handleApplyCoupon = async (couponCode: string) => {
    try {
      const response = await fetch('/api/cart/apply-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coupon_code: couponCode }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setAppliedCouponCode(couponCode);
        await fetchCart();
      } else {
        throw new Error(data.error || 'Failed to apply coupon');
      }
    } catch (err) {
      throw err;
    }
  };

  // Remove coupon
  const handleRemoveCoupon = async () => {
    try {
      const response = await fetch('/api/cart/apply-coupon', {
        method: 'DELETE',
      });

      if (response.ok) {
        setAppliedCouponCode(null);
        await fetchCart();
      }
    } catch (err) {
      console.error('Error removing coupon:', err);
    }
  };

  // Loading state
  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  // Error state (likely not signed in)
  if (error) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-16">
            <svg className="w-24 h-24 mx-auto text-gray-300 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Sign in to view your cart</h2>
            <p className="text-gray-500 mb-6">{error}</p>
            <Link 
              href="/signin" 
              className="inline-block px-6 py-3 bg-pink-500 text-white font-medium rounded-lg hover:bg-pink-600 transition"
            >
              Sign In
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  // Empty cart state
  if (!cart || cart.items.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-8">My Bag</h1>
          <div className="text-center py-16 bg-white rounded-lg shadow-sm">
            <svg className="w-24 h-24 mx-auto text-gray-300 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Your bag is empty</h2>
            <p className="text-gray-500 mb-6">Looks like you haven&apos;t added anything yet.</p>
            <Link 
              href="/products?category=lipstick" 
              className="inline-block px-6 py-3 bg-pink-500 text-white font-medium rounded-lg hover:bg-pink-600 transition"
            >
              Start Shopping
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">My Bag ({cart.summary.totalItems} items)</h1>
          {cart.summary.rewardPoints > 0 && (
            <div className="flex items-center gap-2 text-green-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
              </svg>
              <span className="text-sm font-medium">Earn {cart.summary.rewardPoints} reward points</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <div 
                key={item.id} 
                className={`bg-white rounded-lg shadow-sm p-4 ${updatingItems.has(item.id) ? 'opacity-50' : ''}`}
              >
                <div className="flex gap-4">
                  {/* Product Image */}
                  <Link href={`/products/${item.slug}`} className="flex-shrink-0">
                    <div className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-contain p-2"
                      />
                    </div>
                  </Link>

                  {/* Product Details */}
                  <div className="flex-1">
                    <Link href={`/products/${item.slug}`}>
                      <h3 className="font-medium text-gray-900 hover:text-pink-600 transition">
                        {item.name}
                      </h3>
                    </Link>

                    {/* Price */}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-semibold text-gray-900">₹{item.price.toFixed(2)}</span>
                      {item.originalPrice > item.price && (
                        <>
                          <span className="text-sm text-gray-400 line-through">₹{item.originalPrice.toFixed(2)}</span>
                          <span className="text-sm text-green-600">
                            {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% off
                          </span>
                        </>
                      )}
                    </div>

                    {/* Out of stock warning */}
                    {item.isOutOfStock && (
                      <p className="text-red-500 text-sm mt-1">Only {item.stockAvailable} left in stock</p>
                    )}

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center border border-gray-300 rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1 || updatingItems.has(item.id)}
                          className="px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          −
                        </button>
                        <span className="px-3 py-1 text-gray-900 font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= 10 || item.quantity >= item.stockAvailable || updatingItems.has(item.id)}
                          className="px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        disabled={updatingItems.has(item.id)}
                        className="text-gray-400 hover:text-red-500 transition"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Item Total */}
                  <div className="text-right">
                    <span className="font-semibold text-gray-900">₹{item.itemTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              {/* Coupons & Offers Section */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#c57baa]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <h3 className="text-base font-normal text-[#2c2c2c]">Coupons & Bank Offers</h3>
                  </div>
                  <button
                    onClick={() => setIsCouponsDrawerOpen(true)}
                    className="text-sm font-medium text-[#c57baa] hover:underline flex items-center gap-1"
                  >
                    View All
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                {/* Applied Coupon Display */}
                {appliedCouponCode ? (
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-base font-normal text-[#2c2c2c]">{appliedCouponCode}</p>
                        <p className="text-sm text-[#32cd70]">Save on this purchase!</p>
                      </div>
                      <button
                        onClick={handleRemoveCoupon}
                        className="px-4 py-2 bg-[#2c2c2c] text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-base font-normal text-[#2c2c2c]">COUPON25</p>
                        <p className="text-sm text-[#32cd70]">Save ₹532.78 on this purchase!</p>
                      </div>
                      <button
                        onClick={() => setIsCouponsDrawerOpen(true)}
                        className="px-4 py-2 bg-[#2c2c2c] text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Beautify Treats */}
              {cart.summary.rewardPoints > 0 && (
                <div className="mb-6 p-4 bg-[#fffbf0] rounded-lg">
                  <h3 className="text-base font-normal text-[#2c2c2c] mb-2">Beautify Treats</h3>
                  <div className="flex items-center gap-2 text-sm text-[#2c2c2c]">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                    </svg>
                    <span>Earn {cart.summary.rewardPoints} points with this purchase</span>
                  </div>
                </div>
              )}

              <h2 className="text-lg font-semibold text-gray-900 mb-4">Price Details</h2>

              {/* Free shipping progress */}
              {cart.summary.amountForFreeShipping > 0 && (
                <div className="mb-4 p-3 bg-pink-50 rounded-lg">
                  <p className="text-sm text-pink-600">
                    Add ₹{cart.summary.amountForFreeShipping.toFixed(2)} more for FREE Shipping!
                  </p>
                  <div className="mt-2 h-2 bg-pink-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-pink-500 rounded-full transition-all"
                      style={{ width: `${Math.min(100, (cart.summary.subtotal / cart.summary.freeShippingThreshold) * 100)}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total MRP</span>
                  <span className="font-medium">₹{cart.summary.subtotal.toFixed(2)}</span>
                </div>
                <p className="text-xs text-gray-400">Inclusive Of All Taxes</p>

                {cart.summary.totalSavings > 0 && (
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[#2c2c2c]">Bag Savings</span>
                      <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="font-medium text-[#32cd70]">-₹{cart.summary.totalSavings.toFixed(2)}</span>
                  </div>
                )}

                {cart.summary.couponDiscount && cart.summary.couponDiscount > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span className="ml-4">Discount</span>
                    <span>-₹{cart.summary.couponDiscount.toFixed(2)}</span>
                  </div>
                )}

                <div className="border-t pt-3 flex justify-between text-lg font-normal">
                  <span className="text-[#2c2c2c]">Total</span>
                  <span className="text-[#2c2c2c]">₹{cart.summary.grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {(cart.summary.totalSavings > 0 || (cart.summary.couponDiscount && cart.summary.couponDiscount > 0)) && (
                <div className="mt-4 p-3 bg-[#f2fff8] rounded-md">
                  <div className="flex items-center gap-2 text-sm text-[#32cd70]">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>
                      Woohoo! You save ₹
                      {((cart.summary.totalSavings || 0) + (cart.summary.couponDiscount || 0)).toFixed(2)} on this order.
                    </span>
                  </div>
                </div>
              )}

              <button className="w-full mt-6 py-3 bg-[#c57baa] text-white text-lg font-normal rounded-lg hover:bg-[#b86a9a] transition">
                Checkout
              </button>

              <Link 
                href="/products?category=lipstick" 
                className="block text-center mt-4 text-pink-600 hover:text-pink-700 text-sm"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />

      {/* Coupons Drawer */}
      <CouponsDrawer
        isOpen={isCouponsDrawerOpen}
        onClose={() => setIsCouponsDrawerOpen(false)}
        onApplyCoupon={handleApplyCoupon}
        appliedCouponCode={appliedCouponCode}
      />
    </main>
  );
}
