-- =============================================================================
-- MIGRATION: ENHANCED SEARCH WITH CATEGORY AND BRAND MATCHING
-- =============================================================================
-- Improves search to find products by category name, brand name, 
-- partial matches, and common synonyms
-- =============================================================================

-- Drop existing search function to recreate with enhanced logic
DROP FUNCTION IF EXISTS search_products_fts(TEXT);
DROP FUNCTION IF EXISTS search_products_enhanced(TEXT, INTEGER, INTEGER);

-- Create enhanced search function that searches across products, categories, and brands
CREATE OR REPLACE FUNCTION search_products_enhanced(
  search_term TEXT,
  result_limit INTEGER DEFAULT 50,
  result_offset INTEGER DEFAULT 0
)
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
  brand_name TEXT,
  brand_slug TEXT,
  category_name TEXT,
  category_slug TEXT,
  match_type TEXT,
  relevance REAL
) AS $$
DECLARE
  normalized_term TEXT;
  search_patterns TEXT[];
BEGIN
  -- Normalize and prepare search term
  normalized_term := LOWER(TRIM(search_term));
  
  -- Handle common singular/plural variations
  -- e.g., "lipsticks" -> also search "lipstick"
  -- e.g., "lipstick" -> also search "lipsticks"
  search_patterns := ARRAY[normalized_term];
  
  -- Add singular form if plural (ends with 's')
  IF normalized_term LIKE '%s' AND LENGTH(normalized_term) > 3 THEN
    search_patterns := array_append(search_patterns, RTRIM(normalized_term, 's'));
  END IF;
  
  -- Add plural form if singular (add 's')
  IF normalized_term NOT LIKE '%s' AND LENGTH(normalized_term) > 2 THEN
    search_patterns := array_append(search_patterns, normalized_term || 's');
  END IF;
  
  -- Handle 'ies' -> 'y' conversion (e.g., "accessories" -> "accessory")
  IF normalized_term LIKE '%ies' THEN
    search_patterns := array_append(search_patterns, RTRIM(normalized_term, 'ies') || 'y');
  END IF;
  
  -- Handle 'y' -> 'ies' conversion
  IF normalized_term LIKE '%y' AND normalized_term NOT LIKE '%ey' THEN
    search_patterns := array_append(search_patterns, RTRIM(normalized_term, 'y') || 'ies');
  END IF;

  RETURN QUERY
  WITH 
  -- Find matching categories
  matching_categories AS (
    SELECT c.id, c.name AS cat_name, c.slug AS cat_slug
    FROM public.categories c
    WHERE c.is_active = true
    AND (
      LOWER(c.name) ILIKE '%' || ANY(search_patterns) || '%'
      OR LOWER(c.slug) ILIKE '%' || ANY(search_patterns) || '%'
    )
  ),
  -- Find matching brands  
  matching_brands AS (
    SELECT b.id, b.name AS brand_name, b.slug AS brand_slug
    FROM public.brands b
    WHERE b.is_active = true
    AND (
      LOWER(b.name) ILIKE '%' || ANY(search_patterns) || '%'
      OR LOWER(b.slug) ILIKE '%' || ANY(search_patterns) || '%'
    )
  ),
  -- Combined search results with match type
  search_results AS (
    -- Direct product name/description/SKU matches (highest priority)
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
      b.name AS brand_name,
      b.slug AS brand_slug,
      c.name AS category_name,
      c.slug AS category_slug,
      'product_match'::TEXT AS match_type,
      CASE 
        WHEN LOWER(p.name) = normalized_term THEN 100.0
        WHEN LOWER(p.name) LIKE normalized_term || '%' THEN 90.0
        WHEN LOWER(p.name) LIKE '%' || normalized_term || '%' THEN 80.0
        WHEN p.search_document @@ plainto_tsquery('english', search_term) THEN 
          70.0 + ts_rank(p.search_document, plainto_tsquery('english', search_term)) * 10
        ELSE 50.0
      END AS relevance
    FROM public.products p
    LEFT JOIN public.brands b ON p.brand_id = b.id
    LEFT JOIN public.categories c ON p.category_id = c.id
    WHERE p.is_active = true
    AND (
      -- Full-text search on indexed document
      p.search_document @@ plainto_tsquery('english', search_term)
      -- Or ILIKE pattern matching for partial/fuzzy matches
      OR LOWER(p.name) ILIKE '%' || normalized_term || '%'
      OR LOWER(p.description) ILIKE '%' || normalized_term || '%'
      OR LOWER(p.sku) ILIKE '%' || normalized_term || '%'
      -- Also match singular/plural variations
      OR LOWER(p.name) ILIKE '%' || ANY(search_patterns) || '%'
    )
    
    UNION ALL
    
    -- Products from matching categories (e.g., search "lipsticks" finds all lipstick products)
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
      b.name AS brand_name,
      b.slug AS brand_slug,
      mc.cat_name AS category_name,
      mc.cat_slug AS category_slug,
      'category_match'::TEXT AS match_type,
      40.0 + (p.sales_count::REAL / 1000.0) AS relevance
    FROM public.products p
    INNER JOIN matching_categories mc ON p.category_id = mc.id
    LEFT JOIN public.brands b ON p.brand_id = b.id
    WHERE p.is_active = true
    -- Exclude products already matched by direct search
    AND NOT EXISTS (
      SELECT 1 FROM public.products p2 
      WHERE p2.id = p.id
      AND (
        p2.search_document @@ plainto_tsquery('english', search_term)
        OR LOWER(p2.name) ILIKE '%' || normalized_term || '%'
        OR LOWER(p2.description) ILIKE '%' || normalized_term || '%'
      )
    )
    
    UNION ALL
    
    -- Products from matching brands (e.g., search "MAC" finds all MAC products)
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
      mb.brand_name,
      mb.brand_slug,
      c.name AS category_name,
      c.slug AS category_slug,
      'brand_match'::TEXT AS match_type,
      35.0 + (p.sales_count::REAL / 1000.0) AS relevance
    FROM public.products p
    INNER JOIN matching_brands mb ON p.brand_id = mb.id
    LEFT JOIN public.categories c ON p.category_id = c.id
    WHERE p.is_active = true
    -- Exclude products already matched
    AND NOT EXISTS (
      SELECT 1 FROM public.products p2 
      WHERE p2.id = p.id
      AND (
        p2.search_document @@ plainto_tsquery('english', search_term)
        OR LOWER(p2.name) ILIKE '%' || normalized_term || '%'
        OR p2.category_id IN (SELECT id FROM matching_categories)
      )
    )
  )
  -- Final results with deduplication and ordering
  SELECT DISTINCT ON (sr.id)
    sr.id,
    sr.name,
    sr.slug,
    sr.price,
    sr.original_price,
    sr.discount_percentage,
    sr.thumbnail,
    sr.images,
    sr.rating_average,
    sr.rating_count,
    sr.badges,
    sr.is_featured,
    sr.stock_quantity,
    sr.category_id,
    sr.brand_id,
    sr.brand_name,
    sr.brand_slug,
    sr.category_name,
    sr.category_slug,
    sr.match_type,
    sr.relevance
  FROM search_results sr
  ORDER BY sr.id, sr.relevance DESC;
  
END;
$$ LANGUAGE plpgsql STABLE;

-- Create a simpler version for basic search (backward compatible)
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
    r.id,
    r.name,
    r.slug,
    r.price,
    r.original_price,
    r.discount_percentage,
    r.thumbnail,
    r.images,
    r.rating_average,
    r.rating_count,
    r.badges,
    r.is_featured,
    r.stock_quantity,
    r.category_id,
    r.brand_id,
    r.relevance
  FROM search_products_enhanced(search_term, 100, 0) r
  ORDER BY r.relevance DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- Add common search synonyms/aliases table for future expansion
CREATE TABLE IF NOT EXISTS public.search_synonyms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  term TEXT NOT NULL,
  synonyms TEXT[] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert common beauty product synonyms
INSERT INTO public.search_synonyms (term, synonyms) VALUES
  ('lipstick', ARRAY['lipsticks', 'lip color', 'lip colour', 'lip stick', 'lippie', 'lippies']),
  ('foundation', ARRAY['foundations', 'base', 'face base', 'skin base']),
  ('mascara', ARRAY['mascaras', 'lashes', 'lash']),
  ('eyeliner', ARRAY['eyeliners', 'eye liner', 'liner', 'kajal', 'kohl']),
  ('eyeshadow', ARRAY['eyeshadows', 'eye shadow', 'eye shadows', 'eye color']),
  ('blush', ARRAY['blushes', 'blusher', 'cheek color', 'rouge']),
  ('concealer', ARRAY['concealers', 'corrector', 'correctors']),
  ('primer', ARRAY['primers', 'face primer', 'makeup primer']),
  ('moisturizer', ARRAY['moisturizers', 'moisturiser', 'moisturisers', 'hydrator', 'cream']),
  ('serum', ARRAY['serums', 'face serum', 'skin serum']),
  ('sunscreen', ARRAY['sunscreens', 'sunblock', 'spf', 'sun protection']),
  ('cleanser', ARRAY['cleansers', 'face wash', 'facewash', 'cleanser']),
  ('toner', ARRAY['toners', 'face toner', 'skin toner']),
  ('lipgloss', ARRAY['lip gloss', 'lip glosses', 'gloss', 'glosses']),
  ('highlighter', ARRAY['highlighters', 'illuminator', 'glow']),
  ('bronzer', ARRAY['bronzers', 'contour', 'contouring']),
  ('perfume', ARRAY['perfumes', 'fragrance', 'fragrances', 'scent', 'cologne']),
  ('nail polish', ARRAY['nail polishes', 'nail color', 'nail lacquer', 'nail paint']),
  ('shampoo', ARRAY['shampoos', 'hair wash', 'hair cleanser']),
  ('conditioner', ARRAY['conditioners', 'hair conditioner'])
ON CONFLICT DO NOTHING;

-- Create index on synonyms for fast lookup
CREATE INDEX IF NOT EXISTS idx_search_synonyms_term ON public.search_synonyms(term);
CREATE INDEX IF NOT EXISTS idx_search_synonyms_synonyms ON public.search_synonyms USING gin(synonyms);

COMMENT ON FUNCTION search_products_enhanced IS 'Enhanced product search that includes category and brand name matching, with singular/plural handling';
COMMENT ON TABLE public.search_synonyms IS 'Common search term synonyms for improved search experience';
