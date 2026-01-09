/**
 * Product Types
 * 
 * TypeScript interfaces for products, categories, brands, and variants
 */

// Category type
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
  parent_id?: string | null;
  display_order: number;
  is_active: boolean;
  meta_title?: string | null;
  meta_description?: string | null;
  created_at: string;
  updated_at: string;
  // For hierarchical structure
  children?: Category[];
  parent?: Category;
  // Product count (computed)
  product_count?: number;
}

// Brand type
export interface Brand {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  logo_url?: string | null;
  website_url?: string | null;
  is_active: boolean;
  display_order: number;
  meta_title?: string | null;
  meta_description?: string | null;
  created_at: string;
  updated_at: string;
  // Product count (computed)
  product_count?: number;
}

// Product Variant type
export interface ProductVariant {
  id: string;
  product_id: string;
  variant_type: string; // 'size', 'color', 'format', etc.
  variant_value: string; // 'Small', 'Red', '50ml', etc.
  variant_label?: string | null;
  price?: number | null;
  original_price?: number | null;
  discount_percentage?: number | null;
  stock_quantity: number;
  sku?: string | null;
  image_url?: string | null;
  is_active: boolean;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

// Product type
export interface Product {
  id: string;
  name: string;
  slug: string;
  brand_id?: string | null;
  category_id?: string | null;
  description?: string | null;
  ingredients?: string[] | null;
  how_to_use?: string[] | null;
  price: number;
  original_price?: number | null;
  discount_percentage?: number | null;
  images?: string[] | null;
  thumbnail?: string | null;
  stock_quantity: number;
  sku?: string | null;
  is_active: boolean;
  is_featured: boolean;
  rating_average: number;
  rating_count: number;
  sales_count: number;
  view_count: number;
  badges?: string[] | null;
  meta_title?: string | null;
  meta_description?: string | null;
  created_at: string;
  updated_at: string;
  // Related entities
  brand?: Brand | null;
  category?: Category | null;
  variants?: ProductVariant[];
}

// Product with full details (for product detail page)
export interface ProductDetail extends Product {
  brand: Brand | null;
  category: Category | null;
  variants: ProductVariant[];
  related_products?: Product[];
  rating_distribution?: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

// Product list item (for product listing)
export interface ProductListItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  original_price?: number | null;
  discount_percentage?: number | null;
  thumbnail?: string | null;
  images?: string[] | null;
  rating_average: number;
  rating_count: number;
  badges?: string[] | null;
  is_featured: boolean;
  is_new?: boolean;
  has_free_gift?: boolean;
  stock_quantity: number;
  brand?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

// Product filters
export interface ProductFilters {
  category?: string;
  brand?: string | string[];
  minPrice?: number;
  maxPrice?: number;
  color?: string | string[];
  rating?: number;
  format?: string;
  search?: string;
  sort?: ProductSortOption;
  page?: number;
  limit?: number;
  featured?: boolean;
}

// Sort options
export type ProductSortOption = 
  | 'popularity' 
  | 'newest' 
  | 'price_low_to_high' 
  | 'price_high_to_low' 
  | 'rating' 
  | 'discount';

// Available filter options (for sidebar)
export interface AvailableFilters {
  categories: { id: string; name: string; slug: string; count: number }[];
  brands: { id: string; name: string; slug: string; count: number }[];
  colors: { name: string; hex: string; count: number }[];
  priceRange: { min: number; max: number };
  ratings: { rating: number; count: number }[];
}

// Product search response
export interface ProductSearchResponse {
  products: ProductListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
  filters?: AvailableFilters;
}

// Review type
export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  order_id?: string | null;
  rating: number;
  title?: string | null;
  comment?: string | null;
  images?: string[] | null;
  is_verified_purchase: boolean;
  is_approved: boolean;
  is_helpful: number;
  created_at: string;
  updated_at: string;
  // User info (joined)
  user?: {
    id: string;
    full_name?: string | null;
    avatar_url?: string | null;
  };
}
