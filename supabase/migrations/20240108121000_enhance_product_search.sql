-- =============================================================================
-- MIGRATION: ENHANCE PRODUCT SEARCH
-- =============================================================================
-- Improve full-text search index to include brand and category names
-- =============================================================================

-- Drop existing search index if it exists
DROP INDEX IF EXISTS public.idx_products_search;

-- Create enhanced full-text search index
-- This includes product name, description, and will be joined with brand/category names
CREATE INDEX IF NOT EXISTS idx_products_search ON public.products 
USING gin(
  to_tsvector('english', 
    COALESCE(name, '') || ' ' || 
    COALESCE(description, '') || ' ' ||
    COALESCE(sku, '')
  )
);

-- Create a materialized search document column for better full-text search
-- This will be updated via trigger when product is created/updated
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS search_document tsvector;

-- Create function to update search document
CREATE OR REPLACE FUNCTION update_product_search_document()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_document := 
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.sku, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update search document
DROP TRIGGER IF EXISTS update_product_search_document_trigger ON public.products;
CREATE TRIGGER update_product_search_document_trigger
  BEFORE INSERT OR UPDATE OF name, description, sku ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION update_product_search_document();

-- Update existing products
UPDATE public.products SET 
  search_document = 
    setweight(to_tsvector('english', COALESCE(name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(sku, '')), 'C');

-- Create GIN index on search_document for fast full-text search
CREATE INDEX IF NOT EXISTS idx_products_search_document ON public.products 
USING gin(search_document);

-- Create a search function that uses the search_document
CREATE OR REPLACE FUNCTION search_products_fts(search_term TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  price DECIMAL(10, 2),
  original_price DECIMAL(10, 2),
  discount_percentage INTEGER,
  thumbnail TEXT,
  images TEXT[],
  rating_average DECIMAL(3, 2),
  rating_count INTEGER,
  badges TEXT[],
  is_featured BOOLEAN,
  stock_quantity INTEGER,
  category_id UUID,
  brand_id UUID,
  relevance REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.slug,
    p.price,
    p.original_price,
    p.discount_percentage,
    p.thumbnail,
    p.images,
    p.rating_average,
    p.rating_count,
    p.badges,
    p.is_featured,
    p.stock_quantity,
    p.category_id,
    p.brand_id,
    ts_rank(p.search_document, plainto_tsquery('english', search_term)) AS relevance
  FROM public.products p
  WHERE 
    p.is_active = true
    AND (
      p.search_document @@ plainto_tsquery('english', search_term)
      OR p.name ILIKE '%' || search_term || '%'
      OR p.sku ILIKE '%' || search_term || '%'
    )
  ORDER BY 
    -- Prioritize exact name matches
    CASE WHEN p.name ILIKE search_term THEN 1 ELSE 2 END,
    -- Then by relevance score
    relevance DESC,
    -- Then by popularity
    p.sales_count DESC;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION search_products_fts IS 'Full-text search function for products using search_document column';
