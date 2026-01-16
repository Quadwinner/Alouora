-- Check if coupons exist
SELECT 
  code,
  name,
  discount_type,
  discount_value,
  min_order_amount,
  valid_from,
  valid_until,
  is_active
FROM public.coupons
ORDER BY code;
