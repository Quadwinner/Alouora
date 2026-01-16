'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ProductDetail, Review } from '@/types/product';
import Footer from '@/components/layout/Footer';

// Star icon component
const StarIcon = ({ filled = true, size = 16 }: { filled?: boolean; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <path
      d="M8 1.5L9.708 6.292L14.5 7.072L11.25 10.428L12.416 15.5L8 12.792L3.584 15.5L4.75 10.428L1.5 7.072L6.292 6.292L8 1.5Z"
      fill={filled ? "#FFB800" : "#E5E7EB"}
      stroke={filled ? "#FFB800" : "#E5E7EB"}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Heart icon for wishlist
const HeartIcon = ({ filled = false }: { filled?: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={filled ? "#ec4899" : "none"} stroke={filled ? "#ec4899" : "#6b7280"} strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
  </svg>
);

// Chevron icons
const ChevronUp = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#374151" strokeWidth="2">
    <path d="M12 10L8 6L4 10" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ChevronDown = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#374151" strokeWidth="2">
    <path d="M4 6L8 10L12 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Product Detail Page
export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState<'description' | 'ingredients' | 'how-to-use'>('description');
  const [pincode, setPincode] = useState('');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [cartMessage, setCartMessage] = useState<string | null>(null);
  const [wishlistItemId, setWishlistItemId] = useState<string | null>(null);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        // Fetch product details
        const productRes = await fetch(`/api/products/${productId}`);
        const productData = await productRes.json();

        if (productData.success) {
          setProduct(productData.data);
        }

        // Fetch reviews
        const reviewsRes = await fetch(`/api/products/${productId}/reviews`);
        const reviewsData = await reviewsRes.json();

        if (reviewsData.success) {
          setReviews(reviewsData.data);
        }

        // Check if product is in wishlist
        const wishlistRes = await fetch('/api/wishlist');
        if (wishlistRes.ok) {
          const wishlistData = await wishlistRes.json();
          if (wishlistData.success && wishlistData.data?.items) {
            const wishlistItem = wishlistData.data.items.find(
              (item: any) => item.product_id === productId
            );
            if (wishlistItem) {
              setIsWishlisted(true);
              setWishlistItemId(wishlistItem.id);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProductData();
    }
  }, [productId]);

  const handleAddToCart = async () => {
    if (isAddingToCart || !product) return;

    setIsAddingToCart(true);
    setCartMessage(null);

    try {
      const response = await fetch('/api/cart/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setCartMessage('Added to bag!');
        setTimeout(() => setCartMessage(null), 2000);
      } else {
        setCartMessage(data.error || 'Failed to add');
        setTimeout(() => setCartMessage(null), 3000);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      setCartMessage('Something went wrong');
      setTimeout(() => setCartMessage(null), 3000);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (isTogglingWishlist || !product) return;

    setIsTogglingWishlist(true);

    try {
      if (isWishlisted && wishlistItemId) {
        // Remove from wishlist
        const response = await fetch(`/api/wishlist/${wishlistItemId}`, {
          method: 'DELETE',
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setIsWishlisted(false);
          setWishlistItemId(null);
        } else {
          console.error('Error removing from wishlist:', data.error);
        }
      } else {
        // Add to wishlist
        const response = await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ product_id: product.id }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setIsWishlisted(true);
          if (data.data?.id) {
            setWishlistItemId(data.data.id);
          }
        } else {
          console.error('Error adding to wishlist:', data.error);
        }
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    } finally {
      setIsTogglingWishlist(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading product...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-800">Product not found</h2>
            <Link href="/products" className="mt-4 inline-block text-pink-500 hover:text-pink-600">
              Browse products
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const images = product.images && product.images.length > 0
    ? product.images
    : [product.thumbnail || '/images/makeup/lipsticks/products/product-1.png'];

  const discountPercentage = product.discount_percentage ||
    (product.original_price && product.price
      ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
      : 0);

  return (
    <div className="min-h-screen bg-white">
      {/* Sale Banner */}
      <div className="relative w-full h-[140px] md:h-[280px] overflow-hidden bg-[#d7f0f4]">
        <Image
          src="/images/makeup/banners/sale-banner.png"
          alt="Sale - Limited Time Only - Up to 30% Off"
          fill
          className="object-cover object-center"
          priority
        />
      </div>

      {/* Breadcrumb Navigation */}
      <div className="max-w-[1680px] mx-auto px-4 lg:px-[120px] py-4">
        <nav className="flex items-center gap-2 text-sm">
          <Link href="/" className="text-gray-500 hover:text-pink-600 transition-colors">
            Home
          </Link>
          <svg width="7" height="12" viewBox="0 0 7 12" fill="none" className="text-gray-400">
            <path d="M1 1L6 6L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {product.category && (
            <>
              <Link href={`/products?category=${product.category.slug}`} className="text-gray-500 hover:text-pink-600 transition-colors">
                {product.category.name}
              </Link>
              <svg width="7" height="12" viewBox="0 0 7 12" fill="none" className="text-gray-400">
                <path d="M1 1L6 6L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </>
          )}
          <span className="text-gray-900 font-medium truncate max-w-[200px] md:max-w-xs">{product.name}</span>
        </nav>
      </div>

      {/* Product Section */}
      <section className="max-w-[1680px] mx-auto px-4 lg:px-[120px] py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Image Gallery */}
          <div className="flex flex-col-reverse md:flex-row gap-4">
            {/* Thumbnail Navigation */}
            <div className="flex md:flex-col gap-3 items-center">
              <button
                className="hidden md:flex p-2 hover:bg-gray-100 rounded transition-colors"
                onClick={() => setSelectedImage(Math.max(0, selectedImage - 1))}
              >
                <ChevronUp />
              </button>
              <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto md:max-h-[450px] scrollbar-hide">
                {images.slice(0, 5).map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`flex-shrink-0 w-[68px] h-[68px] border-2 rounded-lg overflow-hidden transition-all ${selectedImage === idx ? 'border-pink-500 shadow-md' : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} ${idx + 1}`}
                      width={68}
                      height={68}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
              <button
                className="hidden md:flex p-2 hover:bg-gray-100 rounded transition-colors"
                onClick={() => setSelectedImage(Math.min(images.length - 1, selectedImage + 1))}
              >
                <ChevronDown />
              </button>
            </div>

            {/* Main Image */}
            <div className="flex-1 bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
              <div className="relative w-full aspect-square">
                <Image
                  src={images[selectedImage]}
                  alt={product.name}
                  fill
                  className="object-contain p-6"
                  priority
                />
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-5">
            {/* Title and Wishlist */}
            <div className="flex justify-between items-start gap-4">
              <h1 className="text-xl lg:text-2xl font-medium text-gray-900 leading-snug">
                {product.name}
              </h1>
              <button
                onClick={handleToggleWishlist}
                disabled={isTogglingWishlist}
                className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <HeartIcon filled={isWishlisted} />
              </button>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} filled={i < Math.round(product.rating_average)} size={14} />
                ))}
              </div>
              <span className="text-sm text-gray-700">{product.rating_average.toFixed(1)}/5</span>
              <span className="text-gray-300">|</span>
              <span className="text-sm text-gray-500">{product.rating_count} ratings & {reviews.length} reviews</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-3xl font-bold text-gray-900">₹{product.price}</span>
              {product.original_price && product.original_price > product.price && (
                <>
                  <span className="text-lg text-gray-400 line-through">₹{product.original_price}</span>
                  <span className="text-lg text-green-600 font-medium">{discountPercentage}% Off</span>
                </>
              )}
            </div>

            <p className="text-sm text-gray-500">inclusive of all taxes</p>

            {/* Offers */}
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-100 rounded-lg p-4 space-y-2">
              <p className="text-sm font-medium text-gray-800">
                ✨ Extra 10% Off On all {product.brand?.name || 'brand'} orders above ₹1499
              </p>
              <button className="text-sm text-pink-600 font-medium hover:underline">
                View More Offers
              </button>
            </div>

            {/* Add to Bag */}
            <div className="relative">
              {cartMessage && (
                <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg z-10">
                  {cartMessage}
                </div>
              )}
              <button
                onClick={handleAddToCart}
                disabled={isAddingToCart}
                className={`w-full md:w-auto px-16 py-4 rounded-lg font-medium text-white transition-all ${isAddingToCart
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-pink-500 hover:bg-pink-600 shadow-md hover:shadow-lg'
                  }`}
              >
                {isAddingToCart ? 'Adding...' : 'Add to Bag'}
              </button>
            </div>

            {/* Delivery Options */}
            <div className="border border-gray-200 rounded-lg p-5 space-y-4">
              <div className="flex items-center gap-2">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#374151" strokeWidth="1.5">
                  <path d="M13 17H17V9L12 4H3V17H7M13 17C13 18.1046 12.1046 19 11 19C9.89543 19 9 18.1046 9 17M13 17C13 15.8954 12.1046 15 11 15C9.89543 15 9 15.8954 9 17M7 17C7 18.1046 6.10457 19 5 19C3.89543 19 3 18.1046 3 17M7 17C7 15.8954 6.10457 15 5 15C3.89543 15 3 15.8954 3 17" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 4V9H17" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <h3 className="font-medium text-gray-900">Delivery Options</h3>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="Enter pincode"
                  maxLength={6}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
                />
                <button className="px-5 py-2.5 text-pink-600 font-medium hover:bg-pink-50 rounded-lg transition-colors text-sm">
                  Check
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Description */}
      <section className="max-w-[1680px] mx-auto px-4 lg:px-[120px] py-10">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-6">Product Description</h2>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex gap-1">
            {[
              { id: 'description', label: 'Description' },
              { id: 'ingredients', label: 'Ingredients' },
              { id: 'how-to-use', label: 'How To Use' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-5 py-3 font-medium text-sm transition-colors relative ${activeTab === tab.id
                  ? 'text-pink-600'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-500" />
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {activeTab === 'description' && (
                <>
                  {/* Product Banner Image */}
                  <div className="relative w-full aspect-[2/1] rounded-xl overflow-hidden bg-gradient-to-r from-teal-50 to-teal-100">
                    <Image
                      src={images[0] || '/images/makeup/lipsticks/products/product-1.png'}
                      alt="Product banner"
                      fill
                      className="object-contain p-8"
                    />
                  </div>
                  <div className="prose prose-gray max-w-none">
                    <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                      {product.description ||
                        `${product.name} brings together two serums that work in different ways: Thiamidol, an effective and patented ingredient that acts at the root cause of hyperpigmentation is clinically proven to reduce dark spots and prevent their re-appearance. And Concentrated Hyaluronic Acid, one of skin's most effective moisturizing substances helps skin to attract and retain moisture.`}
                    </p>
                  </div>
                  <button className="text-pink-600 font-medium hover:underline flex items-center gap-2 text-sm">
                    Read More
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M4 2L8 6L4 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </>
              )}

              {activeTab === 'ingredients' && (
                <div className="max-w-2xl">
                  {product.ingredients && product.ingredients.length > 0 ? (
                    <ul className="space-y-3">
                      {product.ingredients.map((ingredient, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-sm md:text-base">
                          <span className="text-pink-500 mt-1.5">•</span>
                          <span className="text-gray-700">{ingredient}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500">No ingredients information available.</p>
                  )}
                </div>
              )}

              {activeTab === 'how-to-use' && (
                <div className="max-w-2xl">
                  {product.how_to_use && product.how_to_use.length > 0 ? (
                    <ol className="space-y-4">
                      {product.how_to_use.map((step, idx) => (
                        <li key={idx} className="flex gap-4">
                          <span className="flex-shrink-0 w-8 h-8 bg-pink-500 text-white rounded-full flex items-center justify-center font-medium text-sm">
                            {idx + 1}
                          </span>
                          <span className="text-gray-700 pt-1 text-sm md:text-base">{step}</span>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="text-gray-500">No usage instructions available.</p>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar Product Card */}
            <div className="lg:col-span-1">
              <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm sticky top-4">
                <div className="flex gap-4">
                  {/* Small Product Image */}
                  <div className="w-[120px] h-[120px] flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden">
                    <Image
                      src={product.thumbnail || images[0]}
                      alt={product.name}
                      width={120}
                      height={120}
                      className="w-full h-full object-contain p-2"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 space-y-2">
                    <h3 className="text-sm font-medium text-gray-900 line-clamp-3 leading-snug">
                      {product.name}
                    </h3>
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-lg font-bold">₹{product.price}</span>
                      {product.original_price && product.original_price > product.price && (
                        <>
                          <span className="text-xs text-gray-400 line-through">₹{product.original_price}</span>
                          <span className="text-xs text-green-600">{discountPercentage}% Off</span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs">
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon key={i} filled={i < Math.round(product.rating_average)} size={12} />
                        ))}
                      </div>
                      <span className="text-gray-600">{product.rating_average.toFixed(1)}/5</span>
                      <span className="text-gray-300">|</span>
                      <span className="text-gray-500">{product.rating_count}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleAddToCart}
                  className="w-full mt-4 bg-pink-500 hover:bg-pink-600 text-white font-medium py-3 px-4 rounded-lg transition-colors text-sm"
                >
                  Add to Bag
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="bg-gray-50 py-10">
        <div className="max-w-[1680px] mx-auto px-4 lg:px-[120px]">
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-8">Ratings & Reviews</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Rating Summary */}
            <div className="space-y-3">
              <div className="text-5xl md:text-6xl font-bold text-gray-900">{product.rating_average.toFixed(1)}/5</div>
              <div className="text-lg text-gray-600">Overall Rating</div>
              <div className="text-sm text-gray-500">{product.rating_count} verified ratings</div>
              <button className="mt-4 bg-pink-500 hover:bg-pink-600 text-white font-medium py-2.5 px-6 rounded-lg transition-colors text-sm">
                Write Review
              </button>
            </div>

            {/* Customer Photos */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Photos From Customers</h3>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {[...Array(8)].map((_, idx) => (
                  <div
                    key={idx}
                    className="flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden bg-gray-200"
                  >
                    {reviews[idx]?.images?.[0] ? (
                      <Image
                        src={reviews[idx].images![0]}
                        alt={`Review ${idx + 1}`}
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200" />
                    )}
                  </div>
                ))}
                <div className="flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-lg bg-gray-300/50 flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-600 text-center px-2">+ {Math.max(0, reviews.length - 8)} more</span>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Options */}
          <div className="flex flex-wrap items-center justify-between gap-4 py-5 border-y border-gray-200 mb-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-gray-700 font-medium text-sm">Filter By</span>
              <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-white transition-colors flex items-center gap-2">
                Ratings
                <ChevronDown />
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-white transition-colors flex items-center gap-2">
                Reviews By
                <ChevronDown />
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-white transition-colors">
                Reviews with image
              </button>
            </div>
            <button className="text-sm text-gray-500 hover:text-gray-700">Reset filters</button>
          </div>

          {/* Reviews List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {(reviews.length > 0 ? reviews.slice(0, 6) : mockReviews).map((review, index) => (
              <div key={review.id || index} className="bg-white rounded-xl p-5 space-y-3 shadow-sm">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} filled={i < review.rating} size={14} />
                  ))}
                </div>

                {review.title && (
                  <h4 className="font-medium text-gray-900 text-sm">&quot;{review.title}&quot;</h4>
                )}

                {review.comment && (
                  <p className="text-gray-600 text-sm line-clamp-2">{review.comment}</p>
                )}

                {review.images && review.images.length > 0 && (
                  <div className="w-16 h-16 rounded-lg overflow-hidden">
                    <Image
                      src={review.images[0]}
                      alt="Review image"
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-medium text-gray-800">
                      {review.user?.full_name || 'Anonymous'}
                    </span>
                    {review.is_verified_purchase && (
                      <>
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                          <circle cx="8" cy="8" r="7" fill="#10B981" />
                          <path d="M5 8L7 10L11 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span className="text-green-600">Verified buyer</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">From beautify</p>
                </div>

                <div className="flex items-center justify-between text-xs pt-2">
                  <span className="text-gray-400">
                    {new Date(review.created_at).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                  <button className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700">
                    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M4 8L2 6L4 4M10 8L12 6L10 4M7 2V12" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>{review.is_helpful || 0}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customers Also Viewed */}
      <section className="max-w-[1680px] mx-auto px-4 lg:px-[120px] py-10">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-8">Customers Also Viewed</h2>

        <div className="relative group">
          {/* Navigation Arrows */}
          <button className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-lg hidden md:flex items-center justify-center hover:bg-gray-50 transition-colors opacity-0 group-hover:opacity-100">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2">
              <path d="M15 18L9 12L15 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-lg hidden md:flex items-center justify-center hover:bg-gray-50 transition-colors opacity-0 group-hover:opacity-100">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2">
              <path d="M9 18L15 12L9 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <div className="overflow-x-auto pb-4 scrollbar-hide">
            <div className="flex gap-4">
              {(product.related_products && product.related_products.length > 0
                ? product.related_products
                : mockRelatedProducts
              ).slice(0, 6).map((relatedProduct, idx) => {
                const relatedDiscount = relatedProduct.discount_percentage ||
                  (relatedProduct.original_price && relatedProduct.price
                    ? Math.round(((relatedProduct.original_price - relatedProduct.price) / relatedProduct.original_price) * 100)
                    : 0);

                return (
                  <Link
                    key={relatedProduct.id || idx}
                    href={`/products/${relatedProduct.id}`}
                    className="flex-shrink-0 w-[220px] md:w-[260px] bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all group/card"
                  >
                    <div className="relative w-full aspect-square bg-gray-50">
                      <Image
                        src={relatedProduct.thumbnail || '/images/makeup/lipsticks/products/product-1.png'}
                        alt={relatedProduct.name}
                        fill
                        className="object-contain p-4 group-hover/card:scale-105 transition-transform duration-200"
                      />
                    </div>
                    <div className="p-4 space-y-2">
                      <h3 className="text-sm font-medium text-gray-900 line-clamp-2 min-h-[40px]">
                        {relatedProduct.name}
                      </h3>
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-base font-bold">₹{relatedProduct.price}</span>
                        {relatedProduct.original_price && relatedProduct.original_price > relatedProduct.price && (
                          <>
                            <span className="text-xs text-gray-400 line-through">₹{relatedProduct.original_price}</span>
                            <span className="text-xs text-green-600">{relatedDiscount}% Off</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <StarIcon key={i} filled={i < Math.round(relatedProduct.rating_average)} size={10} />
                          ))}
                        </div>
                        <span className="text-gray-600">{relatedProduct.rating_average.toFixed(1)}</span>
                        <span className="text-gray-300">|</span>
                        <span className="text-gray-500">{relatedProduct.rating_count}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          // Add to cart logic
                        }}
                        className="w-full bg-pink-500 hover:bg-pink-600 text-white font-medium py-2.5 px-4 rounded-lg transition-colors text-sm mt-2"
                      >
                        Add to Bag
                      </button>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

// Mock data for reviews when none are available
const mockReviews: Review[] = [
  {
    id: '1',
    product_id: '',
    user_id: '',
    rating: 5,
    title: 'Perfect for my skin',
    comment: 'BEST.',
    is_verified_purchase: true,
    is_approved: true,
    is_helpful: 0,
    created_at: '2025-11-12T00:00:00Z',
    updated_at: '2025-11-12T00:00:00Z',
    user: { id: '1', full_name: 'revati XYZ' }
  },
  {
    id: '2',
    product_id: '',
    user_id: '',
    rating: 5,
    title: 'It smells really good',
    comment: '',
    is_verified_purchase: true,
    is_approved: true,
    is_helpful: 0,
    created_at: '2025-11-04T00:00:00Z',
    updated_at: '2025-11-04T00:00:00Z',
    user: { id: '2', full_name: 'revati XYZ' }
  },
  {
    id: '3',
    product_id: '',
    user_id: '',
    rating: 5,
    title: 'Really nice tint.',
    comment: 'The tint is really subtle and non drying. Looks really good!',
    is_verified_purchase: true,
    is_approved: true,
    is_helpful: 0,
    created_at: '2025-10-20T00:00:00Z',
    updated_at: '2025-10-20T00:00:00Z',
    user: { id: '3', full_name: 'revati kamdar' }
  },
  {
    id: '4',
    product_id: '',
    user_id: '',
    rating: 5,
    title: 'Loved it. The New Formula is Amazing',
    comment: "It's a must buy! Amazing tint amazing hydration. The tint gets deeper as it sets on...",
    is_verified_purchase: true,
    is_approved: true,
    is_helpful: 1,
    created_at: '2025-11-07T00:00:00Z',
    updated_at: '2025-11-07T00:00:00Z',
    user: { id: '4', full_name: 'revati XYZ' }
  },
  {
    id: '5',
    product_id: '',
    user_id: '',
    rating: 5,
    title: 'it looks soo good on my lips',
    comment: 'Highly recommended, it gives a real nice clr.',
    is_verified_purchase: true,
    is_approved: true,
    is_helpful: 0,
    created_at: '2025-10-23T00:00:00Z',
    updated_at: '2025-10-23T00:00:00Z',
    user: { id: '5', full_name: 'revati XYZ' }
  },
];

// Mock related products
const mockRelatedProducts = [
  {
    id: 'related-1',
    name: 'Eucerin Anti-Pigment Night Cream With Thiamidol',
    slug: 'eucerin-anti-pigment-night-cream',
    price: 2592,
    original_price: 2880,
    discount_percentage: 10,
    thumbnail: '/images/makeup/lipsticks/products/product-1.png',
    rating_average: 4.6,
    rating_count: 48,
  },
  {
    id: 'related-2',
    name: 'Eucerin Anti-Pigment Night Cream With Thiamidol',
    slug: 'eucerin-anti-pigment-night-cream-2',
    price: 2592,
    original_price: 2880,
    discount_percentage: 10,
    thumbnail: '/images/makeup/lipsticks/products/product-2.png',
    rating_average: 4.6,
    rating_count: 48,
  },
  {
    id: 'related-3',
    name: 'Eucerin Anti-Pigment Night Cream With Thiamidol',
    slug: 'eucerin-anti-pigment-night-cream-3',
    price: 2592,
    original_price: 2880,
    discount_percentage: 10,
    thumbnail: '/images/makeup/lipsticks/products/product-3.png',
    rating_average: 4.6,
    rating_count: 48,
  },
  {
    id: 'related-4',
    name: 'Eucerin Anti-Pigment Night Cream With Thiamidol',
    slug: 'eucerin-anti-pigment-night-cream-4',
    price: 2592,
    original_price: 2880,
    discount_percentage: 10,
    thumbnail: '/images/makeup/lipsticks/products/product-4.png',
    rating_average: 4.6,
    rating_count: 48,
  },
  {
    id: 'related-5',
    name: 'Eucerin Anti-Pigment Night Cream With Thiamidol',
    slug: 'eucerin-anti-pigment-night-cream-5',
    price: 2592,
    original_price: 2880,
    discount_percentage: 10,
    thumbnail: '/images/makeup/lipsticks/products/product-5.png',
    rating_average: 4.6,
    rating_count: 48,
  },
  {
    id: 'related-6',
    name: 'Eucerin Anti-Pigment Night Cream With Thiamidol',
    slug: 'eucerin-anti-pigment-night-cream-6',
    price: 2592,
    original_price: 2880,
    discount_percentage: 10,
    thumbnail: '/images/makeup/lipsticks/products/product-6.png',
    rating_average: 4.6,
    rating_count: 48,
  },
];
