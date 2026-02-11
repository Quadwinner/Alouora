-- =============================================================================
-- SEED DATA: SUB-CATEGORIES FOR ALL MAIN CATEGORIES
-- =============================================================================
-- Adds sub-categories under each main navigation category.
-- Uses parent_id to link to the parent category.

DO $$
DECLARE
  makeup_id UUID;
  skin_id UUID;
  hair_id UUID;
  appliances_id UUID;
  bath_body_id UUID;
  natural_id UUID;
  mom_baby_id UUID;
  health_id UUID;
  men_id UUID;
  fragrance_id UUID;
BEGIN
  -- Get parent category IDs
  SELECT id INTO makeup_id FROM public.categories WHERE slug = 'makeup';
  SELECT id INTO skin_id FROM public.categories WHERE slug = 'skin';
  SELECT id INTO hair_id FROM public.categories WHERE slug = 'hair';
  SELECT id INTO appliances_id FROM public.categories WHERE slug = 'appliances';
  SELECT id INTO bath_body_id FROM public.categories WHERE slug = 'bath-body';
  SELECT id INTO natural_id FROM public.categories WHERE slug = 'natural';
  SELECT id INTO mom_baby_id FROM public.categories WHERE slug = 'mom-baby';
  SELECT id INTO health_id FROM public.categories WHERE slug = 'health-wellness';
  SELECT id INTO men_id FROM public.categories WHERE slug = 'men';
  SELECT id INTO fragrance_id FROM public.categories WHERE slug = 'fragrance';

  -- =========================================================================
  -- MAKEUP sub-categories
  -- =========================================================================
  INSERT INTO public.categories (name, slug, parent_id, display_order, is_active) VALUES
    ('Lipstick', 'makeup-lipstick', makeup_id, 1, true),
    ('Foundation', 'makeup-foundation', makeup_id, 2, true),
    ('Concealer', 'makeup-concealer', makeup_id, 3, true),
    ('Eye Shadow', 'makeup-eye-shadow', makeup_id, 4, true),
    ('Mascara', 'makeup-mascara', makeup_id, 5, true),
    ('Eyeliner', 'makeup-eyeliner', makeup_id, 6, true),
    ('Blush', 'makeup-blush', makeup_id, 7, true),
    ('Primer', 'makeup-primer', makeup_id, 8, true),
    ('Setting Spray', 'makeup-setting-spray', makeup_id, 9, true),
    ('Compact Powder', 'makeup-compact-powder', makeup_id, 10, true),
    ('Nail Polish', 'makeup-nail-polish', makeup_id, 11, true),
    ('Makeup Kits', 'makeup-kits', makeup_id, 12, true)
  ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, display_order = EXCLUDED.display_order;

  -- =========================================================================
  -- SKIN sub-categories
  -- =========================================================================
  INSERT INTO public.categories (name, slug, parent_id, display_order, is_active) VALUES
    ('Cleanser', 'skin-cleanser', skin_id, 1, true),
    ('Moisturizer', 'skin-moisturizer', skin_id, 2, true),
    ('Serum', 'skin-serum', skin_id, 3, true),
    ('Sunscreen', 'skin-sunscreen', skin_id, 4, true),
    ('Face Wash', 'skin-face-wash', skin_id, 5, true),
    ('Toner', 'skin-toner', skin_id, 6, true),
    ('Face Mask', 'skin-face-mask', skin_id, 7, true),
    ('Eye Cream', 'skin-eye-cream', skin_id, 8, true),
    ('Lip Care', 'skin-lip-care', skin_id, 9, true),
    ('Acne Treatment', 'skin-acne-treatment', skin_id, 10, true)
  ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, display_order = EXCLUDED.display_order;

  -- =========================================================================
  -- HAIR sub-categories
  -- =========================================================================
  INSERT INTO public.categories (name, slug, parent_id, display_order, is_active) VALUES
    ('Shampoo', 'hair-shampoo', hair_id, 1, true),
    ('Conditioner', 'hair-conditioner', hair_id, 2, true),
    ('Hair Oil', 'hair-oil', hair_id, 3, true),
    ('Hair Serum', 'hair-serum', hair_id, 4, true),
    ('Hair Mask', 'hair-mask', hair_id, 5, true),
    ('Hair Color', 'hair-color', hair_id, 6, true),
    ('Hair Styling', 'hair-styling', hair_id, 7, true),
    ('Anti Hair Fall', 'hair-anti-fall', hair_id, 8, true)
  ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, display_order = EXCLUDED.display_order;

  -- =========================================================================
  -- APPLIANCES sub-categories
  -- =========================================================================
  INSERT INTO public.categories (name, slug, parent_id, display_order, is_active) VALUES
    ('Hair Dryer', 'appliances-hair-dryer', appliances_id, 1, true),
    ('Straightener', 'appliances-straightener', appliances_id, 2, true),
    ('Curling Iron', 'appliances-curling-iron', appliances_id, 3, true),
    ('Trimmer', 'appliances-trimmer', appliances_id, 4, true),
    ('Face Massager', 'appliances-face-massager', appliances_id, 5, true),
    ('Epilator', 'appliances-epilator', appliances_id, 6, true)
  ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, display_order = EXCLUDED.display_order;

  -- =========================================================================
  -- BATH & BODY sub-categories
  -- =========================================================================
  INSERT INTO public.categories (name, slug, parent_id, display_order, is_active) VALUES
    ('Body Wash', 'bath-body-wash', bath_body_id, 1, true),
    ('Body Lotion', 'bath-body-lotion', bath_body_id, 2, true),
    ('Body Scrub', 'bath-body-scrub', bath_body_id, 3, true),
    ('Body Butter', 'bath-body-butter', bath_body_id, 4, true),
    ('Hand Cream', 'bath-hand-cream', bath_body_id, 5, true),
    ('Deodorant', 'bath-deodorant', bath_body_id, 6, true),
    ('Shower Gel', 'bath-shower-gel', bath_body_id, 7, true)
  ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, display_order = EXCLUDED.display_order;

  -- =========================================================================
  -- NATURAL sub-categories
  -- =========================================================================
  INSERT INTO public.categories (name, slug, parent_id, display_order, is_active) VALUES
    ('Natural Skincare', 'natural-skincare', natural_id, 1, true),
    ('Natural Haircare', 'natural-haircare', natural_id, 2, true),
    ('Organic Makeup', 'natural-organic-makeup', natural_id, 3, true),
    ('Ayurvedic', 'natural-ayurvedic', natural_id, 4, true),
    ('Essential Oils', 'natural-essential-oils', natural_id, 5, true)
  ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, display_order = EXCLUDED.display_order;

  -- =========================================================================
  -- MOM & BABY sub-categories
  -- =========================================================================
  INSERT INTO public.categories (name, slug, parent_id, display_order, is_active) VALUES
    ('Baby Skincare', 'mom-baby-skincare', mom_baby_id, 1, true),
    ('Baby Bath', 'mom-baby-bath', mom_baby_id, 2, true),
    ('Baby Hair Care', 'mom-baby-hair', mom_baby_id, 3, true),
    ('Mom Skincare', 'mom-skincare', mom_baby_id, 4, true),
    ('Maternity Care', 'mom-maternity', mom_baby_id, 5, true)
  ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, display_order = EXCLUDED.display_order;

  -- =========================================================================
  -- HEALTH & WELLNESS sub-categories
  -- =========================================================================
  INSERT INTO public.categories (name, slug, parent_id, display_order, is_active) VALUES
    ('Supplements', 'health-supplements', health_id, 1, true),
    ('Vitamins', 'health-vitamins', health_id, 2, true),
    ('Proteins', 'health-proteins', health_id, 3, true),
    ('Immunity', 'health-immunity', health_id, 4, true),
    ('Weight Management', 'health-weight', health_id, 5, true),
    ('Sexual Wellness', 'health-sexual-wellness', health_id, 6, true)
  ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, display_order = EXCLUDED.display_order;

  -- =========================================================================
  -- MEN sub-categories
  -- =========================================================================
  INSERT INTO public.categories (name, slug, parent_id, display_order, is_active) VALUES
    ('Beard Care', 'men-beard-care', men_id, 1, true),
    ('Shaving', 'men-shaving', men_id, 2, true),
    ('Face Care', 'men-face-care', men_id, 3, true),
    ('Hair Care', 'men-hair-care', men_id, 4, true),
    ('Body Care', 'men-body-care', men_id, 5, true),
    ('Grooming Tools', 'men-grooming-tools', men_id, 6, true),
    ('Deodorant', 'men-deodorant', men_id, 7, true)
  ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, display_order = EXCLUDED.display_order;

  -- =========================================================================
  -- FRAGRANCE sub-categories
  -- =========================================================================
  INSERT INTO public.categories (name, slug, parent_id, display_order, is_active) VALUES
    ('Perfume', 'fragrance-perfume', fragrance_id, 1, true),
    ('Eau De Toilette', 'fragrance-edt', fragrance_id, 2, true),
    ('Body Mist', 'fragrance-body-mist', fragrance_id, 3, true),
    ('Attar', 'fragrance-attar', fragrance_id, 4, true),
    ('Gift Sets', 'fragrance-gift-sets', fragrance_id, 5, true)
  ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, display_order = EXCLUDED.display_order;

END $$;

-- Verify
SELECT 
  p.name AS parent,
  c.name AS sub_category,
  c.slug,
  c.display_order
FROM public.categories c
LEFT JOIN public.categories p ON c.parent_id = p.id
ORDER BY COALESCE(p.display_order, c.display_order), c.display_order;
