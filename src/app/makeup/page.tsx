import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/layout/Footer";

// Category data
const categories = [
  { id: 'new-launch', name: 'New Launch', img: '/images/makeup/categories/new-launch.png' },
  { id: 'lipstick', name: 'Lipstick', img: '/images/makeup/categories/lipstick.png' },
  { id: 'foundation', name: 'Foundation', img: '/images/makeup/categories/foundation.png' },
  { id: 'bridal-store', name: 'Bridal Store', img: '/images/makeup/categories/bridal-store.png' },
  { id: 'bestseller', name: 'Bestseller', img: '/images/makeup/categories/bestseller.png' },
  { id: 'eye-shadow', name: 'Eye Shadow', img: '/images/makeup/categories/eye-shadow.png' },
  { id: 'concealer', name: 'Concealer', img: '/images/makeup/categories/concealer.png' },
];

// Emerging brands data
const emergingBrands = [
  { id: 1, img: '/images/makeup/brands/brand-1.png', discount: 'Up To 10% Off', offer: 'On Entire Range' },
  { id: 2, img: '/images/makeup/brands/brand-2.png', discount: 'Up To 10% Off', offer: 'On Entire Range' },
  { id: 3, img: '/images/makeup/brands/brand-3.png', discount: 'Up To 10% Off', offer: 'On Entire Range' },
  { id: 4, img: '/images/makeup/brands/brand-4.png', discount: 'Up To 10% Off', offer: 'On Entire Range' },
  { id: 5, img: '/images/makeup/brands/brand-5.png', discount: 'Up To 10% Off', offer: 'On Entire Range' },
  { id: 6, img: '/images/makeup/brands/brand-1.png', discount: 'Up To 10% Off', offer: 'On Entire Range' },
];

// Tutorial videos data
const tutorialVideos = [
  { id: 1, img: '/images/makeup/tutorials/tutorial-1.png', title: 'All roads lead to Paris🪽' },
  { id: 2, img: '/images/makeup/tutorials/tutorial-1.png', title: 'Cute packaging made me buy it' },
  { id: 3, img: '/images/makeup/tutorials/tutorial-1.png', title: 'Fruit-inspired beauty trend: Guava makeup' },
  { id: 4, img: '/images/makeup/tutorials/tutorial-1.png', title: 'Luxe beauty, simplified by Chantecaille' },
];

// Featured products data
const featuredProducts = [
  { id: 1, brand: 'Huda Beauty', name: 'Huda Beauty Icy Nude Eyeshadow Palette (16.1 g)', price: '₹6,200', discountPrice: '₹5,642', rating: 3.5, reviews: 11, img: '/images/makeup/featured/huda-beauty-nude.png', variant: '16.1 g' },
  { id: 2, brand: 'Huda Beauty', name: 'Huda Beauty Easy Bake Loose Powder - 2.0 Ube Birthday Cake (20 g)', price: '₹3,250', discountPrice: '₹2,762', rating: 4.8, reviews: 6, img: '/images/makeup/featured/huda-beauty-bake.png', variant: '2.0 Ube Birthday Cake' },
  { id: 3, brand: 'Huda Beauty', name: 'Huda Beauty Blush Filter Liquid Blush - Strawberry Cream (4.5 ml)', price: '₹2,250', discountPrice: '₹1,912', rating: 4.3, reviews: 4, img: '/images/makeup/featured/huda-blush-strawberry.png', variant: 'Strawberry Cream' },
  { id: 4, brand: 'Huda Beauty', name: 'Huda Beauty Brown Obsessions Palette - Caramel (7.5 g)', price: '₹2,700', discountPrice: '₹2,295', rating: 4.8, reviews: 25, img: '/images/makeup/featured/huda-color-corrector.png', variant: 'Caramel' },
  { id: 5, brand: 'Huda Beauty', name: 'Huda Beauty Soft Focus Bridal Set Combo', price: '₹3,710', originalPrice: '₹5,300', discount: '30% off', rating: 4.6, reviews: 8, img: '/images/makeup/featured/huda-bridal-set.png', variant: '30 ml' },
];

// Shop the look data
const shopTheLook = [
  { id: 1, name: 'Bridal Store', img: '/images/makeup/looks/bridal-store.png' },
  { id: 2, name: 'Peach Fuzz Glam', img: '/images/makeup/looks/peach-fuzz-glam.png' },
  { id: 3, name: 'Colour Drenched', img: '/images/makeup/looks/colour-drenched.png' },
  { id: 4, name: 'French Girl Beauty', img: '/images/makeup/looks/french-girl-beauty.png' },
  { id: 5, name: 'Glazed Donut Lips', img: '/images/makeup/looks/glazed-donut-lips.png' },
  { id: 6, name: 'CLOUD-SKIN', img: '/images/makeup/looks/cloud-skin.png' },
];

// Bestseller products for grid
const bestsellers = [
  { id: 1, img: '/images/makeup/bestsellers/bestseller-1.png', productImg: '/images/makeup/featured/huda-beauty-nude.png' },
  { id: 2, img: '/images/makeup/bestsellers/bestseller-2.png', productImg: '/images/makeup/featured/huda-beauty-bake.png' },
  { id: 3, img: '/images/makeup/bestsellers/bestseller-3.png', productImg: '/images/makeup/featured/huda-blush-strawberry.png' },
  { id: 4, img: '/images/makeup/bestsellers/bestseller-4.png', productImg: '/images/makeup/featured/huda-color-corrector.png' },
  { id: 5, img: '/images/makeup/bestsellers/bestseller-1.png', productImg: '/images/makeup/featured/huda-primer.png' },
  { id: 6, img: '/images/makeup/bestsellers/bestseller-2.png', productImg: '/images/makeup/featured/huda-blush-ube.png' },
  { id: 7, img: '/images/makeup/bestsellers/bestseller-3.png', productImg: '/images/makeup/featured/huda-bridal-set.png' },
  { id: 8, img: '/images/makeup/bestsellers/bestseller-4.png', productImg: '/images/makeup/featured/huda-bake-peach.png' },
  { id: 9, img: '/images/makeup/bestsellers/bestseller-1.png', productImg: '/images/makeup/featured/huda-blush-cotton.png' },
  { id: 10, img: '/images/makeup/bestsellers/bestseller-2.png', productImg: '/images/makeup/featured/huda-color-lychee.png' },
  { id: 11, img: '/images/makeup/bestsellers/bestseller-3.png', productImg: '/images/makeup/featured/huda-blush-black-cherry.png' },
  { id: 12, img: '/images/makeup/bestsellers/bestseller-4.png', productImg: '/images/makeup/featured/huda-blush-peach-sorbet.png' },
  { id: 13, img: '/images/makeup/bestsellers/bestseller-1.png', productImg: '/images/makeup/featured/huda-blush-watermelon.png' },
  { id: 14, img: '/images/makeup/bestsellers/bestseller-2.png', productImg: '/images/makeup/featured/huda-beauty-nude.png' },
  { id: 15, img: '/images/makeup/bestsellers/bestseller-3.png', productImg: '/images/makeup/featured/huda-beauty-bake.png' },
];

export default function MakeupPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Header would be here - using layout */}

      {/* Makeup Store Banner */}
      <section className="bg-gradient-to-r from-pink-100 to-pink-50 py-8">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">The Makeup Store</h1>
              <p className="text-gray-600 text-lg">Discover a limitless range of makeup</p>
            </div>
            <div className="hidden md:block">
              <span className="text-[80px] md:text-[120px] font-bold text-pink-200/60 select-none">
                Makeup
              </span>
            </div>
            <Link
              href="/products?category=makeup"
              className="text-pink-600 hover:text-pink-700 font-medium flex items-center gap-1 transition-colors"
            >
              Explore All Makeup products
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="-ml-2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Category Icons */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/products?category=${category.id}`}
              className="flex flex-col items-center min-w-[120px] group"
            >
              <div className="relative w-[120px] h-[120px] md:w-[192px] md:h-[192px] rounded-full overflow-hidden mb-3 bg-pink-50 group-hover:shadow-lg transition-shadow">
                <Image
                  src={category.img}
                  alt={category.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <span className="text-sm font-medium text-gray-700 text-center">{category.name}</span>
            </Link>
          ))}
          {/* Next Arrow */}
          <button className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition hidden md:flex">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </section>

      {/* Product Grid - Checkered Pattern */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 1, 3, 1, 3, 2, 3, 1, 2, 1].map((i, idx) => (
            <div
              key={idx}
              className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer"
            >
              <Image
                src={`/images/makeup/grid/grid-${i}.png`}
                alt={`Makeup Product ${idx + 1}`}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Bestsellers Banner */}
      <section className="bg-gradient-to-r from-amber-100 to-yellow-50 py-4 mb-8">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">OUR TOP 10 LUXE PRODUCTS</h2>
            <span className="text-[60px] md:text-[80px] font-bold text-amber-200/60 select-none">
              bestsellers
            </span>
          </div>
        </div>
      </section>

      {/* Bestseller Products Grid */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mb-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {bestsellers.slice(0, 15).map((item) => (
            <div key={item.id} className="bg-white rounded-lg overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow">
              <div className="relative">
                {/* Background Image */}
                <div className="relative h-[200px] md:h-[280px] overflow-hidden">
                  <Image
                    src={item.img}
                    alt={`Bestseller ${item.id}`}
                    fill
                    className="object-cover"
                  />
                </div>
                {/* Product Circle Image */}
                <div className="absolute bottom-[-30px] left-1/2 -translate-x-1/2 w-[100px] h-[100px] md:w-[145px] md:h-[145px] rounded-full overflow-hidden border-4 border-white shadow-lg bg-white">
                  <Image
                    src={item.productImg}
                    alt={`Product ${item.id}`}
                    fill
                    className="object-contain p-2"
                  />
                </div>
              </div>
              <div className="pt-12 pb-4 px-3 text-center">
                {/* Empty space for product overflow */}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Emerging Brands */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mb-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Emerging Brands</h2>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {emergingBrands.map((brand) => (
            <div key={brand.id} className="min-w-[200px] md:min-w-[272px] bg-white rounded-lg overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow">
              <div className="relative h-[200px] md:h-[272px]">
                <Image
                  src={brand.img}
                  alt={`Brand ${brand.id}`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4 bg-gray-50">
                <p className="font-medium text-gray-900">{brand.discount}</p>
                <p className="text-sm text-gray-600">{brand.offer}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tira Tube / Tutorial Videos */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mb-12">
        <div className="flex items-center justify-center gap-2 mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Tira Tube</h2>
          <div className="w-6 h-6 bg-pink-500 rounded flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
        <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
          {tutorialVideos.map((video) => (
            <div key={video.id} className="relative min-w-[280px] md:min-w-[358px] h-[350px] md:h-[426px] rounded-lg overflow-hidden group cursor-pointer">
              <Image
                src={video.img}
                alt={video.title}
                fill
                className="object-cover"
              />
              {/* Play Button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#333">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
              {/* Shopping Bag Icon */}
              <div className="absolute top-3 right-3 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 01-8 0" />
                </svg>
              </div>
              {/* Gradient Overlay */}
              <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent" />
              {/* Title */}
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-white font-medium text-sm md:text-base">{video.title}</p>
              </div>
            </div>
          ))}
          {/* Next Button */}
          <button className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-20 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 transition hidden md:flex">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </section>

      {/* Get The Look Banner */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mb-12">
        <div className="relative rounded-xl overflow-hidden">
          <div className="relative h-[300px] md:h-[380px]">
            <Image
              src="/images/makeup/looks/bridal-store.png"
              alt="Get The Look"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-pink-900/60 to-transparent" />
            <div className="absolute top-8 left-8">
              <h2 className="text-4xl md:text-6xl font-bold text-white leading-tight">
                Get<br />The<br />Look
              </h2>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Featured Products</h2>
          <Link href="/products?featured=true" className="text-pink-600 hover:text-pink-700 font-medium flex items-center gap-1">
            View All
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </Link>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {featuredProducts.map((product) => (
            <div key={product.id} className="min-w-[230px] md:min-w-[288px] bg-white rounded-lg overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow">
              {/* Product Image */}
              <div className="relative h-[240px] md:h-[300px] bg-gray-50">
                <Image
                  src={product.img}
                  alt={product.name}
                  fill
                  className="object-contain p-4"
                />
                {/* Wishlist Button */}
                <button className="absolute top-2 right-2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow hover:bg-gray-50 transition">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                  </svg>
                </button>
              </div>
              {/* Product Info */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-500">{product.brand}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium">{product.rating}</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#FFB800">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    <span className="text-xs text-gray-400">| {product.reviews}</span>
                  </div>
                </div>
                <h3 className="text-sm text-gray-800 mb-2 line-clamp-2">{product.name}</h3>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-gray-900">{product.price}</span>
                  {product.originalPrice && (
                    <>
                      <span className="text-sm text-gray-400 line-through">{product.originalPrice}</span>
                      <span className="text-sm text-green-600">({product.discount})</span>
                    </>
                  )}
                </div>
                {product.discountPrice && (
                  <div className="bg-pink-50 rounded-full px-3 py-1 inline-flex items-center gap-2">
                    <span className="text-xs text-pink-700">Get for {product.discountPrice}</span>
                    <span className="text-pink-300">•</span>
                    <span className="text-xs text-pink-700">Free gifts</span>
                  </div>
                )}
                {/* Variant */}
                <div className="mt-3">
                  <span className="text-xs border border-gray-200 rounded px-2 py-1 text-gray-600">{product.variant}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* New Launch - L'Oreal Banner */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">New Launch</h2>
        <div className="relative h-[100px] md:h-[133px] rounded-lg overflow-hidden">
          <Image
            src="/images/makeup/banners/loreal-1.png"
            alt="L'Oreal Paris"
            fill
            className="object-cover"
          />
        </div>
      </section>

      {/* L'Oreal Big Banner */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mb-12">
        <div className="relative h-[300px] md:h-[400px] rounded-lg overflow-hidden">
          <Image
            src="/images/makeup/banners/loreal-2.png"
            alt="L'Oreal Paris Collection"
            fill
            className="object-cover"
          />
        </div>
      </section>

      {/* Model Photos - Lip Finishes */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mb-12">
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {[
            { name: 'Shine Finish', img: '/images/makeup/looks/french-girl-beauty.png' },
            { name: 'Matte Finish', img: '/images/makeup/looks/peach-fuzz-glam.png' },
            { name: 'Gloss Finish', img: '/images/makeup/looks/glazed-donut-lips.png' },
          ].map((finish, idx) => (
            <div key={idx} className="min-w-[300px] md:min-w-[520px] group cursor-pointer">
              <div className="relative h-[250px] md:h-[312px] rounded-lg overflow-hidden mb-2">
                <Image
                  src={finish.img}
                  alt={finish.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <p className="text-center text-gray-700 font-medium">{finish.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Shop The Look */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mb-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Shop The Look</h2>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {shopTheLook.map((look) => (
            <div key={look.id} className="min-w-[200px] md:min-w-[272px] group cursor-pointer">
              <div className="relative h-[280px] md:h-[363px] rounded-lg overflow-hidden mb-2">
                <Image
                  src={look.img}
                  alt={look.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <p className="text-center text-gray-700 font-medium">{look.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer Component */}
      <Footer />
    </main>
  );
}
