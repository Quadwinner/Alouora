'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Stats {
    totalProducts: number;
    activeProducts: number;
    inactiveProducts: number;
    outOfStock: number;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    async function fetchStats() {
        try {
            // Fetch all products to compute stats
            const res = await fetch('/api/admin/products?limit=1000');
            const data = await res.json();

            if (data.success) {
                const products = data.data.products;
                setStats({
                    totalProducts: data.data.pagination.total,
                    activeProducts: products.filter((p: any) => p.is_active).length,
                    inactiveProducts: products.filter((p: any) => !p.is_active).length,
                    outOfStock: products.filter((p: any) => p.stock_quantity === 0).length,
                });
            }
        } catch (err) {
            console.error('Error fetching stats:', err);
        } finally {
            setLoading(false);
        }
    }

    const statCards = [
        {
            label: 'Total Products',
            value: stats?.totalProducts ?? '—',
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
            ),
            color: 'from-purple-500 to-purple-600',
            bgColor: 'bg-purple-500/10',
            textColor: 'text-purple-400',
        },
        {
            label: 'Active Products',
            value: stats?.activeProducts ?? '—',
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            color: 'from-green-500 to-green-600',
            bgColor: 'bg-green-500/10',
            textColor: 'text-green-400',
        },
        {
            label: 'Inactive Products',
            value: stats?.inactiveProducts ?? '—',
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
            ),
            color: 'from-yellow-500 to-yellow-600',
            bgColor: 'bg-yellow-500/10',
            textColor: 'text-yellow-400',
        },
        {
            label: 'Out of Stock',
            value: stats?.outOfStock ?? '—',
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
            ),
            color: 'from-red-500 to-red-600',
            bgColor: 'bg-red-500/10',
            textColor: 'text-red-400',
        },
    ];

    return (
        <div>
            {/* Welcome */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white">Welcome back 👋</h1>
                <p className="text-gray-400 mt-1">Here&apos;s a quick overview of your store</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                {statCards.map((card) => (
                    <div
                        key={card.label}
                        className="bg-[#161922] border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-10 h-10 ${card.bgColor} rounded-lg flex items-center justify-center ${card.textColor}`}>
                                {card.icon}
                            </div>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-white">
                                {loading ? (
                                    <span className="inline-block w-12 h-8 bg-gray-800 rounded animate-pulse" />
                                ) : (
                                    card.value
                                )}
                            </p>
                            <p className="text-gray-400 text-sm mt-1">{card.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-[#161922] border border-gray-800 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Link
                        href="/admin/products/new"
                        className="flex items-center gap-4 p-4 bg-[#0f1117] border border-gray-800 rounded-lg hover:border-purple-500/30 hover:bg-purple-500/5 transition-all group"
                    >
                        <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center text-purple-400 group-hover:bg-purple-500/20 transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-white font-medium text-sm">Add New Product</p>
                            <p className="text-gray-500 text-xs mt-0.5">Create a new product listing</p>
                        </div>
                    </Link>

                    <Link
                        href="/admin/products"
                        className="flex items-center gap-4 p-4 bg-[#0f1117] border border-gray-800 rounded-lg hover:border-blue-500/30 hover:bg-blue-500/5 transition-all group"
                    >
                        <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-white font-medium text-sm">View All Products</p>
                            <p className="text-gray-500 text-xs mt-0.5">Browse and manage inventory</p>
                        </div>
                    </Link>

                    <Link
                        href="/"
                        className="flex items-center gap-4 p-4 bg-[#0f1117] border border-gray-800 rounded-lg hover:border-green-500/30 hover:bg-green-500/5 transition-all group"
                    >
                        <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center text-green-400 group-hover:bg-green-500/20 transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-white font-medium text-sm">View Store</p>
                            <p className="text-gray-500 text-xs mt-0.5">See your storefront live</p>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}
