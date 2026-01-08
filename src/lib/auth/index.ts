/**
 * Authentication Utilities
 *
 * Helper functions for authentication operations
 */

import type { SignInCredentials, SignUpCredentials, AuthResponse } from '@/types/auth'

/**
 * Sign up a new user
 */
export async function signUp(credentials: SignUpCredentials): Promise<AuthResponse> {
  try {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Sign up error:', error)
    return {
      success: false,
      error: 'Failed to sign up. Please try again.',
    }
  }
}

/**
 * Sign in an existing user
 */
export async function signIn(credentials: SignInCredentials): Promise<AuthResponse> {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Sign in error:', error)
    return {
      success: false,
      error: 'Failed to sign in. Please try again.',
    }
  }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<AuthResponse> {
  try {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Sign out error:', error)
    return {
      success: false,
      error: 'Failed to sign out. Please try again.',
    }
  }
}
