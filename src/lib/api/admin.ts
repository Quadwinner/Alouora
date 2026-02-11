/**
 * Admin Authentication Helper
 *
 * Uses ADMIN_EMAILS env var (comma-separated) to determine admin access.
 * Example: ADMIN_EMAILS=admin@example.com,owner@example.com
 */

import { SupabaseClient } from '@supabase/supabase-js'

/**
 * Check if an email is in the admin allowlist
 */
export function isAdmin(email: string | undefined): boolean {
    if (!email) return false

    const adminEmails = process.env.ADMIN_EMAILS || ''
    const allowlist = adminEmails
        .split(',')
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean)

    return allowlist.includes(email.toLowerCase())
}

/**
 * Require admin access — returns user if admin, or null
 */
export async function requireAdmin(
    supabase: SupabaseClient
): Promise<{ id: string; email: string } | null> {
    const {
        data: { user },
        error,
    } = await supabase.auth.getUser()

    if (error || !user || !user.email) return null
    if (!isAdmin(user.email)) return null

    return { id: user.id, email: user.email }
}
