-- =============================================================================
-- OTP VERIFICATIONS TABLE
-- =============================================================================
-- Stores OTP codes for phone number verification
-- OTPs expire after 10 minutes and have max 3 attempts

CREATE TABLE IF NOT EXISTS public.otp_verifications (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Phone number
  phone TEXT NOT NULL,
  
  -- OTP code (6 digits)
  otp_code TEXT NOT NULL,
  
  -- Verification status
  is_verified BOOLEAN DEFAULT false,
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  
  -- Expiry
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '10 minutes'),
  
  -- IP tracking (security)
  request_ip TEXT,
  user_agent TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  verified_at TIMESTAMPTZ
);

-- =============================================================================
-- INDEXES
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_otp_phone ON public.otp_verifications(phone);
CREATE INDEX IF NOT EXISTS idx_otp_expires_at ON public.otp_verifications(expires_at);
CREATE INDEX IF NOT EXISTS idx_otp_created_at ON public.otp_verifications(created_at DESC);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================
ALTER TABLE public.otp_verifications ENABLE ROW LEVEL SECURITY;

-- Policy: No direct SELECT (API route handles verification)
CREATE POLICY "No direct select on OTP"
  ON public.otp_verifications
  FOR SELECT
  USING (false);

-- Policy: Service role can manage OTPs
CREATE POLICY "Service role can manage OTPs"
  ON public.otp_verifications
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- =============================================================================
-- FUNCTION: Clean expired OTPs (run via cron or manually)
-- =============================================================================
CREATE OR REPLACE FUNCTION clean_expired_otps()
RETURNS void AS $$
BEGIN
  DELETE FROM public.otp_verifications
  WHERE expires_at < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- COMMENTS
-- =============================================================================
COMMENT ON TABLE public.otp_verifications IS 'Stores OTP codes for phone verification';
COMMENT ON COLUMN public.otp_verifications.otp_code IS '6-digit OTP code';
COMMENT ON COLUMN public.otp_verifications.expires_at IS 'OTP expires 10 minutes after creation';
COMMENT ON COLUMN public.otp_verifications.attempts IS 'Number of verification attempts';
