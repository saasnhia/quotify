-- Stripe Connect fields on profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_account_id text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_connect_status text DEFAULT 'not_connected';

-- Payment fields on quotes
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS stripe_checkout_session text;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS stripe_payment_intent text;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS paid_at timestamptz;

-- Add 'payé' to status check constraint
ALTER TABLE quotes DROP CONSTRAINT IF EXISTS quotes_status_check;
ALTER TABLE quotes ADD CONSTRAINT quotes_status_check
  CHECK (status IN ('brouillon','envoyé','signé','accepté','refusé','payé'));
