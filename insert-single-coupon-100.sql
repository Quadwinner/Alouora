-- =============================================================================
-- INSERT COUPON FOR ₹100 PURCHASE
-- =============================================================================
-- Coupon that works on orders of ₹100 or more
-- =============================================================================

INSERT INTO public.coupons (
  code,
  name,
  description,
  discount_type,
  discount_value,
  max_discount_amount,
  min_order_amount,
  max_uses,
  max_uses_per_user,
  valid_from,
  valid_until,
  applicable_to,
  is_active
) VALUES
(
  'WELCOME100',
  '₹50 Off on ₹100+ Purchase',
  'Get ₹50 off on orders above ₹100',
  'fixed',
  50.00,
  NULL,
  100.00,
  NULL,
  1,
  NOW() - INTERVAL '1 day',
  NOW() + INTERVAL '90 days',
  'all',
  true
)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  discount_type = EXCLUDED.discount_type,
  discount_value = EXCLUDED.discount_value,
  max_discount_amount = EXCLUDED.max_discount_amount,
  min_order_amount = EXCLUDED.min_order_amount,
  max_uses = EXCLUDED.max_uses,
  max_uses_per_user = EXCLUDED.max_uses_per_user,
  valid_from = EXCLUDED.valid_from,
  valid_until = EXCLUDED.valid_until,
  applicable_to = EXCLUDED.applicable_to,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Verify
SELECT 
  code,
  name,
  discount_type,
  discount_value,
  min_order_amount,
  valid_until
FROM public.coupons
WHERE code = 'WELCOME100';
