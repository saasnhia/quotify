-- Fix #2: Unsubscribe RGPD + Fix #15: Relance settings
-- Adds opt-out per quote + relance preferences on profiles

-- Per-quote opt-out (client can unsubscribe from reminders for a specific quote)
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS relance_opt_out BOOLEAN DEFAULT FALSE;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS relance_opt_out_at TIMESTAMPTZ;

-- Per-user relance settings (freelance controls their reminder preferences)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS relance_enabled BOOLEAN DEFAULT TRUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS relance_delays JSONB DEFAULT '[2, 5, 7]'::jsonb;
