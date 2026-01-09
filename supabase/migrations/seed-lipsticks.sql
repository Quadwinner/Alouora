-- =============================================================================
-- SEED DATA: LIPSTICK PRODUCTS
-- =============================================================================
-- This script seeds sample lipstick products for the products listing page

-- First, insert the category if it doesn't exist
INSERT INTO public.categories (id, name, slug, description, image_url, parent_id, display_order, is_active)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Lipstick',
  'lipstick',
  'Find your perfect lip color from our wide range of lipsticks, lip glosses, lip tints, and more.',
  '/images/makeup/lipsticks/banner.png',
  NULL,
  1,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url;

-- Insert a brand if it doesn't exist
INSERT INTO public.brands (id, name, slug, description, logo_url, is_active, display_order)
VALUES 
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567891', 'Maybelline', 'maybelline', 'Maybelline New York - Maybe she''s born with it', '/images/brands/maybelline.png', true, 1),
  ('b2b2c3d4-e5f6-7890-abcd-ef1234567892', 'L''Oreal Paris', 'loreal-paris', 'Because you''re worth it', '/images/brands/loreal.png', true, 2),
  ('b3b2c3d4-e5f6-7890-abcd-ef1234567893', 'MAC', 'mac', 'Professional quality makeup', '/images/brands/mac.png', true, 3),
  ('b4b2c3d4-e5f6-7890-abcd-ef1234567894', 'NYX', 'nyx', 'Professional makeup at affordable prices', '/images/brands/nyx.png', true, 4)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- Get the category ID (in case it already existed with a different ID)
DO $$
DECLARE
  lipstick_category_id UUID;
  maybelline_id UUID;
  loreal_id UUID;
  mac_id UUID;
  nyx_id UUID;
BEGIN
  SELECT id INTO lipstick_category_id FROM public.categories WHERE slug = 'lipstick';
  SELECT id INTO maybelline_id FROM public.brands WHERE slug = 'maybelline';
  SELECT id INTO loreal_id FROM public.brands WHERE slug = 'loreal-paris';
  SELECT id INTO mac_id FROM public.brands WHERE slug = 'mac';
  SELECT id INTO nyx_id FROM public.brands WHERE slug = 'nyx';

  -- Insert sample lipstick products
  INSERT INTO public.products (
    name, slug, brand_id, category_id, description,
    price, original_price, images, thumbnail,
    stock_quantity, sku, is_active, is_featured,
    rating_average, rating_count, sales_count, view_count, badges
  )
  VALUES 
    -- Product 1
    (
      'Super Stay Vinyl Ink Liquid Lipstick',
      'super-stay-vinyl-ink-liquid-lipstick-1',
      maybelline_id,
      lipstick_category_id,
      'Liquid lipstick with up to 16hr wear and bold vinyl finish. Smudge-proof. Transfer-proof. Sweat-resistant.',
      17.00, 34.00,
      ARRAY['/images/makeup/lipsticks/products/product-1.png'],
      '/images/makeup/lipsticks/products/product-1.png',
      150, 'MBL-VINYL-001', true, true,
      4.8, 79603, 45000, 120000,
      ARRAY['FEATURED', 'BESTSELLER', 'NEW', 'GIFT']
    ),
    -- Product 2
    (
      'Super Stay Matte Ink Liquid Lipstick',
      'super-stay-matte-ink-liquid-lipstick',
      maybelline_id,
      lipstick_category_id,
      'Intense matte color that lasts up to 16 hours. Highly pigmented and comfortable to wear.',
      15.00, 30.00,
      ARRAY['/images/makeup/lipsticks/products/product-1.png'],
      '/images/makeup/lipsticks/products/product-1.png',
      200, 'MBL-MATTE-001', true, true,
      4.7, 65432, 38000, 95000,
      ARRAY['BESTSELLER', 'NEW']
    ),
    -- Product 3
    (
      'Color Riche Satin Lipstick',
      'color-riche-satin-lipstick',
      loreal_id,
      lipstick_category_id,
      'Rich, creamy satin finish lipstick infused with Vitamin E for smooth, comfortable lips.',
      14.99, 24.99,
      ARRAY['/images/makeup/lipsticks/products/product-1.png'],
      '/images/makeup/lipsticks/products/product-1.png',
      180, 'LOR-SATIN-001', true, false,
      4.5, 45678, 28000, 75000,
      ARRAY['FEATURED']
    ),
    -- Product 4
    (
      'Rouge Diva Velvet Lip Color',
      'rouge-diva-velvet-lip-color',
      loreal_id,
      lipstick_category_id,
      'Luxurious velvet matte finish with buildable color intensity and all-day comfort.',
      18.00, 32.00,
      ARRAY['/images/makeup/lipsticks/products/product-1.png'],
      '/images/makeup/lipsticks/products/product-1.png',
      120, 'LOR-VELVET-001', true, true,
      4.6, 34567, 22000, 68000,
      ARRAY['NEW', 'GIFT']
    ),
    -- Product 5
    (
      'Retro Matte Lipstick',
      'retro-matte-lipstick',
      mac_id,
      lipstick_category_id,
      'Iconic matte finish with rich, saturated color. Long-wearing and bold.',
      21.00, 28.00,
      ARRAY['/images/makeup/lipsticks/products/product-1.png'],
      '/images/makeup/lipsticks/products/product-1.png',
      90, 'MAC-RETRO-001', true, true,
      4.9, 89012, 52000, 145000,
      ARRAY['BESTSELLER', 'EXCLUSIVE']
    ),
    -- Product 6
    (
      'Lustreglass Sheer-Shine Lipstick',
      'lustreglass-sheer-shine-lipstick',
      mac_id,
      lipstick_category_id,
      'Jelly-shine formula with sheer, buildable color. Hydrating and comfortable.',
      24.00, 24.00,
      ARRAY['/images/makeup/lipsticks/products/product-1.png'],
      '/images/makeup/lipsticks/products/product-1.png',
      75, 'MAC-LUSTRE-001', true, false,
      4.4, 23456, 15000, 52000,
      ARRAY['NEW']
    ),
    -- Product 7
    (
      'Soft Matte Lip Cream',
      'soft-matte-lip-cream',
      nyx_id,
      lipstick_category_id,
      'Lightweight matte finish with intense color payoff. Creamy and blendable.',
      8.00, 12.00,
      ARRAY['/images/makeup/lipsticks/products/product-1.png'],
      '/images/makeup/lipsticks/products/product-1.png',
      300, 'NYX-SOFT-001', true, false,
      4.3, 56789, 35000, 88000,
      ARRAY['BESTSELLER']
    ),
    -- Product 8
    (
      'Lip Lingerie XXL Matte Liquid Lipstick',
      'lip-lingerie-xxl-matte-liquid-lipstick',
      nyx_id,
      lipstick_category_id,
      'Weightless matte formula with up to 16hr wear. Buildable coverage.',
      10.00, 16.00,
      ARRAY['/images/makeup/lipsticks/products/product-1.png'],
      '/images/makeup/lipsticks/products/product-1.png',
      250, 'NYX-LINGERIE-001', true, true,
      4.5, 67890, 42000, 95000,
      ARRAY['FEATURED', 'NEW', 'GIFT']
    ),
    -- Product 9
    (
      'Butter Gloss',
      'butter-gloss',
      nyx_id,
      lipstick_category_id,
      'Silky smooth gloss with sheer to medium coverage. Never sticky, always shiny.',
      6.00, 10.00,
      ARRAY['/images/makeup/lipsticks/products/product-1.png'],
      '/images/makeup/lipsticks/products/product-1.png',
      400, 'NYX-BUTTER-001', true, false,
      4.6, 78901, 48000, 112000,
      ARRAY['BESTSELLER']
    ),
    -- Product 10
    (
      'Lifter Gloss with Hyaluronic Acid',
      'lifter-gloss-hyaluronic-acid',
      maybelline_id,
      lipstick_category_id,
      'Plumping lip gloss with hyaluronic acid for fuller-looking lips. XL wand for easy application.',
      11.00, 18.00,
      ARRAY['/images/makeup/lipsticks/products/product-1.png'],
      '/images/makeup/lipsticks/products/product-1.png',
      220, 'MBL-LIFTER-001', true, true,
      4.7, 45678, 32000, 78000,
      ARRAY['FEATURED', 'NEW']
    ),
    -- Product 11
    (
      'Color Sensational Ultimatte Slim Lipstick',
      'color-sensational-ultimatte-slim-lipstick',
      maybelline_id,
      lipstick_category_id,
      'Ultra-slim lipstick with precise application and blurring matte finish.',
      12.00, 20.00,
      ARRAY['/images/makeup/lipsticks/products/product-1.png'],
      '/images/makeup/lipsticks/products/product-1.png',
      180, 'MBL-ULTIMATTE-001', true, false,
      4.4, 34567, 25000, 65000,
      ARRAY['NEW']
    ),
    -- Product 12
    (
      'Infallible Matte Resistance Liquid Lipstick',
      'infallible-matte-resistance-liquid-lipstick',
      loreal_id,
      lipstick_category_id,
      'Transfer-proof matte liquid lipstick with up to 16hr wear. Lightweight and comfortable.',
      14.00, 22.00,
      ARRAY['/images/makeup/lipsticks/products/product-1.png'],
      '/images/makeup/lipsticks/products/product-1.png',
      160, 'LOR-INFALLIBLE-001', true, true,
      4.5, 56789, 38000, 92000,
      ARRAY['FEATURED', 'BESTSELLER']
    ),
    -- Product 13
    (
      'Ruby Woo Lipstick',
      'ruby-woo-lipstick',
      mac_id,
      lipstick_category_id,
      'The iconic red retro matte lipstick. Long-wearing, saturated color.',
      23.00, 23.00,
      ARRAY['/images/makeup/lipsticks/products/product-1.png'],
      '/images/makeup/lipsticks/products/product-1.png',
      85, 'MAC-RUBY-001', true, true,
      4.9, 98765, 65000, 180000,
      ARRAY['BESTSELLER', 'EXCLUSIVE']
    ),
    -- Product 14
    (
      'Suede Matte Lipstick',
      'suede-matte-lipstick',
      nyx_id,
      lipstick_category_id,
      'Smooth matte finish with rich, velvety color. Comfortable all-day wear.',
      9.00, 14.00,
      ARRAY['/images/makeup/lipsticks/products/product-1.png'],
      '/images/makeup/lipsticks/products/product-1.png',
      280, 'NYX-SUEDE-001', true, false,
      4.2, 43210, 28000, 72000,
      ARRAY[]::TEXT[]
    ),
    -- Product 15
    (
      'Powder Puff Lippie Lip Cream',
      'powder-puff-lippie-lip-cream',
      nyx_id,
      lipstick_category_id,
      'Cushiony soft powder finish with buildable color. Unique puff applicator.',
      11.00, 18.00,
      ARRAY['/images/makeup/lipsticks/products/product-1.png'],
      '/images/makeup/lipsticks/products/product-1.png',
      190, 'NYX-POWDER-001', true, false,
      4.4, 32109, 22000, 58000,
      ARRAY['NEW', 'GIFT']
    )
  ON CONFLICT (slug) DO UPDATE SET
    price = EXCLUDED.price,
    original_price = EXCLUDED.original_price,
    rating_average = EXCLUDED.rating_average,
    rating_count = EXCLUDED.rating_count,
    sales_count = EXCLUDED.sales_count,
    badges = EXCLUDED.badges;
    
END $$;

-- Verify data
SELECT 
  p.name,
  p.slug,
  b.name as brand,
  c.name as category,
  p.price,
  p.original_price,
  p.discount_percentage,
  p.rating_average,
  p.badges
FROM public.products p
LEFT JOIN public.brands b ON p.brand_id = b.id
LEFT JOIN public.categories c ON p.category_id = c.id
WHERE c.slug = 'lipstick'
ORDER BY p.sales_count DESC;

-- Show counts
SELECT 
  'Total Lipstick Products' as metric,
  COUNT(*) as count
FROM public.products p
JOIN public.categories c ON p.category_id = c.id
WHERE c.slug = 'lipstick';
