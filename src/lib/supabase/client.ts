/**
 * Supabase Client-Side Client
 *
 * Use this client in Client Components (components with 'use client' directive)
 * This client uses the browser's cookies for authentication
 */

import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
