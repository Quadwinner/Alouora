'use client';

import Image from "next/image";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect, useCallback } from "react";
import Footer from "@/components/layout/Footer";
import type { ProductListItem } from "@/types/product";
import { getCategoryBySlug, type CategoryConfig } from "@/constants/categoryData";

// Filter options
const filterOptions = [
  { id: 'sort', name: 'Sort By : Popularity', expanded: false },
  { id: 'brand', name: 'Brand', expanded: false },
  { id: 'price', name: 'Price', expanded: false },
  { id: 'category', name: 'Category', expanded: false },
  { id: 'color', name: 'Color', expanded: false },
  { id: 'finish', name: 'Finish', expanded: false },
  { id: 'formulation', name: 'Formulation', expanded: false },
  { id: 'discount', name: 'Discount', expanded: false },
  { id: 'skin-type', name: 'Skin Type', expanded: false },
  { id: 'rating', name: 'Avg Customer Rating', expanded: false },
  { id: 'preference', name: 'Preference', expanded: false },
];

// Product type for UI display
interface DisplayProduct {
  id: string;
  name: string;
  originalPrice: number;
  salePrice: number;
  discount: string;
  rating: number;
  reviews: number;
  img: string;
  badges: string[];
  isNew: boolean;
  gift: string;
}

// Pagination info from API
interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

// Transform API product to display format
function transformProduct(product: ProductListItem): DisplayProduct {
  const discountPercentage = product.discount_percentage ||
    (product.original_price && product.price
      ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
      : 0);

  const badges = product.badges || [];
  const isNew = badges.some(badge => badge.toUpperCase() === 'NEW');
  const hasGift = badges.some(badge => badge.toUpperCase().includes('GIFT'));
  const displayBadges = badges.filter(badge => badge.toUpperCase() !== 'NEW');

  return {
    id: product.id,
    name: product.name,
    originalPrice: product.original_price || product.price,
    salePrice: product.price,
    discount: discountPercentage > 0 ? `${discountPercentage}% Off` : '',
    rating: Math.round(product.rating_average || 0),
    reviews: product.rating_count || 0,
    img: product.thumbnail || product.images?.[0] || '/images/product-placeholder.png',
    badges: displayBadges,
    isNew: isNew,
    gift: hasGift ? 'Enjoy Complimentary Gift' : '',
  };
}

// Star Rating Component
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          width="11"
          height="10"
          viewBox="0 0 11 10"
          fill={star <= rating ? "#FFB800" : "#E5E5E5"}
        >
          <path d="M5.5 0L6.73 3.27H10.39L7.33 5.29L8.56 8.56L5.5 6.54L2.44 8.56L3.67 5.29L0.61 3.27H4.27L5.5 0Z" />
        </svg>
      ))}
    </div>
  );
}

// Product Card Component
function ProductCard({ product }: { product: DisplayProduct }) {
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [cartMessage, setCartMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleAddToCart = async () => {
    if (isAddingToCart) return;

    setIsAddingToCart(true);
    setCartMessage(null);

    try {
      const response = await fetch('/api/cart/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: 1,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setCartMessage({ type: 'success', text: 'Added to cart!' });
        setTimeout(() => setCartMessage(null), 2000);
      } else {
        setCartMessage({ type: 'error', text: data.error || 'Failed to add' });
        setTimeout(() => setCartMessage(null), 3000);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      setCartMessage({ type: 'error', text: 'Something went wrong' });
      setTimeout(() => setCartMessage(null), 3000);
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden group hover:shadow-lg transition-shadow relative">
      {cartMessage && (
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 px-4 py-2 rounded-lg shadow-lg text-sm font-medium ${
          cartMessage.type === 'success'
            ? 'bg-green-500 text-white'
            : 'bg-red-500 text-white'
        }`}>
          {cartMessage.text}
        </div>
      )}

      <Link href={`/products/${product.id}`} className="block relative bg-gray-50">
        <div className="relative h-[200px] w-full">
          <Image
            src={product.img}
            alt={product.name || 'Product image'}
            fill
            className="object-contain p-4 group-hover:scale-105 transition-transform duration-200"
          />
        </div>
        {product.isNew && (
          <div className="absolute top-2 right-2 bg-[#22c55e] text-white text-[10px] font-semibold px-2 py-1 rounded">
            NEW
          </div>
        )}
        <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
          {product.badges.map((badge, idx) => (
            <span
              key={idx}
              className="bg-gray-100 text-gray-600 text-[9px] font-medium px-1.5 py-0.5 rounded uppercase"
            >
              {badge}
            </span>
          ))}
        </div>
      </Link>

      <div className="p-3 text-center">
        <Link href={`/products/${product.id}`} className="block hover:text-pink-600 transition-colors">
          <h3 className="text-sm text-gray-800 mb-2 line-clamp-2 min-h-[40px]">{product.name}</h3>
        </Link>

        <div className="flex items-center justify-center gap-2 mb-1.5 flex-wrap">
          <span className="text-sm text-gray-400 line-through">₹{product.originalPrice.toFixed(2)}</span>
          <span className="font-semibold text-gray-900">₹{product.salePrice.toFixed(2)}</span>
          <span className="text-xs text-pink-600 font-medium">{product.discount}</span>
        </div>

        {product.gift && (
          <p className="text-[11px] text-gray-500 mb-2">{product.gift}</p>
        )}

        <div className="flex items-center justify-center gap-1.5 mb-3">
          <StarRating rating={product.rating} />
          <span className="text-[11px] text-gray-400">({product.reviews.toLocaleString()})</span>
        </div>
      </div>

      <div className="flex flex-col">
        <button
          onClick={handleAddToCart}
          disabled={isAddingToCart}
          className={`w-full py-2.5 text-sm font-medium text-white transition flex items-center justify-center gap-2 ${
            isAddingToCart
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-[#22c55e] hover:bg-[#16a34a]'
          }`}
        >
          {isAddingToCart ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Adding...
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 22C9.55228 22 10 21.5523 10 21C10 20.4477 9.55228 20 9 20C8.44772 20 8 20.4477 8 21C8 21.5523 8.44772 22 9 22Z" />
                <path d="M20 22C20.5523 22 21 21.5523 21 21C21 20.4477 20.5523 20 20 20C19.4477 20 19 20.4477 19 21C19 21.5523 19.4477 22 20 22Z" />
                <path d="M1 1H5L7.68 14.39C7.77 14.8504 8.02 15.264 8.38 15.5583C8.74 15.8526 9.19 16.0084 9.66 16H19.4C19.87 16.0084 20.32 15.8526 20.68 15.5583C21.04 15.264 21.29 14.8504 21.38 14.39L23 6H6" />
              </svg>
              Add to Cart
            </>
          )}
        </button>
        <div className="flex border-t border-gray-100">
          <button className="flex-none w-12 py-2.5 flex items-center justify-center border-r border-gray-100 hover:bg-gray-50 transition">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
          </button>
          <button className="flex-1 py-2.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition">
            Preview Shades
          </button>
        </div>
      </div>
    </div>
  );
}

// Product Card Skeleton
function ProductCardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden animate-pulse">
      <div className="relative bg-gray-200 h-[246px] w-full" />
      <div className="p-4">
        <div className="h-4 bg-gray-200 rounded mb-3 mx-auto w-3/4" />
        <div className="flex justify-center gap-2 mb-2">
          <div className="h-4 bg-gray-200 rounded w-16" />
          <div className="h-4 bg-gray-200 rounded w-16" />
        </div>
        <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto mb-3" />
        <div className="h-3 bg-gray-200 rounded w-1/3 mx-auto" />
      </div>
      <div className="flex border-t border-gray-200 h-12" />
    </div>
  );
}

// Category Listing Content Component
function CategoryListingContent({ categoryData }: { categoryData: CategoryConfig }) {
  const searchParams = useSearchParams();
  const format = searchParams.get('format');
  const shade = searchParams.get('shade');
  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState<DisplayProduct[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch products from API
  const fetchProducts = useCallback(async (page: number) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '15',
        category: categoryData.apiCategory,
        ...(format && { format }),
        ...(shade && { shade }),
      });

      const response = await fetch(`/api/products?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch products');
      }

      if (data.success && data.data) {
        const transformedProducts = data.data.products.map(transformProduct);
        setProducts(transformedProducts);
        setPagination(data.data.pagination);
      } else {
        throw new Error('Invalid API response');
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [categoryData.apiCategory, format, shade]);

  useEffect(() => {
    fetchProducts(currentPage);
  }, [currentPage, fetchProducts]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen bg-[#fdf2f8]">
      {/* Hero Banner */}
      <section className="relative h-[300px] md:h-[358px] overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={categoryData.bannerImg}
            alt={categoryData.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-pink-200/30 to-purple-200/30" />
        </div>
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-[80px] md:text-[150px] font-semibold text-white/25 capitalize leading-none">
            {categoryData.title}
          </h1>
          <h2 className="text-2xl md:text-4xl font-semibold text-white capitalize mt-4">
            {categoryData.subtitle}
          </h2>
          <p className="text-lg md:text-2xl font-semibold text-gray-400 capitalize mt-2">
            {categoryData.description}
          </p>
        </div>
      </section>

      {/* Breadcrumbs */}
      <section className="bg-[#fdf2f8] py-4">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link href="/" className="hover:text-pink-600">Home</Link>
            <span>/</span>
            <span className="text-gray-900">{categoryData.name}</span>
          </div>
        </div>
      </section>

      {/* Shop By Format Section */}
      <section className="bg-[#fdf2f8] py-8">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1 h-6 bg-pink-500 rounded-full"></div>
            <h2 className="text-xl md:text-2xl font-semibold text-gray-900">Shop By Format</h2>
          </div>
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
            {categoryData.formats.map((formatItem) => (
              <Link
                key={formatItem.id}
                href={`/category/${categoryData.slug}?format=${formatItem.id}`}
                className="flex flex-col items-center min-w-[140px] group"
              >
                <div className="relative w-[140px] h-[140px] md:w-[207px] md:h-[207px] rounded-2xl overflow-hidden mb-3 bg-gray-100 group-hover:shadow-lg transition-all duration-300">
                  <Image
                    src={formatItem.img}
                    alt={formatItem.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <span className="text-sm md:text-base font-medium text-gray-700 text-center">{formatItem.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Shop By Shade/Type Section */}
      <section className="bg-[#fdf2f8] py-8">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1 h-6 bg-pink-500 rounded-full"></div>
            <h2 className="text-xl md:text-2xl font-semibold text-gray-900">Shop By Type</h2>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
            <div className="flex flex-wrap justify-center gap-8 md:gap-16">
              {categoryData.shades.map((shadeItem) => (
                <Link
                  key={shadeItem.id}
                  href={`/category/${categoryData.slug}?shade=${shadeItem.id}`}
                  className="flex flex-col items-center group"
                >
                  <div
                    className="w-16 h-16 md:w-20 md:h-20 rounded-full mb-3 group-hover:scale-110 transition-transform duration-300 shadow-md"
                    style={{ backgroundColor: shadeItem.color }}
                  />
                  <span className="text-sm font-medium text-gray-600">{shadeItem.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content - Filters + Products Grid */}
      <section className="bg-[#fdf2f8] py-8">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex gap-6">
            {/* Filters Sidebar */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="bg-white rounded-lg border border-gray-200 sticky top-4">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">Filters</h3>
                  <button className="text-sm text-pink-600 hover:text-pink-700">Clear All</button>
                </div>
                <div className="divide-y divide-gray-100">
                  {filterOptions.map((filter) => (
                    <button
                      key={filter.id}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition"
                    >
                      <span className="text-sm text-gray-700">{filter.name}</span>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#666" strokeWidth="2">
                        <path d="M3 4.5L6 7.5L9 4.5" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            {/* Products Grid */}
            <div className="flex-1">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl md:text-3xl font-semibold text-gray-900">All Products</h2>
                {pagination && (
                  <span className="text-sm text-gray-500">
                    {pagination.total} products found
                  </span>
                )}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center mb-6">
                  <p className="text-red-600 mb-4">{error}</p>
                  <button
                    onClick={() => fetchProducts(currentPage)}
                    className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition"
                  >
                    Try Again
                  </button>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {loading ? (
                  Array.from({ length: 15 }).map((_, idx) => (
                    <ProductCardSkeleton key={idx} />
                  ))
                ) : products.length > 0 ? (
                  products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))
                ) : !error && (
                  <div className="col-span-full text-center py-12">
                    <p className="text-gray-500 text-lg mb-4">No products found</p>
                    <Link
                      href={`/category/${categoryData.slug}`}
                      className="text-pink-600 hover:text-pink-700"
                    >
                      Browse all {categoryData.name.toLowerCase()} products
                    </Link>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-10 py-5">
                  <span className="text-sm text-gray-500">
                    Page {currentPage} of {pagination.totalPages}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1 || loading}
                    >
                      <svg width="7" height="13" viewBox="0 0 7 13" fill="none" stroke="#666" strokeWidth="2">
                        <path d="M6 1L1 6.5L6 12" />
                      </svg>
                    </button>
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          className={`w-10 h-10 flex items-center justify-center rounded-lg border transition ${currentPage === pageNum
                              ? 'bg-pink-500 text-white border-pink-500'
                              : 'border-gray-300 hover:bg-gray-50'
                            }`}
                          onClick={() => handlePageChange(pageNum)}
                          disabled={loading}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => handlePageChange(Math.min(pagination.totalPages, currentPage + 1))}
                      disabled={currentPage === pagination.totalPages || loading}
                    >
                      <svg width="7" height="13" viewBox="0 0 7 13" fill="none" stroke="#666" strokeWidth="2">
                        <path d="M1 12L6 6.5L1 1" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

// Main Category Page
export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const categoryData = getCategoryBySlug(slug);

  if (!categoryData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Category Not Found</h1>
          <p className="text-gray-600 mb-6">The category you're looking for doesn't exist.</p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    }>
      <CategoryListingContent categoryData={categoryData} />
    </Suspense>
  );
}
