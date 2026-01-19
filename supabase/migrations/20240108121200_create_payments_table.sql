-- =============================================================================
-- MIGRATION 12: PAYMENTS TABLE
-- =============================================================================
-- This table stores payment transactions (Razorpay, etc.) linked to orders.
-- It is separate from the orders table, which keeps high-level order state.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relations
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Provider info
  provider TEXT NOT NULL DEFAULT 'razorpay',
  provider_payment_id TEXT,  -- e.g. razorpay_payment_id
  provider_order_id TEXT,    -- e.g. razorpay_order_id

  -- Amount & currency
  amount DECIMAL(10, 2),
  currency TEXT NOT NULL DEFAULT 'INR',

  -- Status from payment provider
  status TEXT CHECK (status IN ('created', 'authorized', 'captured', 'failed', 'refunded')) NOT NULL DEFAULT 'created',
  method TEXT,               -- card, upi, netbanking, wallet, etc.

  -- Error details (if any)
  error_code TEXT,
  error_description TEXT,

  -- Raw payload for debugging / audits
  raw_payload JSONB,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_provider_payment_id ON public.payments(provider_payment_id);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON public.payments(created_at DESC);

-- Enable RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own payments" ON public.payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payments" ON public.payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Update trigger for updated_at
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- DONE!
-- =============================================================================

