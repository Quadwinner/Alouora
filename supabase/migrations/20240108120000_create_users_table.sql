-- =============================================================================
-- USERS TABLE (extends Supabase auth.users)
-- =============================================================================
-- This table stores additional user profile information
-- It references auth.users (Supabase's built-in auth table)

CREATE TABLE IF NOT EXISTS public.users (
  -- Primary key (matches auth.users.id)
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic Information
  email TEXT UNIQUE,
  phone TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  
  -- Brand Preference
  brand_preference TEXT CHECK (brand_preference IN ('beautify', 'alouora')) DEFAULT 'beautify',
  
  -- Demographics (optional)
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  
  -- Preferences
  newsletter_subscribed BOOLEAN DEFAULT false,
  marketing_emails BOOLEAN DEFAULT true,
  
  -- Wallet & Rewards
  wallet_balance DECIMAL(10, 2) DEFAULT 0.00,
  reward_points INTEGER DEFAULT 0,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  email_verified BOOLEAN DEFAULT false,
  phone_verified BOOLEAN DEFAULT false,
  
  -- Metadata
  last_login_at TIMESTAMPTZ,
  last_active_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- INDEXES
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON public.users(phone);
CREATE INDEX IF NOT EXISTS idx_users_brand_preference ON public.users(brand_preference);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at DESC);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy: Users can insert their own profile (on signup)
CREATE POLICY "Users can insert own profile"
  ON public.users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- =============================================================================
-- TRIGGERS
-- =============================================================================
-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to create user profile after auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, phone, full_name, email_verified, phone_verified)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.phone,
    NEW.raw_user_meta_data->>'full_name',
    NEW.email_confirmed_at IS NOT NULL,
    NEW.phone_confirmed_at IS NOT NULL
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users insert
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- COMMENTS
-- =============================================================================
COMMENT ON TABLE public.users IS 'Extended user profile information';
COMMENT ON COLUMN public.users.id IS 'User ID (references auth.users.id)';
COMMENT ON COLUMN public.users.brand_preference IS 'Preferred brand theme (beautify or alouora)';
COMMENT ON COLUMN public.users.wallet_balance IS 'User wallet balance in currency';
COMMENT ON COLUMN public.users.reward_points IS 'Accumulated reward points';
