'use client';

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import Footer from "@/components/layout/Footer";

// Lipstick formats data (Shop By Format)
const lipstickFormats = [
  { id: 'lipstick', name: 'Lipstick', img: '/images/makeup/lipsticks/formats/lipstick.png' },
  { id: 'liquid-lipstick', name: 'Liquid Lipstick', img: '/images/makeup/lipsticks/formats/liquid-lipstick.png' },
  { id: 'lip-tints', name: 'Lip Tints', img: '/images/makeup/lipsticks/formats/lip-tints.png' },
  { id: 'lip-gloss-oil', name: 'Lip Gloss/Oil', img: '/images/makeup/lipsticks/formats/lip-gloss-oil.png' },
  { id: 'lip-crayons', name: 'Lip Crayons', img: '/images/makeup/lipsticks/formats/lip-crayons.png' },
  { id: 'lip-liners', name: 'Lip Liners', img: '/images/makeup/lipsticks/formats/lip-liners.png' },
];

// Lipstick shades data (Shop By Shade)
const lipstickShades = [
  { id: 'pink', name: 'Pink', color: '#F9A8D4' },
  { id: 'red', name: 'Red', color: '#DC2626' },
  { id: 'orange', name: 'Orange', color: '#F97316' },
  { id: 'brown', name: 'Brown', color: '#78350F' },
  { id: 'berry', name: 'Berry', color: '#9333EA' },
  { id: 'nude', name: 'Nude', color: '#D4B896' },
  { id: 'mauve', name: 'Mauve', color: '#C4B5FD' },
  { id: 'peach', name: 'Peach', color: '#FDBA74' },
];

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

// Sample lipstick products
const lipstickProducts = [
  {
    id: 1,
    name: 'Super Stay Vinyl Ink Liquid Lipstick',
    originalPrice: 34.00,
    salePrice: 17.00,
    discount: '50% Off',
    rating: 5,
    reviews: 79603,
    img: '/images/makeup/lipsticks/products/product-1.png',
    badges: ['FEATURED', 'BESTSELLER'],
    isNew: true,
    gift: 'Enjoy Complimentary Gift',
  },
  {
    id: 2,
    name: 'Super Stay Vinyl Ink Liquid Lipstick',
    originalPrice: 34.00,
    salePrice: 17.00,
    discount: '50% Off',
    rating: 5,
    reviews: 79603,
    img: '/images/makeup/lipsticks/products/product-1.png',
    badges: ['FEATURED', 'BESTSELLER'],
    isNew: true,
    gift: 'Enjoy Complimentary Gift',
  },
  {
    id: 3,
    name: 'Super Stay Vinyl Ink Liquid Lipstick',
    originalPrice: 34.00,
    salePrice: 17.00,
    discount: '50% Off',
    rating: 5,
    reviews: 79603,
    img: '/images/makeup/lipsticks/products/product-1.png',
    badges: ['FEATURED', 'BESTSELLER'],
    isNew: true,
    gift: 'Enjoy Complimentary Gift',
  },
  {
    id: 4,
    name: 'Super Stay Vinyl Ink Liquid Lipstick',
    originalPrice: 34.00,
    salePrice: 17.00,
    discount: '50% Off',
    rating: 5,
    reviews: 79603,
    img: '/images/makeup/lipsticks/products/product-1.png',
    badges: ['FEATURED', 'BESTSELLER'],
    isNew: true,
    gift: 'Enjoy Complimentary Gift',
  },
  {
    id: 5,
    name: 'Super Stay Vinyl Ink Liquid Lipstick',
    originalPrice: 34.00,
    salePrice: 17.00,
    discount: '50% Off',
    rating: 5,
    reviews: 79603,
    img: '/images/makeup/lipsticks/products/product-1.png',
    badges: ['FEATURED', 'BESTSELLER'],
    isNew: true,
    gift: 'Enjoy Complimentary Gift',
  },
  {
    id: 6,
    name: 'Super Stay Vinyl Ink Liquid Lipstick',
    originalPrice: 34.00,
    salePrice: 17.00,
    discount: '50% Off',
    rating: 5,
    reviews: 79603,
    img: '/images/makeup/lipsticks/products/product-1.png',
    badges: ['FEATURED', 'BESTSELLER'],
    isNew: true,
    gift: 'Enjoy Complimentary Gift',
  },
  {
    id: 7,
    name: 'Super Stay Vinyl Ink Liquid Lipstick',
    originalPrice: 34.00,
    salePrice: 17.00,
    discount: '50% Off',
    rating: 5,
    reviews: 79603,
    img: '/images/makeup/lipsticks/products/product-1.png',
    badges: ['FEATURED', 'BESTSELLER'],
    isNew: true,
    gift: 'Enjoy Complimentary Gift',
  },
  {
    id: 8,
    name: 'Super Stay Vinyl Ink Liquid Lipstick',
    originalPrice: 34.00,
    salePrice: 17.00,
    discount: '50% Off',
    rating: 5,
    reviews: 79603,
    img: '/images/makeup/lipsticks/products/product-1.png',
    badges: ['FEATURED', 'BESTSELLER'],
    isNew: true,
    gift: 'Enjoy Complimentary Gift',
  },
  {
    id: 9,
    name: 'Super Stay Vinyl Ink Liquid Lipstick',
    originalPrice: 34.00,
    salePrice: 17.00,
    discount: '50% Off',
    rating: 5,
    reviews: 79603,
    img: '/images/makeup/lipsticks/products/product-1.png',
    badges: ['FEATURED', 'BESTSELLER'],
    isNew: true,
    gift: 'Enjoy Complimentary Gift',
  },
  {
    id: 10,
    name: 'Super Stay Vinyl Ink Liquid Lipstick',
    originalPrice: 34.00,
    salePrice: 17.00,
    discount: '50% Off',
    rating: 5,
    reviews: 79603,
    img: '/images/makeup/lipsticks/products/product-1.png',
    badges: ['FEATURED', 'BESTSELLER'],
    isNew: true,
    gift: 'Enjoy Complimentary Gift',
  },
  {
    id: 11,
    name: 'Super Stay Vinyl Ink Liquid Lipstick',
    originalPrice: 34.00,
    salePrice: 17.00,
    discount: '50% Off',
    rating: 5,
    reviews: 79603,
    img: '/images/makeup/lipsticks/products/product-1.png',
    badges: ['FEATURED', 'BESTSELLER'],
    isNew: true,
    gift: 'Enjoy Complimentary Gift',
  },
  {
    id: 12,
    name: 'Super Stay Vinyl Ink Liquid Lipstick',
    originalPrice: 34.00,
    salePrice: 17.00,
    discount: '50% Off',
    rating: 5,
    reviews: 79603,
    img: '/images/makeup/lipsticks/products/product-1.png',
    badges: ['FEATURED', 'BESTSELLER'],
    isNew: true,
    gift: 'Enjoy Complimentary Gift',
  },
  {
    id: 13,
    name: 'Super Stay Vinyl Ink Liquid Lipstick',
    originalPrice: 34.00,
    salePrice: 17.00,
    discount: '50% Off',
    rating: 5,
    reviews: 79603,
    img: '/images/makeup/lipsticks/products/product-1.png',
    badges: ['FEATURED', 'BESTSELLER'],
    isNew: true,
    gift: 'Enjoy Complimentary Gift',
  },
  {
    id: 14,
    name: 'Super Stay Vinyl Ink Liquid Lipstick',
    originalPrice: 34.00,
    salePrice: 17.00,
    discount: '50% Off',
    rating: 5,
    reviews: 79603,
    img: '/images/makeup/lipsticks/products/product-1.png',
    badges: ['FEATURED', 'BESTSELLER'],
    isNew: true,
    gift: 'Enjoy Complimentary Gift',
  },
  {
    id: 15,
    name: 'Super Stay Vinyl Ink Liquid Lipstick',
    originalPrice: 34.00,
    salePrice: 17.00,
    discount: '50% Off',
    rating: 5,
    reviews: 79603,
    img: '/images/makeup/lipsticks/products/product-1.png',
    badges: ['FEATURED', 'BESTSELLER'],
    isNew: true,
    gift: 'Enjoy Complimentary Gift',
  },
];

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
function ProductCard({ product }: { product: typeof lipstickProducts[0] }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow">
      {/* Product Image */}
      <div className="relative bg-gray-50">
        <div className="relative h-[246px] w-full">
          <Image
            src={product.img}
            alt={product.name}
            fill
            className="object-contain p-4"
          />
        </div>
        {/* NEW Badge */}
        {product.isNew && (
          <div className="absolute top-9 right-2 bg-pink-500 text-white text-xs font-semibold px-2 py-1 rounded">
            NEW
          </div>
        )}
        {/* Feature Badges */}
        <div className="absolute top-4 left-4 flex gap-1">
          {product.badges.map((badge, idx) => (
            <span
              key={idx}
              className="bg-gray-100 text-gray-600 text-[10px] font-medium px-2 py-1 rounded"
            >
              {badge}
            </span>
          ))}
        </div>
      </div>
      
      {/* Product Info */}
      <div className="p-4 text-center">
        <h3 className="text-sm text-gray-800 mb-3 line-clamp-2">{product.name}</h3>
        
        {/* Price */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-sm text-gray-400 line-through">${product.originalPrice.toFixed(2)}</span>
          <span className="font-semibold text-gray-900">${product.salePrice.toFixed(2)}</span>
          <span className="text-sm text-green-600">{product.discount}</span>
        </div>
        
        {/* Gift Text */}
        <p className="text-xs text-gray-500 mb-3">{product.gift}</p>
        
        {/* Rating */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <StarRating rating={product.rating} />
          <span className="text-xs text-gray-400">({product.reviews.toLocaleString()})</span>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex border-t border-gray-200">
        <button className="flex-none w-14 py-3 flex items-center justify-center border-r border-gray-200 hover:bg-gray-50 transition">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
        </button>
        <button className="flex-1 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
          Preview Shades
        </button>
      </div>
    </div>
  );
}

// Lipstick Listing Content Component
function LipstickListingContent() {
  const searchParams = useSearchParams();
  const category = searchParams.get('category');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Check if it's lipstick category
  const isLipstick = category === 'lipstick';
  
  if (!isLipstick) {
    // Generic products page for other categories
    return (
      <main className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Products</h1>
          <p className="text-gray-600">Category: {category || 'All'}</p>
          <p className="text-gray-500 mt-4">Products page coming soon...</p>
          <Link href="/makeup" className="inline-block mt-6 text-pink-600 hover:text-pink-700">
            ← Back to Makeup
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fdf2f8]">
      {/* Hero Banner - Lipstick Paradise */}
      <section className="relative h-[300px] md:h-[358px] overflow-hidden">
        <div className="absolute inset-0">
          <Image 
            src="/images/makeup/lipsticks/banner.png"
            alt="Lipstick Paradise"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-pink-200/30 to-purple-200/30" />
        </div>
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-[80px] md:text-[150px] font-semibold text-white/25 capitalize leading-none">
            Lipsticks
          </h1>
          <h2 className="text-2xl md:text-4xl font-semibold text-white capitalize mt-4">
            The Lipstick paradise
          </h2>
          <p className="text-lg md:text-2xl font-semibold text-gray-400 capitalize mt-2">
            Discover a limitless range of makeup
          </p>
        </div>
      </section>

      {/* Breadcrumbs */}
      <section className="bg-[#fdf2f8] py-4">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link href="/" className="hover:text-pink-600">Home</Link>
            <span>/</span>
            <Link href="/makeup" className="hover:text-pink-600">Makeup</Link>
            <span>/</span>
            <span className="text-gray-900">Lipstick</span>
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
            {lipstickFormats.map((format) => (
              <Link
                key={format.id}
                href={`/products?category=lipstick&format=${format.id}`}
                className="flex flex-col items-center min-w-[140px] group"
              >
                <div className="relative w-[140px] h-[140px] md:w-[207px] md:h-[207px] rounded-2xl overflow-hidden mb-3 bg-gray-100 group-hover:shadow-lg transition-all duration-300">
                  <Image
                    src={format.img}
                    alt={format.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <span className="text-sm md:text-base font-medium text-gray-700 text-center">{format.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Shop By Shade Section */}
      <section className="bg-[#fdf2f8] py-8">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1 h-6 bg-pink-500 rounded-full"></div>
            <h2 className="text-xl md:text-2xl font-semibold text-gray-900">Shop By Shade</h2>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
            <div className="flex flex-wrap justify-center gap-8 md:gap-16">
              {lipstickShades.map((shade) => (
                <Link
                  key={shade.id}
                  href={`/products?category=lipstick&shade=${shade.id}`}
                  className="flex flex-col items-center group"
                >
                  <div 
                    className="w-16 h-16 md:w-20 md:h-20 rounded-full mb-3 group-hover:scale-110 transition-transform duration-300 shadow-md"
                    style={{ backgroundColor: shade.color }}
                  />
                  <span className="text-sm font-medium text-gray-600">{shade.name}</span>
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
                {/* Filter Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">Filters</h3>
                  <button className="text-sm text-pink-600 hover:text-pink-700">Clear All</button>
                </div>
                
                {/* Filter Options */}
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
              {/* Products Header */}
              <div className="mb-6">
                <h2 className="text-2xl md:text-3xl font-semibold text-gray-900">All Products</h2>
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {lipstickProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-center gap-4 mt-10 py-5">
                <span className="text-sm text-gray-500">Page {currentPage} of 104</span>
                <div className="flex items-center gap-2">
                  <button 
                    className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50 transition"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  >
                    <svg width="7" height="13" viewBox="0 0 7 13" fill="none" stroke="#666" strokeWidth="2">
                      <path d="M6 1L1 6.5L6 12" />
                    </svg>
                  </button>
                  {[1, 2, 3, 4, 5].map((page) => (
                    <button
                      key={page}
                      className={`w-10 h-10 flex items-center justify-center rounded-lg border transition ${
                        currentPage === page 
                          ? 'bg-pink-500 text-white border-pink-500' 
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  ))}
                  <button 
                    className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50 transition"
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    <svg width="7" height="13" viewBox="0 0 7 13" fill="none" stroke="#666" strokeWidth="2">
                      <path d="M1 12L6 6.5L1 1" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  );
}

// Main Products Page with Suspense
export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    }>
      <LipstickListingContent />
    </Suspense>
  );
}
