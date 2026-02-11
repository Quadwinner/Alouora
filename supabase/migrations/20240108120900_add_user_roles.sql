-- =============================================================================
-- ADD ROLE COLUMN TO USERS TABLE
-- =============================================================================
-- Adds a role column to manage admin access via the database.
-- Roles: 'user' (default), 'admin', 'super_admin'

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' 
CHECK (role IN ('user', 'admin', 'super_admin'));

-- Create index for role lookups
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- =============================================================================
-- MAKE AN ADMIN (run this to grant admin to any user by email)
-- =============================================================================
-- Replace the email below with the user you want to make admin

UPDATE public.users 
SET role = 'admin' 
WHERE email = 'shubhamkush012@gmail.com';

-- Verify
SELECT id, email, full_name, role FROM public.users WHERE role IN ('admin', 'super_admin');
