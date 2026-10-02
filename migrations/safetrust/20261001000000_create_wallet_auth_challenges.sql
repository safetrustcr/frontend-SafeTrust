CREATE TABLE IF NOT EXISTS public.wallet_auth_challenges (
  tx_hash    CHAR(64) PRIMARY KEY,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_wallet_auth_challenges_expires ON public.wallet_auth_challenges (expires_at);
-- housekeeping: DELETE FROM public.wallet_auth_challenges WHERE expires_at < now() - interval '1 day';
