/**
 * Auth Layout
 * 
 * Shared layout for authentication pages (signin, verify-otp)
 * Uses BEAUTIFY brand styling with the curved wave background
 */

import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'BEAUTIFY - Sign In',
    description: 'Sign in to continue your beauty journey with BEAUTIFY',
}

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen w-full overflow-hidden auth-right-panel-bg relative">
            {children}
        </div>
    )
}
