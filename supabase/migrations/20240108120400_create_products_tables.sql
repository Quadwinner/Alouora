-- =============================================================================
-- MIGRATION 5: CATEGORIES, BRANDS, AND PRODUCTS TABLES
-- =============================================================================

-- =============================================================================
-- CATEGORIES TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON public.categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON public.categories(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_display_order ON public.categories(display_order);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Public read access for categories
CREATE POLICY "Categories are publicly readable" ON public.categories
  FOR SELECT USING (true);

-- Only service role can manage categories
CREATE POLICY "Service role can manage categories" ON public.categories
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- BRANDS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  website_url TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_brands_slug ON public.brands(slug);
CREATE INDEX IF NOT EXISTS idx_brands_is_active ON public.brands(is_active);
CREATE INDEX IF NOT EXISTS idx_brands_display_order ON public.brands(display_order);

ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

-- Public read access for brands
CREATE POLICY "Brands are publicly readable" ON public.brands
  FOR SELECT USING (true);

-- Only service role can manage brands
CREATE POLICY "Service role can manage brands" ON public.brands
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

CREATE TRIGGER update_brands_updated_at
  BEFORE UPDATE ON public.brands
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- PRODUCTS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  brand_id UUID REFERENCES public.brands(id) ON DELETE SET NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  
  -- Product Information
  description TEXT,
  ingredients TEXT[],
  how_to_use TEXT[],
  
  -- Pricing
  price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2),
  discount_percentage INTEGER,
  
  -- Images
  images TEXT[],
  thumbnail TEXT,
  
  -- Inventory
  stock_quantity INTEGER DEFAULT 0,
  sku TEXT UNIQUE,
  
  -- Status & Features
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  
  -- Ratings & Reviews
  rating_average DECIMAL(3, 2) DEFAULT 0.00,
  rating_count INTEGER DEFAULT 0,
  
  -- Analytics
  sales_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  
  -- Badges (e.g., "NEW", "BESTSELLER", "EXCLUSIVE", "30% OFF")
  badges TEXT[],
  
  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for products
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_brand_id ON public.products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON public.products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_products_rating_average ON public.products(rating_average DESC);
CREATE INDEX IF NOT EXISTS idx_products_sales_count ON public.products(sales_count DESC);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);

-- Full-text search index (for product search)
CREATE INDEX IF NOT EXISTS idx_products_search ON public.products USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Public read access for active products
CREATE POLICY "Active products are publicly readable" ON public.products
  FOR SELECT USING (is_active = true);

-- Only service role can manage products
CREATE POLICY "Service role can manage products" ON public.products
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate discount percentage
CREATE OR REPLACE FUNCTION calculate_discount_percentage()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.original_price IS NOT NULL AND NEW.original_price > 0 AND NEW.price < NEW.original_price THEN
    NEW.discount_percentage := ROUND(((NEW.original_price - NEW.price) / NEW.original_price) * 100);
  ELSE
    NEW.discount_percentage := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_product_discount
  BEFORE INSERT OR UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION calculate_discount_percentage();

-- =============================================================================
-- COMMENTS
-- =============================================================================
COMMENT ON TABLE public.categories IS 'Product categories (supports hierarchical structure)';
COMMENT ON TABLE public.brands IS 'Product brands';
COMMENT ON TABLE public.products IS 'Product catalog';
COMMENT ON COLUMN public.products.ingredients IS 'Array of ingredient strings';
COMMENT ON COLUMN public.products.how_to_use IS 'Array of usage instruction strings';
COMMENT ON COLUMN public.products.images IS 'Array of image URLs';
COMMENT ON COLUMN public.products.badges IS 'Array of badge strings (e.g., "NEW", "BESTSELLER")';

-- =============================================================================
-- DONE!
-- =============================================================================
