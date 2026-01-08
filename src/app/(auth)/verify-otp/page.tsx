'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useRef, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function VerifyOTPContent() {
    const [otp, setOtp] = useState(['', '', '', '', '', ''])
    const [isLoading, setIsLoading] = useState(false)
    const [resendTimer, setResendTimer] = useState(30)
    const [error, setError] = useState('')
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])
    const router = useRouter()
    const searchParams = useSearchParams()
    const phone = searchParams.get('phone') || ''

    // Countdown timer for resend
    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
            return () => clearTimeout(timer)
        }
        return undefined
    }, [resendTimer])

    // Focus first input on mount
    useEffect(() => {
        inputRefs.current[0]?.focus()
    }, [])

    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return

        const newOtp = [...otp]
        newOtp[index] = value.slice(-1)
        setOtp(newOtp)
        setError('')

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus()
        }
    }

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus()
        }
    }

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault()
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
        const newOtp = [...otp]
        pastedData.split('').forEach((char, i) => {
            if (i < 6) newOtp[i] = char
        })
        setOtp(newOtp)
        inputRefs.current[Math.min(pastedData.length, 5)]?.focus()
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const otpValue = otp.join('')

        if (otpValue.length !== 6) {
            setError('Please enter the complete 6-digit OTP')
            return
        }

        setIsLoading(true)
        setError('')

        // TODO: Implement OTP verification logic
        // Simulating API call
        setTimeout(() => {
            // For demo, accept any 6-digit OTP
            router.push('/')
        }, 1500)
    }

    const handleResend = async () => {
        if (resendTimer > 0) return

        // TODO: Implement resend OTP logic
        setResendTimer(30)
        setOtp(['', '', '', '', '', ''])
        inputRefs.current[0]?.focus()
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

                {/* Right Content Section (OTP Verification) */}
                <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 lg:p-16">
                    <div className="w-full max-w-md">
                        {/* Back Link */}
                        <Link
                            href="/signin"
                            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm font-medium mb-12 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Sign In
                        </Link>

                        {/* Header */}
                        <div className="mb-10 text-center">
                            <h2 className="text-4xl text-gray-900 font-semibold mb-3">Verify OTP</h2>
                            <p className="text-gray-500 text-base">
                                We&apos;ve sent a 6-digit code to
                                <br />
                                <span className="font-medium text-gray-700">+91 {phone}</span>
                            </p>
                        </div>

                        {/* OTP Input */}
                        <form onSubmit={handleSubmit}>
                            <div className="mb-8">
                                <label className="block text-sm font-semibold text-gray-700 mb-4 text-center">
                                    Enter Verification Code
                                </label>
                                <div className="flex gap-3 justify-center" onPaste={handlePaste}>
                                    {otp.map((digit, index) => (
                                        <input
                                            key={index}
                                            ref={(el) => { inputRefs.current[index] = el }}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleOtpChange(index, e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(index, e)}
                                            className={`
                        w-12 h-14 text-center text-xl font-semibold
                        bg-white border-2 rounded-xl
                        transition-all duration-200
                        focus:outline-none focus:border-beautify-primary focus:ring-2 focus:ring-beautify-primary/20
                        ${error ? 'border-red-400' : 'border-gray-200'}
                        ${digit ? 'border-beautify-primary bg-beautify-accent/30' : ''}
                      `}
                                        />
                                    ))}
                                </div>
                                {error && (
                                    <p className="text-red-500 text-sm text-center mt-3">{error}</p>
                                )}
                            </div>

                            {/* Resend Timer */}
                            <div className="text-center mb-8">
                                {resendTimer > 0 ? (
                                    <p className="text-gray-500 text-sm">
                                        Resend code in <span className="font-medium text-beautify-primary">{resendTimer}s</span>
                                    </p>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleResend}
                                        className="text-beautify-primary font-medium text-sm hover:underline"
                                    >
                                        Resend Code
                                    </button>
                                )}
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading || otp.join('').length !== 6}
                                className="primary-btn w-full py-4 rounded-xl text-white font-semibold shadow-lg mb-12 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Verifying...
                                    </span>
                                ) : (
                                    'Verify & Continue'
                                )}
                            </button>
                        </form>

                        {/* Features Footer */}
                        <div className="grid grid-cols-3 gap-4 border-t border-transparent">
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

export default function VerifyOTPPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-4 border-beautify-primary border-t-transparent rounded-full" />
            </div>
        }>
            <VerifyOTPContent />
        </Suspense>
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
