import Image from "next/image";
import Link from "next/link";

export default function Footer() {
    return (
        <>
            {/* Top Features Strip */}
            <section className="bg-[#fce4ec] py-6">
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <div className="flex flex-wrap justify-center md:justify-between items-center gap-6 md:gap-4">
                        {/* Feature 1 - Free Shipping */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 relative">
                                <Image
                                    src="/images/makeup/footer/free-shipping.svg"
                                    alt="Free Shipping"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900 text-sm">Free Shipping</p>
                                <p className="text-xs text-gray-600">On Orders Above ₹299</p>
                            </div>
                        </div>

                        {/* Feature 2 - Authentic Products */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 relative">
                                <Image
                                    src="/images/makeup/footer/authenticity.svg"
                                    alt="100% Authentic"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900 text-sm">100% Authentic</p>
                                <p className="text-xs text-gray-600">Products Sourced Directly</p>
                            </div>
                        </div>

                        {/* Feature 3 - Return Accepted */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 relative">
                                <Image
                                    src="/images/makeup/footer/return-accepted.svg"
                                    alt="Return Accepted"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900 text-sm">Return Accepted</p>
                                <p className="text-xs text-gray-600">Within 15 Days</p>
                            </div>
                        </div>

                        {/* Feature 4 - 2000+ Brands */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 relative">
                                <Image
                                    src="/images/makeup/footer/brands.svg"
                                    alt="2000+ Brands"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900 text-sm">2000+ Brands</p>
                                <p className="text-xs text-gray-600">To Choose From</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* App Download Section - Dark Gray Background */}
            <section className="bg-[#3a4047] py-10">
                <div className="max-w-[1200px] mx-auto px-4 md:px-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                        {/* Left - App Download */}
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            <div className="flex items-center gap-4">
                                <svg width="12" height="20" viewBox="0 0 12 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                                    <rect x="1" y="1" width="10" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                                    <circle cx="6" cy="16" r="1" fill="currentColor"/>
                                </svg>
                                <p className="text-white text-xs uppercase tracking-wider">
                                    Experience the Alouora mobile app
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <Link href="#" className="block hover:opacity-90 transition">
                                    <Image
                                        src="/images/footer/google-play.svg"
                                        alt="Get it on Google Play"
                                        width={122}
                                        height={36}
                                        className="h-9 w-auto"
                                        unoptimized
                                    />
                                </Link>
                                <Link href="#" className="block hover:opacity-90 transition">
                                    <Image
                                        src="/images/footer/app-store.svg"
                                        alt="Download on App Store"
                                        width={108}
                                        height={36}
                                        className="h-9 w-auto"
                                        unoptimized
                                    />
                                </Link>
                            </div>
                        </div>

                        {/* Right - Phone Support */}
                        <div className="flex items-start gap-3 text-white">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white mt-1">
                                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <div>
                                <p className="text-sm uppercase">For any help, you may call us at</p>
                                <p className="font-bold text-lg">1800-XXX-XXXX</p>
                                <p className="text-sm text-gray-300">(Monday to Saturday, 8AM to 10PM and Sunday, 10AM to 7PM)</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Footer - Gray Background */}
            <footer className="bg-[#8c8d94] text-white py-12">
                <div className="max-w-[1200px] mx-auto px-4 md:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">
                        {/* About Company - With Logo */}
                        <div>
                            <h3 className="text-2xl font-bold mb-6 uppercase tracking-wider">ALOUORA</h3>
                            <ul className="space-y-3 text-sm">
                                <li><Link href="#" className="hover:underline transition">Who Are We?</Link></li>
                                <li><Link href="#" className="hover:underline transition">Careers</Link></li>
                                <li><Link href="#" className="hover:underline transition">Authenticity</Link></li>
                                <li><Link href="#" className="hover:underline transition">Press</Link></li>
                                <li><Link href="#" className="hover:underline transition">Testimonials</Link></li>
                                <li><Link href="#" className="hover:underline transition">Alouora CSR</Link></li>
                                <li><Link href="#" className="hover:underline transition">Sustainability</Link></li>
                                <li><Link href="#" className="hover:underline transition">Responsible Disclosure</Link></li>
                                <li><Link href="#" className="hover:underline transition">Investor Relations</Link></li>
                                <li><Link href="#" className="hover:underline transition">Link to Smart ODR</Link></li>
                            </ul>
                        </div>

                        {/* Help */}
                        <div>
                            <h4 className="font-medium mb-6 text-sm">Help</h4>
                            <ul className="space-y-3 text-sm">
                                <li><Link href="#" className="hover:underline transition">Contact Us</Link></li>
                                <li><Link href="#" className="hover:underline transition">Frequently asked questions</Link></li>
                                <li><Link href="#" className="hover:underline transition">Store Locator</Link></li>
                                <li><Link href="#" className="hover:underline transition">Cancellation & Return</Link></li>
                                <li><Link href="#" className="hover:underline transition">Shipping & Delivery</Link></li>
                                <li><Link href="#" className="hover:underline transition">Sell on Alouora</Link></li>
                            </ul>
                        </div>

                        {/* Inspire Me */}
                        <div>
                            <h4 className="font-medium mb-6 text-sm">Inspire Me</h4>
                            <ul className="space-y-3 text-sm">
                                <li><Link href="#" className="hover:underline transition">Beauty Book</Link></li>
                                <li><Link href="#" className="hover:underline transition">Games Board</Link></li>
                                <li><Link href="#" className="hover:underline transition">Buying Guides</Link></li>
                            </ul>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h4 className="font-medium mb-6 text-sm">Quick Links</h4>
                            <ul className="space-y-3 text-sm">
                                <li><Link href="#" className="hover:underline transition">Offer Zone</Link></li>
                                <li><Link href="#" className="hover:underline transition">New Launches</Link></li>
                                <li><Link href="#" className="hover:underline transition">Alouora Man</Link></li>
                                <li><Link href="#" className="hover:underline transition">Alouora Fashion</Link></li>
                                <li><Link href="#" className="hover:underline transition">Alouora Pro</Link></li>
                                <li><Link href="#" className="hover:underline transition">Sitemap</Link></li>
                            </ul>
                        </div>

                        {/* Top Categories */}
                        <div>
                            <h4 className="font-medium mb-6 text-sm">Top Categories</h4>
                            <ul className="space-y-3 text-sm">
                                <li><Link href="/makeup" className="hover:underline transition">Makeup</Link></li>
                                <li><Link href="#" className="hover:underline transition">Skin</Link></li>
                                <li><Link href="#" className="hover:underline transition">Hair</Link></li>
                                <li><Link href="#" className="hover:underline transition">Bath & Body</Link></li>
                                <li><Link href="#" className="hover:underline transition">Appliances</Link></li>
                                <li><Link href="#" className="hover:underline transition">Mom and Baby</Link></li>
                                <li><Link href="#" className="hover:underline transition">Health & Wellness</Link></li>
                                <li><Link href="#" className="hover:underline transition">Fragrance</Link></li>
                                <li><Link href="#" className="hover:underline transition">Natural</Link></li>
                                <li><Link href="#" className="hover:underline transition">Luxe</Link></li>
                            </ul>
                        </div>
                    </div>

                    {/* Social Links */}
                    <div className="border-t border-white/20 pt-6">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <span className="text-sm">Follow Us</span>
                                <div className="flex gap-3">
                                    <Link href="#" className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
                                        </svg>
                                    </Link>
                                    <Link href="#" className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="currentColor" strokeWidth="2"/>
                                            <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2"/>
                                            <circle cx="18" cy="6" r="1.5"/>
                                        </svg>
                                    </Link>
                                    <Link href="#" className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" fill="none" stroke="currentColor" strokeWidth="2"/>
                                        </svg>
                                    </Link>
                                    <Link href="#" className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.25 29 29 0 00-.46-5.33z" fill="none" stroke="currentColor" strokeWidth="2"/>
                                            <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/>
                                        </svg>
                                    </Link>
                                    <Link href="#" className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 0a12 12 0 00-3.89 23.38c-.1-.94-.2-2.38 0-3.43l1.42-6.07s-.37-.74-.37-1.82c0-1.7.99-2.97 2.22-2.97 1.05 0 1.56.78 1.56 1.72 0 1.05-.67 2.62-1.02 4.07-.29 1.22.61 2.22 1.81 2.22 2.17 0 3.84-2.29 3.84-5.59 0-2.93-2.1-4.97-5.1-4.97-3.47 0-5.51 2.6-5.51 5.29 0 1.05.4 2.17.9 2.78.1.12.11.22.08.34-.09.37-.3 1.18-.34 1.34-.05.22-.17.26-.4.16-1.48-.69-2.4-2.86-2.4-4.6 0-3.75 2.73-7.2 7.87-7.2 4.13 0 7.35 2.95 7.35 6.88 0 4.1-2.59 7.41-6.18 7.41-1.21 0-2.34-.63-2.73-1.37l-.74 2.83c-.27 1.04-1 2.35-1.49 3.14A12 12 0 1012 0z" fill="none" stroke="currentColor" strokeWidth="1.5"/>
                                        </svg>
                                    </Link>
                                </div>
                            </div>
                            <p className="text-sm text-white/70">© 2026 Alouora E-Retail Pvt. Ltd. All Rights Reserved.</p>
                        </div>
                    </div>
                </div>
            </footer>
        </>
    );
}
