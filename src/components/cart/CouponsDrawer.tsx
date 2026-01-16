'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon, TagIcon, CheckIcon } from '@heroicons/react/24/outline';

interface Coupon {
  id: string;
  code: string;
  name: string;
  description: string | null;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  max_discount_amount: number | null;
  min_order_amount: number;
  valid_until: string;
  applicable_to: 'all' | 'category' | 'brand' | 'product';
}

interface CouponsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyCoupon: (couponCode: string) => Promise<void>;
  appliedCouponCode: string | null;
}

export default function CouponsDrawer({
  isOpen,
  onClose,
  onApplyCoupon,
  appliedCouponCode,
}: CouponsDrawerProps) {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch available coupons
  useEffect(() => {
    if (isOpen) {
      fetchCoupons();
    }
  }, [isOpen]);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/coupons');
      const data = await response.json();

      if (response.ok && data.success) {
        setCoupons(data.data?.coupons || []);
      }
    } catch (err) {
      console.error('Error fetching coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyCoupon = async (code: string) => {
    setApplyingCoupon(code);
    setError(null);

    try {
      await onApplyCoupon(code);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply coupon');
    } finally {
      setApplyingCoupon(null);
    }
  };

  const handleManualApply = async () => {
    if (!couponCode.trim()) return;
    await handleApplyCoupon(couponCode.toUpperCase().trim());
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();
    const suffix = day === 1 || day === 21 || day === 31 ? 'st' : day === 2 || day === 22 ? 'nd' : day === 3 || day === 23 ? 'rd' : 'th';
    return `Expires on ${day}${suffix} ${month}, ${year}`;
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/27 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-[500px] bg-white shadow-[0px_25px_50px_0px_rgba(0,0,0,0.25)] z-50 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 h-[61px] flex items-center px-4 z-10">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
            aria-label="Close"
          >
            <XMarkIcon className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="flex-1 text-center text-[20px] font-normal text-[#2c2c2c]">
            Coupons & Offers
          </h2>
          <div className="w-10" />
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Coupon Code Input */}
          <div className="mb-6">
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Enter Coupon Code"
                className="flex-1 h-[50px] px-4 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-[#c57baa] focus:border-transparent"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleManualApply();
                  }
                }}
              />
              <button
                onClick={handleManualApply}
                disabled={!couponCode.trim() || applyingCoupon === couponCode.toUpperCase()}
                className="px-6 h-[50px] bg-[#c57baa] text-white rounded-md font-medium hover:bg-[#b86a9a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Apply
              </button>
            </div>
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
          </div>

          {/* Unlocked Coupons Section */}
          <div>
            <h3 className="text-[18px] font-normal text-[#2c2c2c] mb-4">
              Unlocked Coupons
            </h3>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-[161px] bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : coupons.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <TagIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>No coupons available</p>
              </div>
            ) : (
              <div className="space-y-4">
                {coupons.map((coupon) => {
                  const isApplied = appliedCouponCode === coupon.code;
                  const isApplying = applyingCoupon === coupon.code;

                  return (
                    <div
                      key={coupon.id}
                      className="border-b border-gray-200 pb-4 last:border-b-0"
                    >
                      {/* Coupon Info */}
                      <div className="flex items-start gap-3 mb-3">
                        <div className="mt-1">
                          <TagIcon className="w-5 h-5 text-[#c57baa]" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-base font-normal text-[#2c2c2c] mb-1">
                            {coupon.name}
                          </h4>
                          <p className="text-sm text-[#4b5563] mb-2">
                            {coupon.description || `On all ${coupon.applicable_to === 'all' ? 'orders' : coupon.applicable_to} orders`}
                          </p>
                          <button className="text-sm font-medium text-[#c57baa] hover:underline">
                            View Details
                          </button>
                        </div>
                        <button
                          onClick={() => handleApplyCoupon(coupon.code)}
                          disabled={isApplied || isApplying}
                          className={`px-4 py-2 rounded-md text-sm font-normal transition-colors ${
                            isApplied
                              ? 'bg-green-100 text-green-700 cursor-not-allowed'
                              : 'border border-[#c57baa] text-[#c57baa] hover:bg-[#c57baa] hover:text-white'
                          } disabled:opacity-50`}
                        >
                          {isApplied ? (
                            <span className="flex items-center gap-1">
                              <CheckIcon className="w-4 h-4" />
                              Applied
                            </span>
                          ) : isApplying ? (
                            'Applying...'
                          ) : (
                            'Apply'
                          )}
                        </button>
                      </div>

                      {/* Coupon Code Box */}
                      <div className="ml-8">
                        <div className="relative inline-block">
                          <div className="bg-[#fff5f6] border border-dashed border-[#f7d3d6] rounded-md px-3 py-2">
                            <span className="text-sm font-normal text-[#2c2c2c]">
                              {coupon.code}
                            </span>
                            <p className="text-xs text-[#6b7280] mt-1">
                              {formatDate(coupon.valid_until)}
                            </p>
                          </div>
                          {/* Dashed border circles */}
                          <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-white border border-dashed border-[#f7d3d6] rounded-full" />
                          <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-white border border-dashed border-[#f7d3d6] rounded-full" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
