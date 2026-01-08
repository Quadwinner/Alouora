/**
 * Login API Route
 * POST /api/auth/login
 *
 * Authenticates a user with email and password
 */

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Validation schema
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request body
    const validationResult = loginSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: validationResult.error.issues[0].message,
        },
        { status: 400 }
      )
    }

    const { email, password } = validationResult.data

    // Create Supabase client
    const supabase = await createClient()

    // Sign in with email and password
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      console.error('Login error:', authError)

      // Provide user-friendly error messages
      let errorMessage = 'Invalid email or password'
      if (authError.message.includes('Email not confirmed')) {
        errorMessage = 'Please verify your email before signing in'
      }

      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
        },
        { status: 401 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication failed',
        },
        { status: 401 }
      )
    }

    // Get user profile from public.users table (if exists)
    const { data: profileData } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    return NextResponse.json(
      {
        success: true,
        message: 'Login successful',
        user: {
          id: authData.user.id,
          email: authData.user.email,
          name: profileData?.name || authData.user.user_metadata?.name,
          avatar_url: profileData?.avatar_url,
          phone: profileData?.phone,
        },
        session: {
          access_token: authData.session?.access_token,
          refresh_token: authData.session?.refresh_token,
          expires_at: authData.session?.expires_at,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred. Please try again.',
      },
      { status: 500 }
    )
  }
}
