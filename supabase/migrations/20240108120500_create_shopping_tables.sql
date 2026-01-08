-- =============================================================================
-- MIGRATION 6: SHOPPING TABLES (Product Variants, Cart, Wishlist, Reviews, Coupons, Wallet)
-- =============================================================================

-- =============================================================================
-- PRODUCT VARIANTS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  
  -- Variant attributes (e.g., size, color, format)
  variant_type TEXT NOT NULL, -- 'size', 'color', 'format', etc.
  variant_value TEXT NOT NULL, -- 'Small', 'Red', '50ml', etc.
  variant_label TEXT, -- Display label (e.g., "Size: Small")
  
  -- Pricing (can override product price)
  price DECIMAL(10, 2),
  original_price DECIMAL(10, 2),
  discount_percentage INTEGER,
  
  -- Inventory
  stock_quantity INTEGER DEFAULT 0,
  sku TEXT UNIQUE,
  
  -- Images (variant-specific images)
  image_url TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure unique variant per product
  UNIQUE(product_id, variant_type, variant_value)
);

CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON public.product_variants(sku);
CREATE INDEX IF NOT EXISTS idx_product_variants_is_active ON public.product_variants(is_active);

ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

-- Public read access for active variants
CREATE POLICY "Active variants are publicly readable" ON public.product_variants
  FOR SELECT USING (is_active = true);

-- Only service role can manage variants
CREATE POLICY "Service role can manage variants" ON public.product_variants
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

CREATE TRIGGER update_product_variants_updated_at
  BEFORE UPDATE ON public.product_variants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to ensure only one default variant per product
CREATE OR REPLACE FUNCTION ensure_single_default_variant()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = true THEN
    UPDATE public.product_variants
    SET is_default = false
    WHERE product_id = NEW.product_id AND id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_one_default_variant
  BEFORE INSERT OR UPDATE ON public.product_variants
  FOR EACH ROW
  WHEN (NEW.is_default = true)
  EXECUTE FUNCTION ensure_single_default_variant();

-- =============================================================================
-- CART ITEMS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
  
  -- Quantity and pricing (snapshot at time of adding to cart)
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  price DECIMAL(10, 2) NOT NULL, -- Price at time of adding
  
  added_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure unique product+variant per user
  UNIQUE(user_id, product_id, variant_id)
);

CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON public.cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON public.cart_items(product_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_variant_id ON public.cart_items(variant_id);

ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- Users can only access their own cart items
CREATE POLICY "Users can view own cart items" ON public.cart_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cart items" ON public.cart_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart items" ON public.cart_items
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own cart items" ON public.cart_items
  FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_cart_items_updated_at
  BEFORE UPDATE ON public.cart_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- WISHLIST TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.wishlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
  
  added_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure unique product+variant per user
  UNIQUE(user_id, product_id, variant_id)
);

CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON public.wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_product_id ON public.wishlist(product_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_variant_id ON public.wishlist(variant_id);

ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;

-- Users can only access their own wishlist
CREATE POLICY "Users can view own wishlist" ON public.wishlist
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wishlist items" ON public.wishlist
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own wishlist items" ON public.wishlist
  FOR DELETE USING (auth.uid() = user_id);

-- =============================================================================
-- REVIEWS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  
  -- Rating and review content
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  images TEXT[], -- Array of review photo URLs
  
  -- Verification and moderation
  is_verified_purchase BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  is_helpful INTEGER DEFAULT 0, -- Count of helpful votes
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one review per user per product per order (if order_id provided)
  UNIQUE(user_id, product_id, order_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_order_id ON public.reviews(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON public.reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_is_approved ON public.reviews(is_approved);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews(created_at DESC);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Public can view approved reviews
CREATE POLICY "Public can view approved reviews" ON public.reviews
  FOR SELECT USING (is_approved = true);

-- Users can view their own reviews (even if not approved)
CREATE POLICY "Users can view own reviews" ON public.reviews
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own reviews
CREATE POLICY "Users can insert own reviews" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own reviews (only if not approved)
CREATE POLICY "Users can update own reviews" ON public.reviews
  FOR UPDATE USING (auth.uid() = user_id AND is_approved = false)
  WITH CHECK (auth.uid() = user_id);

-- Only service role can approve reviews
CREATE POLICY "Service role can manage reviews" ON public.reviews
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to update product rating when review is added/updated/deleted
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
DECLARE
  target_product_id UUID;
BEGIN
  -- Determine product_id based on trigger operation
  IF TG_OP = 'DELETE' THEN
    target_product_id := OLD.product_id;
  ELSE
    target_product_id := NEW.product_id;
    -- For INSERT/UPDATE, only update if review is approved
    IF TG_OP = 'INSERT' AND NEW.is_approved = false THEN
      RETURN NEW;
    END IF;
    IF TG_OP = 'UPDATE' AND NEW.is_approved = false AND OLD.is_approved = false THEN
      RETURN NEW;
    END IF;
  END IF;
  
  -- Recalculate average rating and count for the product
  UPDATE public.products
  SET 
    rating_average = (
      SELECT COALESCE(AVG(rating)::DECIMAL(3,2), 0.00)
      FROM public.reviews
      WHERE product_id = target_product_id AND is_approved = true
    ),
    rating_count = (
      SELECT COUNT(*)
      FROM public.reviews
      WHERE product_id = target_product_id AND is_approved = true
    )
  WHERE id = target_product_id;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_product_rating_on_review
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_product_rating();

-- =============================================================================
-- COUPONS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  
  -- Discount type and amount
  discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed')) NOT NULL,
  discount_value DECIMAL(10, 2) NOT NULL,
  max_discount_amount DECIMAL(10, 2), -- For percentage discounts
  
  -- Minimum order amount
  min_order_amount DECIMAL(10, 2) DEFAULT 0.00,
  
  -- Usage limits
  max_uses INTEGER, -- Total uses allowed (NULL = unlimited)
  max_uses_per_user INTEGER DEFAULT 1,
  used_count INTEGER DEFAULT 0,
  
  -- Validity
  valid_from TIMESTAMPTZ NOT NULL,
  valid_until TIMESTAMPTZ NOT NULL,
  
  -- Applicability
  applicable_to TEXT CHECK (applicable_to IN ('all', 'category', 'brand', 'product')) DEFAULT 'all',
  applicable_ids UUID[], -- Array of category/brand/product IDs
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_is_active ON public.coupons(is_active);
CREATE INDEX IF NOT EXISTS idx_coupons_valid_until ON public.coupons(valid_until);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Public can view active coupons
CREATE POLICY "Public can view active coupons" ON public.coupons
  FOR SELECT USING (is_active = true AND valid_from <= NOW() AND valid_until >= NOW());

-- Only service role can manage coupons
CREATE POLICY "Service role can manage coupons" ON public.coupons
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

CREATE TRIGGER update_coupons_updated_at
  BEFORE UPDATE ON public.coupons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- WALLET TRANSACTIONS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Transaction details
  type TEXT CHECK (type IN ('credit', 'debit')) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  balance_after DECIMAL(10, 2) NOT NULL, -- Wallet balance after this transaction
  
  -- Reference (what caused this transaction)
  reference_type TEXT, -- 'order', 'refund', 'topup', 'reward', 'payment'
  reference_id UUID, -- ID of the related order/transaction
  
  -- Description
  description TEXT,
  
  -- Status
  status TEXT CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')) DEFAULT 'completed',
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id ON public.wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_type ON public.wallet_transactions(type);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_reference ON public.wallet_transactions(reference_type, reference_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_created_at ON public.wallet_transactions(created_at DESC);

ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

-- Users can only view their own wallet transactions
CREATE POLICY "Users can view own wallet transactions" ON public.wallet_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Only service role can insert wallet transactions
CREATE POLICY "Service role can manage wallet transactions" ON public.wallet_transactions
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- Function to update user wallet balance on transaction
CREATE OR REPLACE FUNCTION update_user_wallet_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND NEW.type = 'credit' THEN
    UPDATE public.users
    SET wallet_balance = wallet_balance + NEW.amount
    WHERE id = NEW.user_id;
  ELSIF NEW.status = 'completed' AND NEW.type = 'debit' THEN
    UPDATE public.users
    SET wallet_balance = wallet_balance - NEW.amount
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_wallet_balance_on_transaction
  AFTER INSERT ON public.wallet_transactions
  FOR EACH ROW
  WHEN (NEW.status = 'completed')
  EXECUTE FUNCTION update_user_wallet_balance();

-- =============================================================================
-- COMMENTS
-- =============================================================================
COMMENT ON TABLE public.product_variants IS 'Product variants (sizes, colors, formats, etc.)';
COMMENT ON TABLE public.cart_items IS 'Shopping cart items';
COMMENT ON TABLE public.wishlist IS 'User wishlist items';
COMMENT ON TABLE public.reviews IS 'Product reviews and ratings';
COMMENT ON TABLE public.coupons IS 'Discount coupons';
COMMENT ON TABLE public.wallet_transactions IS 'Wallet transaction history';

-- =============================================================================
-- DONE!
-- =============================================================================
