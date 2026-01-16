'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

interface WishlistItem {
  id: string;
  product_id: string;
  variant_id: string | null;
  added_at: string;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    original_price: number | null;
    discount_percentage: number | null;
    thumbnail: string | null;
    images: string[] | null;
    rating_average: number;
    rating_count: number;
    stock_quantity: number;
    is_active: boolean;
    badges: string[] | null;
    brand: { id: string; name: string; slug: string } | null;
    category: { id: string; name: string; slug: string } | null;
  } | null;
  variant: {
    id: string;
    name: string;
    sku: string;
    price_adjustment: number;
    stock_quantity: number;
    is_active: boolean;
    image_url: string | null;
  } | null;
  is_available: boolean;
}

export default function WishlistPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());
  const [addingToCartIds, setAddingToCartIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/wishlist');
      const data = await response.json();

      console.log('Wishlist API Response:', { status: response.status, data });

      if (response.ok && data.success) {
        const items = data.data?.items || [];
        console.log('Wishlist items fetched:', items.length);
        setWishlistItems(items);
      } else {
        console.error('Wishlist API Error:', data);
        if (response.status === 401) {
          router.push('/signin');
        } else {
          alert(data.error || 'Failed to load wishlist. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      alert('Failed to load wishlist. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (wishlistItemId: string) => {
    if (removingIds.has(wishlistItemId)) return;

    setRemovingIds((prev) => new Set(prev).add(wishlistItemId));

    try {
      const response = await fetch(`/api/wishlist/${wishlistItemId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok && data.success) {
        await fetchWishlist();
      } else {
        console.error('Error removing from wishlist:', data.error);
        alert(data.error || 'Failed to remove item from wishlist');
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setRemovingIds((prev) => {
        const next = new Set(prev);
        next.delete(wishlistItemId);
        return next;
      });
    }
  };

  const handleMoveToBag = async (item: WishlistItem) => {
    if (!item.product || addingToCartIds.has(item.id)) return;

    setAddingToCartIds((prev) => new Set(prev).add(item.id));

    try {
      const response = await fetch('/api/cart/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: item.product.id,
          quantity: 1,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        await handleRemoveFromWishlist(item.id);
      } else {
        console.error('Error adding to cart:', data.error);
        alert(data.error || 'Failed to add item to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setAddingToCartIds((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }
  };

  const getProductImage = (item: WishlistItem): string | null => {
    if (item.variant?.image_url) return item.variant.image_url;
    if (item.product?.thumbnail) return item.product.thumbnail;
    if (item.product?.images && item.product.images.length > 0) return item.product.images[0];
    return null;
  };

  const getProductPrice = (item: WishlistItem) => {
    if (!item.product) return { current: 0, original: 0, discount: 0 };
    
    const basePrice = item.product.price;
    const variantAdjustment = item.variant?.price_adjustment || 0;
    const currentPrice = basePrice + variantAdjustment;
    const originalPrice = item.product.original_price || basePrice;
    const discount = originalPrice > currentPrice 
      ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
      : 0;

    return { current: currentPrice, original: originalPrice, discount };
  };

  const StarRating = ({ rating }: { rating: number }) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill={star <= fullStars ? "#FFB800" : star === fullStars + 1 && hasHalfStar ? "#FFB800" : "#E5E5E5"}
          >
            <path d="M7 0L8.73 3.27H12.39L9.33 5.29L10.56 8.56L7 6.54L3.44 8.56L4.67 5.29L1.61 3.27H5.27L7 0Z" />
          </svg>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your wishlist...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-[1920px] mx-auto px-6 py-3">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-gray-500 hover:text-gray-700">Home</Link>
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gray-900 font-medium">My Wishlist</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-[1920px] mx-auto px-4 md:px-8 lg:px-[120px] py-10">
        {/* Page Title */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            My Wishlist <span className="text-pink-600">({wishlistItems.length})</span>
          </h1>
        </div>

        {/* Wishlist Items Grid */}
        {wishlistItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems
              .filter((item) => item.product !== null)
              .map((item) => {
                const { current, original, discount } = getProductPrice(item);
                const productImage = getProductImage(item);
                const isRemoving = removingIds.has(item.id);
                const isAddingToCart = addingToCartIds.has(item.id);

              return (
                <div
                  key={item.id}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow relative group"
                >
                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemoveFromWishlist(item.id)}
                    disabled={isRemoving}
                    className="absolute top-4 right-4 z-10 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isRemoving ? (
                      <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-gray-600"
                      >
                        <path d="M1 1L13 13M13 1L1 13" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>

                  {/* Product Image */}
                  <Link href={`/products/${item.product?.id}`} className="block relative bg-gray-50">
                    <div className="relative w-full aspect-square">
                      {productImage ? (
                        <Image
                          src={productImage}
                          alt={item.product?.name || 'Product'}
                          fill
                          className="object-contain p-4 group-hover:scale-105 transition-transform duration-200"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <svg
                            className="w-16 h-16 text-gray-300"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Product Info */}
                  <div className="p-6">
                    {/* Product Name */}
                    {item.product && (
                      <Link href={`/products/${item.product.id}`}>
                        <h3 className="text-sm font-medium text-gray-900 mb-3 line-clamp-2 min-h-[40px] hover:text-pink-600 transition-colors">
                          {item.product.name}
                        </h3>
                      </Link>
                    )}

                    {/* Price */}
                    <div className="flex items-baseline gap-2 mb-3 flex-wrap">
                      {original > current && (
                        <span className="text-sm text-gray-400 line-through">₹{original.toFixed(0)}</span>
                      )}
                      <span className="text-xl font-bold text-gray-900">₹{current.toFixed(0)}</span>
                      {discount > 0 && (
                        <span className="text-sm text-green-600 font-medium">{discount}% Off</span>
                      )}
                    </div>

                    {/* Rating */}
                    {item.product && (
                      <div className="flex items-center gap-2 mb-4">
                        <StarRating rating={item.product.rating_average || 0} />
                        <span className="text-xs text-gray-500">
                          ({item.product.rating_count || 0})
                        </span>
                      </div>
                    )}

                    {/* Action Button */}
                    <button
                      onClick={() => handleMoveToBag(item)}
                      disabled={isAddingToCart || !item.is_available}
                      className={`w-full py-3 rounded-lg font-medium text-white transition-colors ${
                        isAddingToCart || !item.is_available
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-pink-500 hover:bg-pink-600'
                      }`}
                    >
                      {isAddingToCart ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Adding...
                        </span>
                      ) : item.product && (item.product.category?.slug === 'lipstick' || item.product.category?.name?.toLowerCase().includes('lip')) ? (
                        'Preview Shades'
                      ) : (
                        'Move To Bag'
                      )}
                    </button>

                    {/* Out of Stock Message */}
                    {!item.is_available && (
                      <p className="text-xs text-red-500 mt-2 text-center">Out of Stock</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty Wishlist */
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-500 mb-6">Start adding products you love to your wishlist</p>
            <Link
              href="/products"
              className="bg-pink-500 text-white px-8 py-3 rounded-lg font-medium hover:bg-pink-600 transition-colors"
            >
              Browse Products
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
