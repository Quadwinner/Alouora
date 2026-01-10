/**
 * Category Data Configuration
 * Defines category-specific data for listing pages
 */

export interface CategoryFormat {
  id: string;
  name: string;
  img: string;
}

export interface CategoryShade {
  id: string;
  name: string;
  color?: string;
  img?: string;
}

export interface CategoryConfig {
  id: string;
  name: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  bannerImg: string;
  formats: CategoryFormat[];
  shades: CategoryShade[];
  apiCategory: string;
}

// Skin Category
const skinCategory: CategoryConfig = {
  id: 'skin',
  name: 'Skin',
  slug: 'skin',
  title: 'Skincare',
  subtitle: 'The Skincare Paradise',
  description: 'Discover a limitless range of skincare',
  bannerImg: '/images/category/skin/banner.png',
  apiCategory: 'skincare',
  formats: [
    { id: 'moisturizer', name: 'Moisturizer', img: '/images/category/skin/formats/moisturizer.png' },
    { id: 'serum', name: 'Serum', img: '/images/category/skin/formats/serum.png' },
    { id: 'face-wash', name: 'Face Wash', img: '/images/category/skin/formats/face-wash.png' },
    { id: 'sunscreen', name: 'Sunscreen', img: '/images/category/skin/formats/sunscreen.png' },
    { id: 'toner', name: 'Toner', img: '/images/category/skin/formats/toner.png' },
    { id: 'face-mask', name: 'Face Mask', img: '/images/category/skin/formats/face-mask.png' },
  ],
  shades: [
    { id: 'hydrating', name: 'Hydrating', color: '#3B82F6' },
    { id: 'anti-aging', name: 'Anti-Aging', color: '#8B5CF6' },
    { id: 'brightening', name: 'Brightening', color: '#F59E0B' },
    { id: 'acne-control', name: 'Acne Control', color: '#10B981' },
    { id: 'sensitive', name: 'Sensitive', color: '#EC4899' },
    { id: 'oil-control', name: 'Oil Control', color: '#14B8A6' },
  ],
};

// Hair Category
const hairCategory: CategoryConfig = {
  id: 'hair',
  name: 'Hair',
  slug: 'hair',
  title: 'Hair Care',
  subtitle: 'The Hair Care Paradise',
  description: 'Discover a limitless range of hair care',
  bannerImg: '/images/category/hair/banner.png',
  apiCategory: 'haircare',
  formats: [
    { id: 'shampoo', name: 'Shampoo', img: '/images/category/hair/formats/shampoo.png' },
    { id: 'conditioner', name: 'Conditioner', img: '/images/category/hair/formats/conditioner.png' },
    { id: 'hair-oil', name: 'Hair Oil', img: '/images/category/hair/formats/hair-oil.png' },
    { id: 'hair-serum', name: 'Hair Serum', img: '/images/category/hair/formats/hair-serum.png' },
    { id: 'hair-mask', name: 'Hair Mask', img: '/images/category/hair/formats/hair-mask.png' },
    { id: 'styling', name: 'Styling', img: '/images/category/hair/formats/styling.png' },
  ],
  shades: [
    { id: 'dry-hair', name: 'Dry Hair', color: '#F59E0B' },
    { id: 'oily-hair', name: 'Oily Hair', color: '#10B981' },
    { id: 'damaged', name: 'Damaged', color: '#EF4444' },
    { id: 'normal', name: 'Normal', color: '#3B82F6' },
    { id: 'curly', name: 'Curly', color: '#8B5CF6' },
    { id: 'color-treated', name: 'Color Treated', color: '#EC4899' },
  ],
};

// Appliances Category
const appliancesCategory: CategoryConfig = {
  id: 'appliances',
  name: 'Appliances',
  slug: 'appliances',
  title: 'Beauty Appliances',
  subtitle: 'The Beauty Appliances Paradise',
  description: 'Discover a limitless range of beauty tools',
  bannerImg: '/images/category/appliances/banner.png',
  apiCategory: 'appliances',
  formats: [
    { id: 'hair-dryer', name: 'Hair Dryer', img: '/images/category/appliances/formats/hair-dryer.png' },
    { id: 'straightener', name: 'Straightener', img: '/images/category/appliances/formats/straightener.png' },
    { id: 'curler', name: 'Curler', img: '/images/category/appliances/formats/curler.png' },
    { id: 'trimmer', name: 'Trimmer', img: '/images/category/appliances/formats/trimmer.png' },
    { id: 'facial-device', name: 'Facial Device', img: '/images/category/appliances/formats/facial-device.png' },
    { id: 'epilator', name: 'Epilator', img: '/images/category/appliances/formats/epilator.png' },
  ],
  shades: [
    { id: 'hair-styling', name: 'Hair Styling', color: '#F59E0B' },
    { id: 'hair-removal', name: 'Hair Removal', color: '#EC4899' },
    { id: 'skin-care', name: 'Skin Care', color: '#8B5CF6' },
    { id: 'personal-care', name: 'Personal Care', color: '#10B981' },
  ],
};

// Bath & Body Category
const bathBodyCategory: CategoryConfig = {
  id: 'bath-body',
  name: 'Bath & Body',
  slug: 'bath-body',
  title: 'Bath & Body',
  subtitle: 'The Bath & Body Paradise',
  description: 'Discover a limitless range of bath & body care',
  bannerImg: '/images/category/bath-body/banner.png',
  apiCategory: 'bath-body',
  formats: [
    { id: 'body-wash', name: 'Body Wash', img: '/images/category/bath-body/formats/body-wash.png' },
    { id: 'body-lotion', name: 'Body Lotion', img: '/images/category/bath-body/formats/body-lotion.png' },
    { id: 'body-scrub', name: 'Body Scrub', img: '/images/category/bath-body/formats/body-scrub.png' },
    { id: 'soap', name: 'Soap', img: '/images/category/bath-body/formats/soap.png' },
    { id: 'hand-cream', name: 'Hand Cream', img: '/images/category/bath-body/formats/hand-cream.png' },
    { id: 'foot-care', name: 'Foot Care', img: '/images/category/bath-body/formats/foot-care.png' },
  ],
  shades: [
    { id: 'moisturizing', name: 'Moisturizing', color: '#3B82F6' },
    { id: 'exfoliating', name: 'Exfoliating', color: '#F59E0B' },
    { id: 'refreshing', name: 'Refreshing', color: '#10B981' },
    { id: 'nourishing', name: 'Nourishing', color: '#8B5CF6' },
    { id: 'soothing', name: 'Soothing', color: '#EC4899' },
  ],
};

// Natural Category
const naturalCategory: CategoryConfig = {
  id: 'natural',
  name: 'Natural',
  slug: 'natural',
  title: 'Natural Products',
  subtitle: 'The Natural Beauty Paradise',
  description: 'Discover a limitless range of natural beauty',
  bannerImg: '/images/category/natural/banner.png',
  apiCategory: 'natural',
  formats: [
    { id: 'organic-skincare', name: 'Organic Skincare', img: '/images/category/natural/formats/organic-skincare.png' },
    { id: 'herbal', name: 'Herbal', img: '/images/category/natural/formats/herbal.png' },
    { id: 'ayurvedic', name: 'Ayurvedic', img: '/images/category/natural/formats/ayurvedic.png' },
    { id: 'essential-oils', name: 'Essential Oils', img: '/images/category/natural/formats/essential-oils.png' },
    { id: 'natural-makeup', name: 'Natural Makeup', img: '/images/category/natural/formats/natural-makeup.png' },
    { id: 'vegan', name: 'Vegan', img: '/images/category/natural/formats/vegan.png' },
  ],
  shades: [
    { id: 'organic', name: 'Organic', color: '#10B981' },
    { id: 'cruelty-free', name: 'Cruelty Free', color: '#EC4899' },
    { id: 'vegan', name: 'Vegan', color: '#8B5CF6' },
    { id: 'eco-friendly', name: 'Eco Friendly', color: '#14B8A6' },
  ],
};

// Mom & Baby Category
const momBabyCategory: CategoryConfig = {
  id: 'mom-baby',
  name: 'Mom & Baby',
  slug: 'mom-baby',
  title: 'Mom & Baby',
  subtitle: 'The Mom & Baby Paradise',
  description: 'Discover a limitless range for mom & baby',
  bannerImg: '/images/category/mom-baby/banner.png',
  apiCategory: 'mom-baby',
  formats: [
    { id: 'baby-care', name: 'Baby Care', img: '/images/category/mom-baby/formats/baby-care.png' },
    { id: 'maternity', name: 'Maternity Care', img: '/images/category/mom-baby/formats/maternity.png' },
    { id: 'baby-bath', name: 'Baby Bath', img: '/images/category/mom-baby/formats/baby-bath.png' },
    { id: 'diaper-care', name: 'Diaper Care', img: '/images/category/mom-baby/formats/diaper-care.png' },
    { id: 'nursing', name: 'Nursing', img: '/images/category/mom-baby/formats/nursing.png' },
    { id: 'baby-health', name: 'Baby Health', img: '/images/category/mom-baby/formats/baby-health.png' },
  ],
  shades: [
    { id: 'newborn', name: 'Newborn', color: '#FBBF24' },
    { id: 'infant', name: 'Infant', color: '#EC4899' },
    { id: 'toddler', name: 'Toddler', color: '#8B5CF6' },
    { id: 'pregnancy', name: 'Pregnancy', color: '#3B82F6' },
  ],
};

// Health & Wellness Category
const healthWellnessCategory: CategoryConfig = {
  id: 'health-wellness',
  name: 'Health & Wellness',
  slug: 'health-wellness',
  title: 'Health & Wellness',
  subtitle: 'The Health & Wellness Paradise',
  description: 'Discover a limitless range of wellness products',
  bannerImg: '/images/category/health-wellness/banner.png',
  apiCategory: 'health-wellness',
  formats: [
    { id: 'vitamins', name: 'Vitamins', img: '/images/category/health-wellness/formats/vitamins.png' },
    { id: 'supplements', name: 'Supplements', img: '/images/category/health-wellness/formats/supplements.png' },
    { id: 'fitness', name: 'Fitness', img: '/images/category/health-wellness/formats/fitness.png' },
    { id: 'wellness-oils', name: 'Wellness Oils', img: '/images/category/health-wellness/formats/wellness-oils.png' },
    { id: 'health-drinks', name: 'Health Drinks', img: '/images/category/health-wellness/formats/health-drinks.png' },
    { id: 'immunity', name: 'Immunity', img: '/images/category/health-wellness/formats/immunity.png' },
  ],
  shades: [
    { id: 'nutrition', name: 'Nutrition', color: '#10B981' },
    { id: 'immunity-boost', name: 'Immunity Boost', color: '#F59E0B' },
    { id: 'energy', name: 'Energy', color: '#EF4444' },
    { id: 'relaxation', name: 'Relaxation', color: '#8B5CF6' },
  ],
};

// Men Category
const menCategory: CategoryConfig = {
  id: 'men',
  name: 'Men',
  slug: 'men',
  title: 'Men\'s Grooming',
  subtitle: 'The Men\'s Grooming Paradise',
  description: 'Discover a limitless range of men\'s products',
  bannerImg: '/images/category/men/banner.png',
  apiCategory: 'men',
  formats: [
    { id: 'beard-care', name: 'Beard Care', img: '/images/category/men/formats/beard-care.png' },
    { id: 'shaving', name: 'Shaving', img: '/images/category/men/formats/shaving.png' },
    { id: 'face-care', name: 'Face Care', img: '/images/category/men/formats/face-care.png' },
    { id: 'hair-care', name: 'Hair Care', img: '/images/category/men/formats/hair-care.png' },
    { id: 'body-care', name: 'Body Care', img: '/images/category/men/formats/body-care.png' },
    { id: 'grooming-tools', name: 'Grooming Tools', img: '/images/category/men/formats/grooming-tools.png' },
  ],
  shades: [
    { id: 'skin-care', name: 'Skin Care', color: '#3B82F6' },
    { id: 'beard-grooming', name: 'Beard Grooming', color: '#78350F' },
    { id: 'shaving-care', name: 'Shaving Care', color: '#10B981' },
    { id: 'hair-styling', name: 'Hair Styling', color: '#6366F1' },
  ],
};

// Fragrance Category
const fragranceCategory: CategoryConfig = {
  id: 'fragrance',
  name: 'Fragrance',
  slug: 'fragrance',
  title: 'Fragrances',
  subtitle: 'The Fragrance Paradise',
  description: 'Discover a limitless range of fragrances',
  bannerImg: '/images/category/fragrance/banner.png',
  apiCategory: 'fragrance',
  formats: [
    { id: 'perfume', name: 'Perfume', img: '/images/category/fragrance/formats/perfume.png' },
    { id: 'eau-de-toilette', name: 'Eau de Toilette', img: '/images/category/fragrance/formats/eau-de-toilette.png' },
    { id: 'body-spray', name: 'Body Spray', img: '/images/category/fragrance/formats/body-spray.png' },
    { id: 'deodorant', name: 'Deodorant', img: '/images/category/fragrance/formats/deodorant.png' },
    { id: 'attar', name: 'Attar', img: '/images/category/fragrance/formats/attar.png' },
    { id: 'gift-sets', name: 'Gift Sets', img: '/images/category/fragrance/formats/gift-sets.png' },
  ],
  shades: [
    { id: 'floral', name: 'Floral', color: '#EC4899' },
    { id: 'woody', name: 'Woody', color: '#78350F' },
    { id: 'fresh', name: 'Fresh', color: '#10B981' },
    { id: 'oriental', name: 'Oriental', color: '#8B5CF6' },
    { id: 'citrus', name: 'Citrus', color: '#F59E0B' },
    { id: 'musky', name: 'Musky', color: '#6366F1' },
  ],
};

// Export all categories
export const categories: CategoryConfig[] = [
  skinCategory,
  hairCategory,
  appliancesCategory,
  bathBodyCategory,
  naturalCategory,
  momBabyCategory,
  healthWellnessCategory,
  menCategory,
  fragranceCategory,
];

// Helper function to get category by slug
export function getCategoryBySlug(slug: string): CategoryConfig | undefined {
  return categories.find(cat => cat.slug === slug);
}

// Helper function to get all category slugs (for static generation)
export function getAllCategorySlugs(): string[] {
  return categories.map(cat => cat.slug);
}
