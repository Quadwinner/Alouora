/**
 * Auth Callback Route
 * Handles email confirmation callbacks from Supabase
 */

import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Redirect to the 'next' URL or home page
      return NextResponse.redirect(new URL(next, request.url))
    }
  }

  // Return to error page if code exchange failed
  return NextResponse.redirect(new URL('/auth/auth-code-error', request.url))
}
