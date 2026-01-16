-- =============================================================================
-- MIGRATION: USER CART COUPONS TABLE
-- =============================================================================
-- Stores applied coupons for user carts
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.user_cart_coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  coupon_code TEXT NOT NULL,
  
  -- Discount calculation (snapshot at time of application)
  discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed')) NOT NULL,
  discount_value DECIMAL(10, 2) NOT NULL,
  max_discount_amount DECIMAL(10, 2),
  calculated_discount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  
  -- Cart total at time of application (for validation)
  cart_subtotal DECIMAL(10, 2) NOT NULL,
  
  -- Timestamps
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one coupon per user (only one active coupon at a time)
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_cart_coupons_user_id ON public.user_cart_coupons(user_id);
CREATE INDEX IF NOT EXISTS idx_user_cart_coupons_coupon_id ON public.user_cart_coupons(coupon_id);
CREATE INDEX IF NOT EXISTS idx_user_cart_coupons_coupon_code ON public.user_cart_coupons(coupon_code);

ALTER TABLE public.user_cart_coupons ENABLE ROW LEVEL SECURITY;

-- Users can only access their own cart coupons
CREATE POLICY "Users can view own cart coupons" ON public.user_cart_coupons
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cart coupons" ON public.user_cart_coupons
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart coupons" ON public.user_cart_coupons
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own cart coupons" ON public.user_cart_coupons
  FOR DELETE USING (auth.uid() = user_id);

-- Trigger to update updated_at
CREATE TRIGGER update_user_cart_coupons_updated_at
  BEFORE UPDATE ON public.user_cart_coupons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE public.user_cart_coupons IS 'Applied coupons for user shopping carts';
COMMENT ON COLUMN public.user_cart_coupons.calculated_discount IS 'The actual discount amount calculated based on cart total';
COMMENT ON COLUMN public.user_cart_coupons.cart_subtotal IS 'Cart subtotal at time of coupon application (for validation)';
