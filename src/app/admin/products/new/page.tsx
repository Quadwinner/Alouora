'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

interface Category {
    id: string;
    name: string;
}

interface Brand {
    id: string;
    name: string;
}

const BADGE_OPTIONS = ['NEW', 'BESTSELLER', 'EXCLUSIVE', 'TRENDING', 'LIMITED EDITION'];

export default function AddProductPage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const thumbnailInputRef = useRef<HTMLInputElement>(null);

    const [categories, setCategories] = useState<Category[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Form state
    const [form, setForm] = useState({
        name: '',
        slug: '',
        description: '',
        price: '',
        original_price: '',
        category_id: '',
        brand_id: '',
        sku: '',
        stock_quantity: '0',
        ingredients: '',
        how_to_use: '',
        is_active: true,
        is_featured: false,
        badges: [] as string[],
        meta_title: '',
        meta_description: '',
    });

    // Image state
    const [thumbnail, setThumbnail] = useState<string | null>(null);
    const [images, setImages] = useState<string[]>([]);
    const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
    const [uploadingImages, setUploadingImages] = useState(false);

    useEffect(() => {
        fetchMeta();
    }, []);

    async function fetchMeta() {
        try {
            const res = await fetch('/api/admin/meta');
            const data = await res.json();
            if (data.success) {
                setCategories(data.data.categories || []);
                setBrands(data.data.brands || []);
            }
        } catch (err) {
            console.error('Error fetching categories/brands:', err);
        }
    }

    function generateSlug(name: string) {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    }

    function handleNameChange(name: string) {
        setForm((prev) => ({
            ...prev,
            name,
            slug: generateSlug(name),
        }));
    }

    async function uploadFile(file: File): Promise<string | null> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'products');

        try {
            const res = await fetch('/api/admin/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();
            if (data.success) {
                return data.data.url;
            }
            setError(data.error || 'Upload failed');
            return null;
        } catch {
            setError('Failed to upload image');
            return null;
        }
    }

    async function handleThumbnailUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingThumbnail(true);
        const url = await uploadFile(file);
        if (url) setThumbnail(url);
        setUploadingThumbnail(false);
    }

    async function handleImagesUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        setUploadingImages(true);

        const newUrls: string[] = [];
        for (const file of Array.from(files)) {
            const url = await uploadFile(file);
            if (url) newUrls.push(url);
        }
        setImages((prev) => [...prev, ...newUrls]);
        setUploadingImages(false);
    }

    function removeImage(index: number) {
        setImages((prev) => prev.filter((_, i) => i !== index));
    }

    function toggleBadge(badge: string) {
        setForm((prev) => ({
            ...prev,
            badges: prev.badges.includes(badge)
                ? prev.badges.filter((b) => b !== badge)
                : [...prev.badges, badge],
        }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            const payload: Record<string, any> = {
                name: form.name,
                slug: form.slug || undefined,
                description: form.description || null,
                price: parseFloat(form.price),
                original_price: form.original_price ? parseFloat(form.original_price) : null,
                category_id: form.category_id || null,
                brand_id: form.brand_id || null,
                sku: form.sku || null,
                stock_quantity: parseInt(form.stock_quantity) || 0,
                ingredients: form.ingredients
                    ? form.ingredients.split('\n').filter(Boolean)
                    : null,
                how_to_use: form.how_to_use
                    ? form.how_to_use.split('\n').filter(Boolean)
                    : null,
                is_active: form.is_active,
                is_featured: form.is_featured,
                badges: form.badges.length > 0 ? form.badges : null,
                meta_title: form.meta_title || null,
                meta_description: form.meta_description || null,
                thumbnail,
                images: images.length > 0 ? images : null,
            };

            const res = await fetch('/api/admin/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (data.success) {
                router.push('/admin/products');
            } else {
                setError(data.error || 'Failed to create product');
            }
        } catch {
            setError('An unexpected error occurred');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Page Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link
                    href="/admin/products"
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-white">Add New Product</h1>
                    <p className="text-gray-400 text-sm mt-1">Fill in the details to create a new product</p>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-6 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <section className="bg-[#161922] border border-gray-800 rounded-xl p-6">
                    <h2 className="text-white font-semibold mb-4">Basic Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-gray-400 text-sm mb-1.5">Product Name *</label>
                            <input
                                type="text"
                                required
                                value={form.name}
                                onChange={(e) => handleNameChange(e.target.value)}
                                className="w-full px-4 py-2.5 bg-[#0f1117] border border-gray-800 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500/50 transition-colors"
                                placeholder="e.g. Rose Gold Lipstick"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-gray-400 text-sm mb-1.5">Slug</label>
                            <input
                                type="text"
                                value={form.slug}
                                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                                className="w-full px-4 py-2.5 bg-[#0f1117] border border-gray-800 rounded-lg text-gray-400 text-sm focus:outline-none focus:border-purple-500/50 transition-colors"
                                placeholder="auto-generated-from-name"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-gray-400 text-sm mb-1.5">Description</label>
                            <textarea
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                rows={4}
                                className="w-full px-4 py-2.5 bg-[#0f1117] border border-gray-800 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500/50 resize-none transition-colors"
                                placeholder="Enter product description..."
                            />
                        </div>
                    </div>
                </section>

                {/* Pricing */}
                <section className="bg-[#161922] border border-gray-800 rounded-xl p-6">
                    <h2 className="text-white font-semibold mb-4">Pricing</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-gray-400 text-sm mb-1.5">Price (₹) *</label>
                            <input
                                type="number"
                                required
                                min="0"
                                step="0.01"
                                value={form.price}
                                onChange={(e) => setForm({ ...form, price: e.target.value })}
                                className="w-full px-4 py-2.5 bg-[#0f1117] border border-gray-800 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500/50 transition-colors"
                                placeholder="499"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 text-sm mb-1.5">Original Price (₹)</label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.original_price}
                                onChange={(e) => setForm({ ...form, original_price: e.target.value })}
                                className="w-full px-4 py-2.5 bg-[#0f1117] border border-gray-800 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500/50 transition-colors"
                                placeholder="699"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 text-sm mb-1.5">Discount</label>
                            <div className="px-4 py-2.5 bg-[#0f1117] border border-gray-800 rounded-lg text-gray-400 text-sm">
                                {form.price && form.original_price && parseFloat(form.original_price) > parseFloat(form.price)
                                    ? `${Math.round(((parseFloat(form.original_price) - parseFloat(form.price)) / parseFloat(form.original_price)) * 100)}% off`
                                    : 'Auto-calculated'}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Organization */}
                <section className="bg-[#161922] border border-gray-800 rounded-xl p-6">
                    <h2 className="text-white font-semibold mb-4">Organization</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-400 text-sm mb-1.5">Category</label>
                            <select
                                value={form.category_id}
                                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                                className="w-full px-4 py-2.5 bg-[#0f1117] border border-gray-800 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500/50 appearance-none cursor-pointer transition-colors"
                            >
                                <option value="">Select category</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-400 text-sm mb-1.5">Brand</label>
                            <select
                                value={form.brand_id}
                                onChange={(e) => setForm({ ...form, brand_id: e.target.value })}
                                className="w-full px-4 py-2.5 bg-[#0f1117] border border-gray-800 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500/50 appearance-none cursor-pointer transition-colors"
                            >
                                <option value="">Select brand</option>
                                {brands.map((b) => (
                                    <option key={b.id} value={b.id}>{b.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-400 text-sm mb-1.5">SKU</label>
                            <input
                                type="text"
                                value={form.sku}
                                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                                className="w-full px-4 py-2.5 bg-[#0f1117] border border-gray-800 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500/50 transition-colors"
                                placeholder="PROD-001"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 text-sm mb-1.5">Stock Quantity</label>
                            <input
                                type="number"
                                min="0"
                                value={form.stock_quantity}
                                onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })}
                                className="w-full px-4 py-2.5 bg-[#0f1117] border border-gray-800 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500/50 transition-colors"
                                placeholder="0"
                            />
                        </div>
                    </div>
                </section>

                {/* Images */}
                <section className="bg-[#161922] border border-gray-800 rounded-xl p-6">
                    <h2 className="text-white font-semibold mb-4">Images</h2>

                    {/* Thumbnail */}
                    <div className="mb-6">
                        <label className="block text-gray-400 text-sm mb-2">Thumbnail</label>
                        <div className="flex items-start gap-4">
                            <div
                                onClick={() => thumbnailInputRef.current?.click()}
                                className="w-32 h-32 bg-[#0f1117] border-2 border-dashed border-gray-700 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-purple-500/50 transition-colors group"
                            >
                                {uploadingThumbnail ? (
                                    <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                                ) : thumbnail ? (
                                    <Image src={thumbnail} alt="Thumbnail" width={128} height={128} className="w-full h-full object-cover rounded-lg" />
                                ) : (
                                    <>
                                        <svg className="w-8 h-8 text-gray-600 group-hover:text-purple-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <p className="text-gray-500 text-xs mt-1">Upload</p>
                                    </>
                                )}
                            </div>
                            {thumbnail && (
                                <button
                                    type="button"
                                    onClick={() => setThumbnail(null)}
                                    className="text-red-400 text-xs hover:text-red-300"
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                        <input
                            ref={thumbnailInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleThumbnailUpload}
                        />
                    </div>

                    {/* Product Images */}
                    <div>
                        <label className="block text-gray-400 text-sm mb-2">Product Images</label>
                        <div className="flex flex-wrap gap-3">
                            {images.map((url, i) => (
                                <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden group">
                                    <Image src={url} alt={`Image ${i + 1}`} width={96} height={96} className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(i)}
                                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                                    >
                                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="w-24 h-24 bg-[#0f1117] border-2 border-dashed border-gray-700 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-purple-500/50 transition-colors"
                            >
                                {uploadingImages ? (
                                    <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        <p className="text-gray-500 text-[10px] mt-1">Add</p>
                                    </>
                                )}
                            </div>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={handleImagesUpload}
                        />
                    </div>
                </section>

                {/* Product Details */}
                <section className="bg-[#161922] border border-gray-800 rounded-xl p-6">
                    <h2 className="text-white font-semibold mb-4">Product Details</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-gray-400 text-sm mb-1.5">Ingredients (one per line)</label>
                            <textarea
                                value={form.ingredients}
                                onChange={(e) => setForm({ ...form, ingredients: e.target.value })}
                                rows={3}
                                className="w-full px-4 py-2.5 bg-[#0f1117] border border-gray-800 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500/50 resize-none transition-colors"
                                placeholder="Vitamin E&#10;Jojoba Oil&#10;Shea Butter"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 text-sm mb-1.5">How to Use (one step per line)</label>
                            <textarea
                                value={form.how_to_use}
                                onChange={(e) => setForm({ ...form, how_to_use: e.target.value })}
                                rows={3}
                                className="w-full px-4 py-2.5 bg-[#0f1117] border border-gray-800 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500/50 resize-none transition-colors"
                                placeholder="Apply to clean skin&#10;Massage gently&#10;Leave for 10 minutes"
                            />
                        </div>
                    </div>
                </section>

                {/* Settings */}
                <section className="bg-[#161922] border border-gray-800 rounded-xl p-6">
                    <h2 className="text-white font-semibold mb-4">Settings</h2>
                    <div className="space-y-4">
                        {/* Badges */}
                        <div>
                            <label className="block text-gray-400 text-sm mb-2">Badges</label>
                            <div className="flex flex-wrap gap-2">
                                {BADGE_OPTIONS.map((badge) => (
                                    <button
                                        key={badge}
                                        type="button"
                                        onClick={() => toggleBadge(badge)}
                                        className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${form.badges.includes(badge)
                                            ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                                            : 'bg-[#0f1117] border-gray-800 text-gray-400 hover:border-gray-700'
                                            }`}
                                    >
                                        {badge}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Toggles */}
                        <div className="flex gap-6">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        checked={form.is_active}
                                        onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                                        className="sr-only"
                                    />
                                    <div className={`w-10 h-6 rounded-full transition-colors ${form.is_active ? 'bg-purple-600' : 'bg-gray-700'}`}>
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${form.is_active ? 'translate-x-5' : 'translate-x-1'}`} />
                                    </div>
                                </div>
                                <span className="text-gray-300 text-sm">Active</span>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        checked={form.is_featured}
                                        onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                                        className="sr-only"
                                    />
                                    <div className={`w-10 h-6 rounded-full transition-colors ${form.is_featured ? 'bg-purple-600' : 'bg-gray-700'}`}>
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${form.is_featured ? 'translate-x-5' : 'translate-x-1'}`} />
                                    </div>
                                </div>
                                <span className="text-gray-300 text-sm">Featured</span>
                            </label>
                        </div>
                    </div>
                </section>

                {/* SEO */}
                <section className="bg-[#161922] border border-gray-800 rounded-xl p-6">
                    <h2 className="text-white font-semibold mb-4">SEO</h2>
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-gray-400 text-sm mb-1.5">Meta Title</label>
                            <input
                                type="text"
                                value={form.meta_title}
                                onChange={(e) => setForm({ ...form, meta_title: e.target.value })}
                                className="w-full px-4 py-2.5 bg-[#0f1117] border border-gray-800 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500/50 transition-colors"
                                placeholder="SEO title..."
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 text-sm mb-1.5">Meta Description</label>
                            <textarea
                                value={form.meta_description}
                                onChange={(e) => setForm({ ...form, meta_description: e.target.value })}
                                rows={2}
                                className="w-full px-4 py-2.5 bg-[#0f1117] border border-gray-800 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500/50 resize-none transition-colors"
                                placeholder="SEO description..."
                            />
                        </div>
                    </div>
                </section>

                {/* Submit */}
                <div className="flex items-center justify-end gap-3 pt-2 pb-10">
                    <Link
                        href="/admin/products"
                        className="px-6 py-2.5 text-sm text-gray-300 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={submitting || !form.name || !form.price}
                        className="px-6 py-2.5 text-sm text-white bg-purple-600 hover:bg-purple-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                        {submitting && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                        {submitting ? 'Creating...' : 'Create Product'}
                    </button>
                </div>
            </form>
        </div>
    );
}
