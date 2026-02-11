/**
 * Admin Authentication Helper
 *
 * Checks the user's role in the database (users.role column).
 * Roles: 'user' (default), 'admin', 'super_admin'
 *
 * To make a user admin, run in Supabase SQL Editor:
 *   UPDATE public.users SET role = 'admin' WHERE email = 'user@example.com';
 */

import { SupabaseClient } from '@supabase/supabase-js'
import { createAdminClient } from '@/lib/supabase/server'

/**
 * Require admin access — returns user info if admin, or null
 */
export async function requireAdmin(
    supabase: SupabaseClient
): Promise<{ id: string; email: string; role: string } | null> {
    const {
        data: { user },
        error,
    } = await supabase.auth.getUser()

    if (error || !user || !user.email) return null

    // Check role in database
    const adminSupabase = createAdminClient()
    const { data: dbUser } = await adminSupabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

    if (!dbUser || !['admin', 'super_admin'].includes(dbUser.role)) {
        return null
    }

    return { id: user.id, email: user.email, role: dbUser.role }
}
