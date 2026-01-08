'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SignInPage() {
    const [authMode, setAuthMode] = useState<'email' | 'phone'>('email')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [phoneNumber, setPhoneNumber] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()
    const supabase = createClient()

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email || !password) {
            setError('Please enter both email and password')
            return
        }

        setIsLoading(true)
        setError('')

        try {
            const { data, error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (signInError) {
                if (signInError.message.includes('Invalid login credentials')) {
                    setError('Invalid email or password. Please try again.')
                } else if (signInError.message.includes('Email not confirmed')) {
                    setError('Please verify your email before signing in.')
                } else {
                    setError(signInError.message)
                }
                setIsLoading(false)
                return
            }

            if (data.user) {
                router.push('/')
                router.refresh()
            }
        } catch {
            setError('An unexpected error occurred. Please try again.')
            setIsLoading(false)
        }
    }

    const handlePhoneSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!phoneNumber || phoneNumber.length < 10) {
            setError('Please enter a valid 10-digit phone number')
            return
        }

        setIsLoading(true)
        setError('')

        try {
            const { error: otpError } = await supabase.auth.signInWithOtp({
                phone: `+91${phoneNumber}`,
            })

            if (otpError) {
                setError(otpError.message)
                setIsLoading(false)
                return
            }

            router.push(`/verify-otp?phone=${phoneNumber}`)
        } catch {
            setError('Failed to send OTP. Please try again.')
            setIsLoading(false)
        }
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

                {/* Decorative Circles */}
                <div className="deco-circle w-40 h-40 top-20 left-10" />
                <div className="deco-circle w-24 h-24 top-1/2 left-32" />
                <div className="deco-circle w-32 h-32 bottom-20 left-1/4" />
            </div>

            <div className="flex h-screen relative z-10">
                {/* Left Content Section */}
                <div className="w-1/2 hidden lg:flex flex-col items-center justify-center p-12 h-full">
                    {/* Logo */}
                    <div className="absolute top-12 text-center pl-10">
                        <h1 className="text-white logo-title mb-1">BEAUTIFY</h1>
                        <p className="text-white logo-subtitle">Your Beauty Journey Begins Here</p>
                    </div>

                    {/* Product Showcase */}
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

                    {/* Left Features List */}
                    <div className="mt-8 space-y-3 self-center ml-10">
                        <FeatureItem icon="star" text="Exclusive Beauty Collections" />
                        <FeatureItem icon="bookmark" text="Personalized Recommendations" />
                        <FeatureItem icon="delivery" text="Fast & Free Delivery" />
                    </div>
                </div>

                {/* Right Content Section (Sign In Form) */}
                <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 lg:p-16">
                    <div className="w-full max-w-md">
                        {/* Back Link */}
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm font-medium mb-8 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Home
                        </Link>

                        {/* Header */}
                        <div className="mb-8 text-center">
                            <h2 className="text-4xl text-gray-900 font-semibold mb-3">Hey Welcome !</h2>
                            <p className="text-gray-500 text-base">Sign in to continue your beauty journey</p>
                        </div>

                        {/* Auth Mode Toggle */}
                        <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
                            <button
                                type="button"
                                onClick={() => { setAuthMode('email'); setError(''); }}
                                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${authMode === 'email'
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Email
                            </button>
                            <button
                                type="button"
                                onClick={() => { setAuthMode('phone'); setError(''); }}
                                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${authMode === 'phone'
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Phone
                            </button>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Email/Password Form */}
                        {authMode === 'email' ? (
                            <form onSubmit={handleEmailSubmit}>
                                {/* Email Input */}
                                <div className="mb-4">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Email Address
                                    </label>
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
                                <div className="mb-6">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Enter your password"
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
                                </div>

                                {/* Forgot Password Link */}
                                <div className="flex justify-end mb-6">
                                    <Link href="/forgot-password" className="text-sm text-beautify-primary hover:underline font-medium">
                                        Forgot Password?
                                    </Link>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isLoading || !email || !password}
                                    className="primary-btn w-full py-4 rounded-xl text-white font-semibold shadow-lg mb-4 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Signing in...
                                        </span>
                                    ) : (
                                        'Sign In'
                                    )}
                                </button>

                                {/* Sign Up Link */}
                                <p className="text-center text-gray-500 text-sm mb-8">
                                    Don&apos;t have an account?{' '}
                                    <Link href="/signup" className="text-beautify-primary font-medium hover:underline">
                                        Sign Up
                                    </Link>
                                </p>
                            </form>
                        ) : (
                            /* Phone Form */
                            <form onSubmit={handlePhoneSubmit}>
                                <div className="mb-6">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Phone Number
                                    </label>
                                    <div className="flex gap-3">
                                        <div className="w-20 flex-shrink-0">
                                            <div className="w-full h-[50px] bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center text-gray-700 font-medium">
                                                +91
                                            </div>
                                        </div>
                                        <input
                                            type="tel"
                                            placeholder="Enter your phone number"
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                            className="input-field flex-1 h-[50px] bg-white border border-gray-200 rounded-xl px-4 text-gray-800 placeholder-gray-400"
                                            maxLength={10}
                                        />
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isLoading || phoneNumber.length < 10}
                                    className="primary-btn w-full py-4 rounded-xl text-white font-semibold shadow-lg mb-8 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Sending OTP...
                                        </span>
                                    ) : (
                                        'Continue with Phone'
                                    )}
                                </button>
                            </form>
                        )}

                        {/* Features Footer */}
                        <div className="grid grid-cols-3 gap-4 border-t border-transparent pt-6">
                            <FooterFeature
                                icon={
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                }
                                label="Secure Login"
                            />
                            <FooterFeature
                                icon={
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                    </svg>
                                }
                                label="Privacy Protected"
                            />
                            <FooterFeature
                                icon={
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                    </svg>
                                }
                                label="Quick Access"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

// Feature Item Component for Left Panel
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

// Footer Feature Component
function FooterFeature({ icon, label }: { icon: React.ReactNode; label: string }) {
    return (
        <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-500">
                {icon}
            </div>
            <span className="text-[11px] text-gray-500 font-medium">{label}</span>
        </div>
    )
}
