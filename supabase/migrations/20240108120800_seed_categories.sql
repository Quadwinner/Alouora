-- =============================================================================
-- SEED DATA: ALL STORE CATEGORIES
-- =============================================================================
-- Adds all navigation categories matching the storefront header.
-- The existing 'Lipstick' category is kept and becomes a sub-category of 'Makeup'.

-- Insert top-level categories
INSERT INTO public.categories (name, slug, description, image_url, parent_id, display_order, is_active)
VALUES 
  ('Makeup', 'makeup', 'Explore our complete makeup collection including lipsticks, foundations, eye makeup, and more.', NULL, NULL, 1, true),
  ('Skin', 'skin', 'Premium skincare products for all skin types - cleansers, moisturizers, serums, and treatments.', NULL, NULL, 2, true),
  ('Hair', 'hair', 'Professional hair care products - shampoos, conditioners, hair treatments, and styling products.', NULL, NULL, 3, true),
  ('Appliances', 'appliances', 'Beauty tools and appliances - hair dryers, straighteners, curling irons, and more.', NULL, NULL, 4, true),
  ('Bath & Body', 'bath-body', 'Luxurious bath and body products - body washes, lotions, scrubs, and fragrances.', NULL, NULL, 5, true),
  ('Natural', 'natural', 'Natural and organic beauty products - chemical-free skincare, haircare, and makeup.', NULL, NULL, 6, true),
  ('Mom & Baby', 'mom-baby', 'Safe and gentle beauty products for mothers and babies.', NULL, NULL, 7, true),
  ('Health & Wellness', 'health-wellness', 'Health and wellness products - supplements, vitamins, and personal care.', NULL, NULL, 8, true),
  ('Men', 'men', 'Grooming and personal care products for men - beard care, skincare, and styling.', NULL, NULL, 9, true),
  ('Fragrance', 'fragrance', 'Luxury fragrances and perfumes for every occasion.', NULL, NULL, 10, true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

-- Make 'Lipstick' a sub-category of 'Makeup'
UPDATE public.categories 
SET parent_id = (SELECT id FROM public.categories WHERE slug = 'makeup')
WHERE slug = 'lipstick' AND parent_id IS NULL;

-- Verify
SELECT name, slug, display_order, is_active, parent_id 
FROM public.categories 
ORDER BY display_order ASC, name ASC;
