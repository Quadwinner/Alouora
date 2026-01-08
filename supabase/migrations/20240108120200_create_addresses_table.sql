-- =============================================================================
-- ADDRESSES TABLE
-- =============================================================================
-- Stores user delivery addresses

CREATE TABLE IF NOT EXISTS public.addresses (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User reference
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Address Information
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  
  -- Address fields
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  landmark TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  country TEXT DEFAULT 'India',
  
  -- Address type
  address_type TEXT CHECK (address_type IN ('home', 'office', 'other')) DEFAULT 'home',
  
  -- Default address
  is_default BOOLEAN DEFAULT false,
  
  -- Location coordinates (optional)
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- INDEXES
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON public.addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_addresses_is_default ON public.addresses(is_default);
CREATE INDEX IF NOT EXISTS idx_addresses_pincode ON public.addresses(pincode);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own addresses
CREATE POLICY "Users can view own addresses"
  ON public.addresses
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own addresses
CREATE POLICY "Users can insert own addresses"
  ON public.addresses
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own addresses
CREATE POLICY "Users can update own addresses"
  ON public.addresses
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own addresses
CREATE POLICY "Users can delete own addresses"
  ON public.addresses
  FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================================================
-- TRIGGERS
-- =============================================================================
-- Trigger to update updated_at timestamp
CREATE TRIGGER update_addresses_updated_at
  BEFORE UPDATE ON public.addresses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to ensure only one default address per user
CREATE OR REPLACE FUNCTION ensure_single_default_address()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = true THEN
    -- Set all other addresses for this user to non-default
    UPDATE public.addresses
    SET is_default = false
    WHERE user_id = NEW.user_id AND id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_one_default_address
  BEFORE INSERT OR UPDATE ON public.addresses
  FOR EACH ROW
  WHEN (NEW.is_default = true)
  EXECUTE FUNCTION ensure_single_default_address();

-- =============================================================================
-- COMMENTS
-- =============================================================================
COMMENT ON TABLE public.addresses IS 'User delivery addresses';
COMMENT ON COLUMN public.addresses.is_default IS 'Default address for checkout';
COMMENT ON COLUMN public.addresses.address_type IS 'Type: home, office, or other';
