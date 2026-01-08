'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'google'
    size?: 'sm' | 'md' | 'lg'
    isLoading?: boolean
    leftIcon?: React.ReactNode
    rightIcon?: React.ReactNode
    brand?: 'beautify' | 'alouora'
}

export function Button({
    children,
    className,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    leftIcon,
    rightIcon,
    brand = 'beautify',
    disabled,
    ...props
}: ButtonProps) {
    const baseStyles = `
    inline-flex items-center justify-center gap-2
    font-medium rounded-full
    transition-all duration-200 ease-out
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    active:scale-[0.98]
  `

    const brandColors = {
        beautify: {
            primary: 'bg-beautify-primary hover:bg-beautify-primary-dark text-white focus:ring-beautify-primary',
            secondary: 'bg-beautify-secondary hover:opacity-90 text-white focus:ring-beautify-secondary',
            outline: 'border-2 border-beautify-primary text-beautify-primary hover:bg-beautify-accent focus:ring-beautify-primary',
            ghost: 'text-beautify-primary hover:bg-beautify-accent focus:ring-beautify-primary',
        },
        alouora: {
            primary: 'bg-alouora-primary hover:bg-alouora-primary-dark text-gray-900 focus:ring-alouora-primary',
            secondary: 'bg-alouora-secondary hover:opacity-90 text-white focus:ring-alouora-secondary',
            outline: 'border-2 border-alouora-primary text-alouora-secondary hover:bg-alouora-bg focus:ring-alouora-primary',
            ghost: 'text-alouora-secondary hover:bg-alouora-bg focus:ring-alouora-primary',
        },
    }

    const variants = {
        ...brandColors[brand],
        google: 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-300 shadow-sm',
    }

    const sizes = {
        sm: 'h-9 px-4 text-sm',
        md: 'h-11 px-6 text-base',
        lg: 'h-14 px-8 text-lg',
    }

    return (
        <button
            className={cn(baseStyles, variants[variant], sizes[size], className)}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                </svg>
            ) : (
                leftIcon
            )}
            {children}
            {!isLoading && rightIcon}
        </button>
    )
}
