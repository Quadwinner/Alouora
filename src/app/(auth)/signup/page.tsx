'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SignUpPage() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!name || !email || !password || !confirmPassword) {
            setError('Please fill in all fields')
            return
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match')
            return
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters')
            return
        }

        setIsLoading(true)
        setError('')

        try {
            const { data, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: name,
                    },
                },
            })

            if (signUpError) {
                if (signUpError.message.includes('already registered')) {
                    setError('This email is already registered. Please sign in instead.')
                } else {
                    setError(signUpError.message)
                }
                setIsLoading(false)
                return
            }

            if (data.user) {
                // If email confirmation is required
                if (data.user.identities?.length === 0) {
                    setError('This email is already registered. Please sign in instead.')
                    setIsLoading(false)
                    return
                }

                setSuccess(true)
                // Optionally redirect after showing success message
                setTimeout(() => {
                    router.push('/signin')
                }, 3000)
            }
        } catch {
            setError('An unexpected error occurred. Please try again.')
            setIsLoading(false)
        }
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-beautify-bg to-white p-8">
                <div className="text-center max-w-md">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                        <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-3">Account Created!</h2>
                    <p className="text-gray-500 mb-6">
                        We&apos;ve sent a verification email to <span className="font-medium text-gray-700">{email}</span>.
                        Please check your inbox and verify your email to continue.
                    </p>
                    <Link href="/signin" className="text-beautify-primary font-medium hover:underline">
                        Go to Sign In
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <>
            {/* Left Panel Wave Background */}
            <div className="wave-container">
                <svg className="wave-background" preserveAspectRatio="none" viewBox="0 0 600 1024">
                    <defs>
                        <linearGradient id="gradient_fill" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style={{ stopColor: '#F5A6C4', stopOpacity: 1 }} />
                            <stop offset="40%" style={{ stopColor: '#E994B6', stopOpacity: 1 }} />
                            <stop offset="100%" style={{ stopColor: '#D8A6E8', stopOpacity: 1 }} />
                        </linearGradient>
                    </defs>
                    <path d="M0,0 L450,0 C550,0 580,300 480,512 C380,724 550,1024 600,1024 L0,1024 Z" />
                </svg>

                <div className="deco-circle w-40 h-40 top-20 left-10" />
                <div className="deco-circle w-24 h-24 top-1/2 left-32" />
                <div className="deco-circle w-32 h-32 bottom-20 left-1/4" />
            </div>

            <div className="flex h-screen relative z-10">
                {/* Left Content Section */}
                <div className="w-1/2 hidden lg:flex flex-col items-center justify-center p-12 h-full">
                    <div className="absolute top-12 text-center pl-10">
                        <h1 className="text-white logo-title mb-1">BEAUTIFY</h1>
                        <p className="text-white logo-subtitle">Your Beauty Journey Begins Here</p>
                    </div>

                    <div className="flex flex-col items-center mt-12 pl-10">
                        <div className="relative w-[420px] h-[420px]">
                            <div className="absolute inset-0 m-auto w-[380px] h-[380px] rounded-full product-circle" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Image
                                    src="/images/beauty-product.png"
                                    alt="Beauty Product Set"
                                    width={420}
                                    height={420}
                                    className="w-full h-full object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
                                    priority
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 space-y-3 self-center ml-10">
                        <FeatureItem icon="star" text="Exclusive Beauty Collections" />
                        <FeatureItem icon="bookmark" text="Personalized Recommendations" />
                        <FeatureItem icon="delivery" text="Fast & Free Delivery" />
                    </div>
                </div>

                {/* Right Content Section (Sign Up Form) */}
                <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 lg:p-12 overflow-y-auto">
                    <div className="w-full max-w-md">
                        <Link
                            href="/signin"
                            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm font-medium mb-6 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Sign In
                        </Link>

                        <div className="mb-6 text-center">
                            <h2 className="text-3xl text-gray-900 font-semibold mb-2">Create Account</h2>
                            <p className="text-gray-500 text-sm">Join BEAUTIFY and start your beauty journey</p>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            {/* Name Input */}
                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Enter your full name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="input-field w-full h-[50px] bg-white border border-gray-200 rounded-xl px-4 pl-11 text-gray-800 placeholder-gray-400"
                                    />
                                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                            </div>

                            {/* Email Input */}
                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="input-field w-full h-[50px] bg-white border border-gray-200 rounded-xl px-4 pl-11 text-gray-800 placeholder-gray-400"
                                    />
                                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            </div>

                            {/* Password Input */}
                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Create a password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="input-field w-full h-[50px] bg-white border border-gray-200 rounded-xl px-4 pl-11 pr-11 text-gray-800 placeholder-gray-400"
                                    />
                                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                <p className="text-xs text-gray-400 mt-1">Must be at least 6 characters</p>
                            </div>

                            {/* Confirm Password Input */}
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Confirm your password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="input-field w-full h-[50px] bg-white border border-gray-200 rounded-xl px-4 pl-11 text-gray-800 placeholder-gray-400"
                                    />
                                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="primary-btn w-full py-4 rounded-xl text-white font-semibold shadow-lg mb-4 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Creating Account...
                                    </span>
                                ) : (
                                    'Create Account'
                                )}
                            </button>

                            <p className="text-center text-gray-500 text-sm">
                                Already have an account?{' '}
                                <Link href="/signin" className="text-beautify-primary font-medium hover:underline">
                                    Sign In
                                </Link>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}

function FeatureItem({ icon, text }: { icon: 'star' | 'bookmark' | 'delivery'; text: string }) {
    const icons = {
        star: (
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
        ),
        bookmark: (
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
            </svg>
        ),
        delivery: (
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05a2.5 2.5 0 014.9 0H19a1 1 0 001-1V8a1 1 0 00-1-1h-5z" />
            </svg>
        ),
    }

    return (
        <div className="flex items-center gap-3 text-white">
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                {icons[icon]}
            </div>
            <span className="feature-text">{text}</span>
        </div>
    )
}
