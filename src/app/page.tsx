import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* 1. Golden Ticker */}
      <div className="bg-[#D4AF37] text-white text-[10px] md:text-xs py-1.5 px-4 text-center tracking-widest font-medium overflow-hidden whitespace-nowrap">
        <span>FREE SHIPPING ON ALL ORDERS | GET A FREE POUCH ON ORDERS ABOVE 999 | CLICK HERE FOR DETAILS | FREE SHIPPING ON ALL ORDERS</span>
      </div>

      {/* 2. Ticker Banner - Mirror Sale */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mt-4">
        <div className="relative w-full h-[52px] rounded-lg overflow-hidden">
          <Image
            src="/images/homepage/ticker-mirror-sale.png"
            alt="Mirror Sale - Starting ₹299"
            fill
            className="object-cover"
            priority
          />
        </div>
      </section>

      {/* 3. Unwrap Header Banner */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mt-4">
        <div className="relative w-full h-[72px] rounded-lg overflow-hidden">
          <Image
            src="/images/homepage/unwrap-header.png"
            alt="Unwrap the Magic"
            fill
            className="object-cover"
          />
        </div>
      </section>

      {/* 4. Hero Carousel - 3 Slides */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mt-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer">
              <Image
                src="/images/homepage/hero-image.png"
                alt={`Hero Banner ${i}`}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                priority={i === 1}
              />
              <div className="absolute bottom-6 left-6">
                <button className="bg-white/90 backdrop-blur-sm text-gray-900 px-6 py-2.5 rounded-md font-medium hover:bg-white transition flex items-center gap-2">
                  Shop Now
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Extra 20% Off Strip */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mb-6">
        <div className="relative w-full h-[133px] rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
          <Image
            src="/images/homepage/extra20.png"
            alt="Get Extra 20% Off"
            fill
            className="object-cover"
          />
        </div>
      </section>

      {/* 6. Eucerin Banner */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mb-6">
        <div className="relative w-full h-[133px] rounded-lg overflow-hidden">
          <Image
            src="/images/homepage/eucerin-banner.png"
            alt="Eucerin Brand Focus"
            fill
            className="object-cover"
          />
        </div>
      </section>

      {/* 7. Eucerin Products Row */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mb-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { name: 'Anti-Pigment Dual Serum', img: 'eucerin-1.png' },
            { name: 'Anti-Pigment Night Cream', img: 'eucerin-2.png' },
            { name: 'Anti-Pigment Day Cream', img: 'eucerin-3.png' },
            { name: 'Anti-Pigment Dark Circle Eye Corrector', img: 'eucerin-4.png' },
            { name: 'Anti-Pigment Skin Perfecting Serum', img: 'eucerin-5.png' },
          ].map((product, idx) => (
            <div key={idx} className="bg-white group cursor-pointer">
              <div className="relative aspect-square mb-3 overflow-hidden rounded-lg">
                <Image
                  src={`/images/homepage/${product.img}`}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <p className="text-sm text-gray-800 text-center leading-tight">{product.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 8. Unwrap Header 2 */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mb-8">
        <div className="relative w-full h-[73px] rounded-lg overflow-hidden">
          <Image
            src="/images/homepage/unwrap-header-2.png"
            alt="Sale Banner"
            fill
            className="object-cover"
          />
        </div>
      </section>

      {/* 9. Brand Deal Banners - 3 Cards with Offers */}
      <section className="bg-[#f4f4f4] py-8 mb-8">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {[
              { img: 'brand-deal-1.png', discount: 'Minimum 7% Off', offer: 'Get a Free Gift!' },
              { img: 'brand-deal-2.png', discount: 'Up To 40% Off', offer: 'B1G1 On Entire Nail Range' },
              { img: 'brand-deal-1.png', discount: 'Minimum 7% Off', offer: 'Get a Free Gift!' },
            ].map((deal, idx) => (
              <div key={idx} className="relative min-w-[340px] md:min-w-[520px] h-[360px] rounded-lg overflow-hidden flex-shrink-0 group cursor-pointer">
                <Image
                  src={`/images/homepage/${deal.img}`}
                  alt={deal.discount}
                  fill
                  className="object-cover"
                />
                {/* Brand Badge */}
                <div className="absolute top-0 left-0 w-[165px] h-[87px] bg-white/40 backdrop-blur-sm rounded-br-[50px] overflow-hidden">
                  <Image
                    src="/images/homepage/brand-badge.png"
                    alt="Brand"
                    fill
                    className="object-cover"
                  />
                </div>
                {/* Overlay Text */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                  <p className="text-white font-semibold text-xl">{deal.discount}</p>
                  <p className="text-white text-base">{deal.offer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. Fragrance Section Header */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mb-4">
        <div className="relative w-full h-[72px] rounded-lg overflow-hidden bg-[#ffdec2]">
          <div className="flex items-center justify-center h-full">
            <h2 className="text-2xl font-semibold text-gray-900">Seasonal Scents</h2>
          </div>
        </div>
      </section>

      {/* 11. Fragrance Category Cards */}
      <section className="bg-[#ffdec2] py-8 mb-8">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { img: 'fragrance-everyday.png', title: 'Your Everyday Fragrance', offer: 'Upto 30% Off' },
              { img: 'fragrance-under-999.png', title: 'Discover Scents', offer: 'Under ₹999' },
              { img: 'fragrance-premium.png', title: 'Premium & Luxe', offer: 'Up to 20% Off' },
              { img: 'fragrance-body-mists.png', title: 'Body Mists', offer: 'Upto 35% Off' },
              { img: 'fragrance-festive.png', title: 'Statement Scents', offer: 'Up to 40% Off' },
            ].map((cat, idx) => (
              <div key={idx} className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer hover:shadow-xl transition-shadow">
                <Image
                  src={`/images/homepage/${cat.img}`}
                  alt={cat.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 12. Best of Luxury Header */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mb-6">
        <div className="text-center py-4">
          <h2 className="text-2xl font-semibold text-gray-900">Best of Luxury</h2>
          <p className="text-gray-600">Shop Premium Brands</p>
        </div>
      </section>

      {/* 13. Luxury Brands Grid - Row 1 */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mb-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { img: 'brand-mac.png', name: 'M.A.C', offer: 'Buy 2 Get 1 Free On Full-size Products' },
            { img: 'brand-dior.png', name: 'DIOR', offer: 'Buy 2 Get 1 Free On Full-size Products' },
            { img: 'brand-carolina-herrera.png', name: 'Carolina Herrera', offer: 'Buy 2 Get 1 Free On Full-size Products' },
            { img: 'brand-eucerin-luxe.png', name: 'Eucerin', offer: 'Buy 2 Get 1 Free On Full-size Products' },
            { img: 'brand-caudalie.png', name: 'Caudalie', offer: 'Buy 2 Get 1 Free On Full-size Products' },
          ].map((brand, idx) => (
            <div key={idx} className="bg-white group cursor-pointer">
              <div className="relative aspect-square rounded-lg overflow-hidden mb-3">
                <Image
                  src={`/images/homepage/${brand.img}`}
                  alt={brand.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <p className="text-sm text-gray-700 text-center">{brand.offer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 14. Explore All Brands CTA */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mb-12">
        <div className="flex justify-center py-8">
          <button className="border-2 border-gray-900 text-gray-900 px-12 py-3 rounded-full font-medium hover:bg-gray-900 hover:text-white transition-colors">
            Explore All Brands
          </button>
        </div>
      </section>

      {/* 15. Latest Beauty Arrivals Header */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mb-6">
        <div className="relative overflow-hidden py-8">
          <div className="absolute inset-0 flex items-center justify-between opacity-10 text-[120px] font-bold text-gray-300 whitespace-nowrap pointer-events-none">
            <span>NEW</span>
            <span>NEW</span>
            <span>NEW</span>
          </div>
          <div className="relative text-center">
            <h2 className="text-3xl font-semibold text-gray-900">Latest Beauty Arrivals</h2>
            <p className="text-gray-600">You&apos;ll want to own</p>
          </div>
        </div>
      </section>

      {/* 16. New Arrivals Carousel Placeholder */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mb-8">
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="min-w-[250px] bg-white rounded-lg overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow">
              <div className="relative h-[300px] bg-gradient-to-b from-pink-50 to-white">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[98px] h-[55px] bg-gray-100 rounded-b-lg flex items-center justify-center">
                  <span className="text-xs text-gray-500">Brand</span>
                </div>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-20 h-32 bg-gradient-to-b from-pink-200 to-pink-100 rounded-full" />
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-6">
          <button className="border border-gray-300 text-gray-700 px-10 py-2.5 rounded-full font-medium hover:bg-gray-100 transition-colors">
            View All
          </button>
        </div>
      </section>

      {/* 17. Popular This Season */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mb-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6 capitalize">Popular This Season</h2>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {[
            { img: 'popular-1.png', discount: 'Upto 50% Off', sub: 'on Bestsellers' },
            { img: 'popular-2.png', discount: 'Upto 50% Off', sub: 'on Bestsellers' },
            { img: 'popular-3.png', discount: 'Upto 50% Off', sub: 'on Bestsellers' },
            { img: 'popular-4.png', discount: 'Upto 50% Off', sub: 'on Bestsellers' },
            { img: 'popular-5.png', discount: 'Upto 50% Off', sub: 'on Bestsellers' },
            { img: 'popular-6.png', discount: 'Upto 50% Off', sub: 'on Bestsellers' },
          ].map((item, idx) => (
            <div key={idx} className="bg-white group cursor-pointer">
              <div className="relative aspect-[3/4] rounded-lg overflow-hidden mb-3">
                <Image
                  src={`/images/homepage/${item.img}`}
                  alt={item.discount}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <p className="text-base font-medium text-gray-900">{item.discount}</p>
              <p className="text-sm text-gray-600">{item.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 18. The Gifting Corner */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mb-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6 capitalize">The Gifting Corner</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative h-[197px] rounded-lg overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow">
            <Image
              src="/images/homepage/gift-store.png"
              alt="Gift Store"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div className="relative h-[197px] rounded-lg overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow">
            <Image
              src="/images/homepage/gift-cards.png"
              alt="Gift Cards"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>
      </section>

      {/* 19. Beauty Your Way Tag */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mb-8">
        <div className="border-t border-gray-200 pt-8">
          <h2 className="text-2xl font-semibold text-gray-900">Beauty, Your Way</h2>
        </div>
      </section>

      {/* 20. Brand Discount Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mb-12">
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="min-w-[250px] bg-white rounded-lg overflow-hidden group cursor-pointer">
              <div className="relative h-[360px] bg-gray-100 rounded-lg overflow-hidden">
                <div className="absolute top-0 left-0 w-[165px] h-[68px] bg-white/50 backdrop-blur-sm rounded-br-3xl flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-700">Brand Logo</span>
                </div>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm px-6 py-2 rounded-full">
                  <span className="text-sm font-medium">24 H Hyderation</span>
                </div>
              </div>
              <div className="p-3">
                <p className="text-base font-medium text-gray-900">Upto 25% Off</p>
                <p className="text-sm text-gray-600">On Entire Brand</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 21. Shop All CTA */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mb-12">
        <div className="flex justify-center py-6">
          <button className="border border-gray-300 text-gray-700 px-12 py-3 rounded-full font-medium hover:bg-gray-100 transition-colors">
            Shop All
          </button>
        </div>
      </section>

      {/* Footer - Download App */}
      <section className="bg-gray-100 py-10">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <p className="text-sm text-gray-600 flex items-center gap-2 mb-3">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                experience the alouora mobile app
              </p>
              <div className="flex gap-3 justify-center md:justify-start">
                <button className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800 transition">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.523 2H6.477C5.11 2 4 3.11 4 4.477v15.046C4 20.89 5.11 22 6.477 22h11.046C18.89 22 20 20.89 20 19.523V4.477C20 3.11 18.89 2 17.523 2zM12 20c-.828 0-1.5-.672-1.5-1.5s.672-1.5 1.5-1.5 1.5.672 1.5 1.5-.672 1.5-1.5 1.5z"/>
                  </svg>
                  <div className="text-left">
                    <p className="text-[10px] opacity-80">Get it on</p>
                    <p className="text-sm font-semibold">Google Play</p>
                  </div>
                </button>
                <button className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800 transition">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  <div className="text-left">
                    <p className="text-[10px] opacity-80">Download on the</p>
                    <p className="text-sm font-semibold">App Store</p>
                  </div>
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <div>
                <p className="text-sm">for any help, you may call us at</p>
                <p className="font-semibold">1800-XXX-XXXX</p>
                <p className="text-xs text-gray-500">(Monday to Saturday, 8AM to 10PM)</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-8">
            {/* Logo & About */}
            <div className="col-span-2 md:col-span-1">
              <h3 className="text-2xl font-bold mb-4">ALOUORA</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="#" className="hover:text-white transition">Who are we?</Link></li>
                <li><Link href="#" className="hover:text-white transition">Careers</Link></li>
                <li><Link href="#" className="hover:text-white transition">Authenticity</Link></li>
                <li><Link href="#" className="hover:text-white transition">Press</Link></li>
                <li><Link href="#" className="hover:text-white transition">Testimonials</Link></li>
              </ul>
            </div>

            {/* Help */}
            <div>
              <h4 className="font-semibold mb-4">Help</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="#" className="hover:text-white transition">Contact Us</Link></li>
                <li><Link href="#" className="hover:text-white transition">FAQ</Link></li>
                <li><Link href="#" className="hover:text-white transition">Store Locator</Link></li>
                <li><Link href="#" className="hover:text-white transition">Cancellation & Return</Link></li>
                <li><Link href="#" className="hover:text-white transition">Shipping & Delivery</Link></li>
              </ul>
            </div>

            {/* Inspire Me */}
            <div>
              <h4 className="font-semibold mb-4">Inspire Me</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="#" className="hover:text-white transition">Beauty Book</Link></li>
                <li><Link href="#" className="hover:text-white transition">Games Board</Link></li>
                <li><Link href="#" className="hover:text-white transition">Buying Guides</Link></li>
              </ul>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="#" className="hover:text-white transition">Offer Zone</Link></li>
                <li><Link href="#" className="hover:text-white transition">New Launches</Link></li>
                <li><Link href="#" className="hover:text-white transition">Alouora Man</Link></li>
                <li><Link href="#" className="hover:text-white transition">Alouora Fashion</Link></li>
                <li><Link href="#" className="hover:text-white transition">Alouora Pro</Link></li>
              </ul>
            </div>

            {/* Top Categories */}
            <div>
              <h4 className="font-semibold mb-4">Top Categories</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="#" className="hover:text-white transition">Makeup</Link></li>
                <li><Link href="#" className="hover:text-white transition">Skin</Link></li>
                <li><Link href="#" className="hover:text-white transition">Hair</Link></li>
                <li><Link href="#" className="hover:text-white transition">Bath & Body</Link></li>
                <li><Link href="#" className="hover:text-white transition">Fragrance</Link></li>
                <li><Link href="#" className="hover:text-white transition">Luxe</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
            <p>© 2026 Alouora Beauty. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
