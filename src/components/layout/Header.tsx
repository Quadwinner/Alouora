'use client';

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, FormEvent } from "react";
import { MagnifyingGlassIcon, ShoppingBagIcon, UserIcon, HeartIcon } from "@heroicons/react/24/outline";

export default function Header() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

    const handleSearch = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const query = searchQuery.trim();
        if (query) {
            // Navigate to products page with search query
            router.push(`/products?search=${encodeURIComponent(query)}`);
        }
    };

    return (
        <header className="sticky top-0 z-50 bg-white shadow-sm font-sans">
            {/* Top Bar - hidden on mobile */}
            <div className="hidden md:flex justify-between items-center px-4 md:px-8 lg:px-12 py-1 bg-gray-50 text-[10px] md:text-xs text-gray-500 border-b">
                <div className="flex gap-4">
                    <span>ALOUORA</span>
                    <span>More Brands</span>
                </div>
                <div className="flex gap-4">
                    <span>Sell on Alouora</span>
                    <span>Gift Cards</span>
                    <span>Help Center</span>
                </div>
            </div>

            {/* Main Header */}
            <div className="px-4 md:px-8 lg:px-12 py-3 md:py-4 flex items-center justify-between gap-4 md:gap-8">
                {/* Logo */}
                <Link href="/" className="flex-shrink-0">
                    <h1 className="text-2xl md:text-3xl font-serif text-[#b8860b] tracking-widest">ALOUORA</h1>
                </Link>

                {/* Search Bar - hidden on very small screens */}
                <form onSubmit={handleSearch} className="hidden sm:flex flex-1 max-w-xl relative">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search for products, brands and more"
                        className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#b8860b] placeholder:text-gray-400"
                    />
                    <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </form>

                {/* Actions */}
                <div className="flex items-center gap-4 md:gap-6">
                    <button className="flex items-center gap-2 group">
                        <HeartIcon className="w-6 h-6 text-gray-700 group-hover:text-[#b8860b] transition-colors" />
                    </button>
                    <Link href="/cart" className="flex items-center gap-2 group relative">
                        <ShoppingBagIcon className="w-6 h-6 text-gray-700 group-hover:text-[#b8860b] transition-colors" />
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#b8860b] text-white text-[10px] flex items-center justify-center rounded-full">2</span>
                    </Link>
                    <Link href="/profile" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden border border-gray-300 group-hover:border-[#b8860b] transition-colors">
                            <UserIcon className="w-full h-full p-1 text-gray-500" />
                        </div>
                    </Link>
                </div>
            </div>

            {/* Navigation Links */}
            <nav className="hidden lg:flex items-center justify-center gap-8 py-3 bg-white border-t border-gray-100/50">
                {[
                    { name: 'Makeup', href: '/makeup' },
                    { name: 'Skin', href: '/category/skin' },
                    { name: 'Hair', href: '/category/hair' },
                    { name: 'Appliances', href: '/category/appliances' },
                    { name: 'Bath & Body', href: '/category/bath-body' },
                    { name: 'Natural', href: '/category/natural' },
                    { name: 'Mom & Baby', href: '/category/mom-baby' },
                    { name: 'Health & Wellness', href: '/category/health-wellness' },
                    { name: 'Men', href: '/category/men' },
                    { name: 'Fragrance', href: '/category/fragrance' },
                ].map((item) => (
                    <Link
                        key={item.name}
                        href={item.href}
                        className="text-sm font-medium text-gray-600 hover:text-[#b8860b] transition-colors uppercase tracking-wide"
                    >
                        {item.name}
                    </Link>
                ))}
            </nav>

            {/* Mobile Search - visible only on small screens */}
            <div className="sm:hidden px-4 pb-3">
                <form onSubmit={handleSearch} className="relative">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg text-sm"
                    />
                    <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </form>
            </div>
        </header>
    );
}
