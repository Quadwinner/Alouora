'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';

interface Product {
    id: string;
    name: string;
    slug: string;
    price: number;
    original_price: number | null;
    discount_percentage: number | null;
    thumbnail: string | null;
    stock_quantity: number;
    sku: string | null;
    is_active: boolean;
    is_featured: boolean;
    rating_average: number;
    rating_count: number;
    sales_count: number;
    badges: string[] | null;
    created_at: string;
    brand: { id: string; name: string } | null;
    category: { id: string; name: string } | null;
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('all');
    const [sort, setSort] = useState('newest');
    const [page, setPage] = useState(1);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState<Product | null>(null);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '15',
                sort,
                status,
            });
            if (search) params.set('search', search);

            const res = await fetch(`/api/admin/products?${params}`);
            const data = await res.json();

            if (data.success) {
                setProducts(data.data.products);
                setPagination(data.data.pagination);
            }
        } catch (err) {
            console.error('Error fetching products:', err);
        } finally {
            setLoading(false);
        }
    }, [page, sort, status, search]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    async function handleDelete(product: Product) {
        setDeleting(product.id);
        try {
            const res = await fetch(`/api/admin/products/${product.id}`, {
                method: 'DELETE',
            });
            const data = await res.json();
            if (data.success) {
                fetchProducts();
            }
        } catch (err) {
            console.error('Error deleting product:', err);
        } finally {
            setDeleting(null);
            setShowDeleteModal(null);
        }
    }

    function formatPrice(price: number) {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(price);
    }

    return (
        <div>
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Products</h1>
                    <p className="text-gray-400 text-sm mt-1">
                        {pagination ? `${pagination.total} products total` : 'Loading...'}
                    </p>
                </div>
                <Link
                    href="/admin/products/new"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Product
                </Link>
            </div>

            {/* Filters Bar */}
            <div className="bg-[#161922] border border-gray-800 rounded-xl p-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Search */}
                    <div className="relative flex-1">
                        <svg
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-[#0f1117] border border-gray-800 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors"
                        />
                    </div>

                    {/* Status Filter */}
                    <select
                        value={status}
                        onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                        className="px-4 py-2.5 bg-[#0f1117] border border-gray-800 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500/50 appearance-none cursor-pointer"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>

                    {/* Sort */}
                    <select
                        value={sort}
                        onChange={(e) => { setSort(e.target.value); setPage(1); }}
                        className="px-4 py-2.5 bg-[#0f1117] border border-gray-800 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500/50 appearance-none cursor-pointer"
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="name_asc">Name A-Z</option>
                        <option value="name_desc">Name Z-A</option>
                        <option value="price_asc">Price: Low to High</option>
                        <option value="price_desc">Price: High to Low</option>
                        <option value="stock_asc">Stock: Low to High</option>
                        <option value="stock_desc">Stock: High to Low</option>
                    </select>
                </div>
            </div>

            {/* Products Table */}
            <div className="bg-[#161922] border border-gray-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-800">
                                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Product</th>
                                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Price</th>
                                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Stock</th>
                                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Category</th>
                                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                            {loading ? (
                                // Loading skeleton
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-gray-800 rounded-lg animate-pulse" />
                                                <div className="space-y-2">
                                                    <div className="w-36 h-4 bg-gray-800 rounded animate-pulse" />
                                                    <div className="w-20 h-3 bg-gray-800 rounded animate-pulse" />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4"><div className="w-16 h-4 bg-gray-800 rounded animate-pulse" /></td>
                                        <td className="px-5 py-4"><div className="w-12 h-4 bg-gray-800 rounded animate-pulse" /></td>
                                        <td className="px-5 py-4"><div className="w-20 h-4 bg-gray-800 rounded animate-pulse" /></td>
                                        <td className="px-5 py-4"><div className="w-16 h-6 bg-gray-800 rounded-full animate-pulse" /></td>
                                        <td className="px-5 py-4"><div className="w-20 h-4 bg-gray-800 rounded animate-pulse ml-auto" /></td>
                                    </tr>
                                ))
                            ) : products.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-5 py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center">
                                                <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                </svg>
                                            </div>
                                            <p className="text-gray-400 text-sm">No products found</p>
                                            <Link
                                                href="/admin/products/new"
                                                className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
                                            >
                                                + Add your first product
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                products.map((product) => (
                                    <tr
                                        key={product.id}
                                        className="hover:bg-gray-800/20 transition-colors"
                                    >
                                        {/* Product */}
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                                                    {product.thumbnail ? (
                                                        <Image
                                                            src={product.thumbnail}
                                                            alt={product.name}
                                                            width={48}
                                                            height={48}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-600">
                                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-white text-sm font-medium truncate max-w-[200px]">
                                                        {product.name}
                                                    </p>
                                                    <p className="text-gray-500 text-xs mt-0.5">
                                                        {product.brand?.name || 'No brand'} • SKU: {product.sku || '—'}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Price */}
                                        <td className="px-5 py-4">
                                            <p className="text-white text-sm font-medium">{formatPrice(product.price)}</p>
                                            {product.original_price && product.original_price > product.price && (
                                                <p className="text-gray-500 text-xs line-through">
                                                    {formatPrice(product.original_price)}
                                                </p>
                                            )}
                                        </td>

                                        {/* Stock */}
                                        <td className="px-5 py-4">
                                            <span
                                                className={`text-sm font-medium ${product.stock_quantity === 0
                                                        ? 'text-red-400'
                                                        : product.stock_quantity < 10
                                                            ? 'text-yellow-400'
                                                            : 'text-green-400'
                                                    }`}
                                            >
                                                {product.stock_quantity}
                                            </span>
                                        </td>

                                        {/* Category */}
                                        <td className="px-5 py-4">
                                            <span className="text-gray-300 text-sm">
                                                {product.category?.name || '—'}
                                            </span>
                                        </td>

                                        {/* Status */}
                                        <td className="px-5 py-4">
                                            <span
                                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${product.is_active
                                                        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                                    }`}
                                            >
                                                <span className={`w-1.5 h-1.5 rounded-full ${product.is_active ? 'bg-green-400' : 'bg-red-400'}`} />
                                                {product.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-5 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/admin/products/${product.id}/edit`}
                                                    className="p-2 text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </Link>
                                                <button
                                                    onClick={() => setShowDeleteModal(product)}
                                                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                    title="Delete"
                                                    disabled={deleting === product.id}
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between px-5 py-4 border-t border-gray-800">
                        <p className="text-gray-500 text-sm">
                            Page {pagination.page} of {pagination.totalPages}
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(page - 1)}
                                disabled={!pagination.hasPreviousPage}
                                className="px-3 py-1.5 text-sm text-gray-400 hover:text-white bg-[#0f1117] border border-gray-800 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setPage(page + 1)}
                                disabled={!pagination.hasNextPage}
                                className="px-3 py-1.5 text-sm text-gray-400 hover:text-white bg-[#0f1117] border border-gray-800 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowDeleteModal(null)} />
                    <div className="relative bg-[#1a1d27] border border-gray-800 rounded-xl p-6 max-w-sm w-full">
                        <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </div>
                        <h3 className="text-white text-lg font-semibold text-center mb-2">Delete Product</h3>
                        <p className="text-gray-400 text-sm text-center mb-6">
                            Are you sure you want to delete <strong className="text-white">&quot;{showDeleteModal.name}&quot;</strong>? This will mark it as inactive.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteModal(null)}
                                className="flex-1 px-4 py-2.5 text-sm text-gray-300 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(showDeleteModal)}
                                disabled={deleting === showDeleteModal.id}
                                className="flex-1 px-4 py-2.5 text-sm text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
                            >
                                {deleting === showDeleteModal.id ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
