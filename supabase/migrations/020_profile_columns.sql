-- =============================================================
-- Migration 020: Self-contained profiles table
-- Handles both cases:
--   A) Table doesn't exist (fresh prod) → CREATE full table
--   B) Table exists but missing columns → ADD COLUMN IF NOT EXISTS
-- =============================================================

-- 1. Create the table if it doesn't exist (all columns at once)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id text,
  subscription_status text DEFAULT 'free' CHECK (subscription_status IN ('free', 'pro', 'business')),
  subscription_id text,
  devis_used integer DEFAULT 0,
  devis_reset_at timestamptz DEFAULT date_trunc('month', now()) + interval '1 month',
  created_at timestamptz DEFAULT now(),
  -- 006
  logo_url text,
  -- 007
  stripe_account_id text,
  stripe_connect_status text DEFAULT 'not_connected',
  -- 013
  auto_invoice_on_sign boolean DEFAULT true,
  auto_invoice_on_payment boolean DEFAULT true,
  auto_send_invoice boolean DEFAULT true,
  -- 014
  lead_form_enabled boolean DEFAULT true,
  lead_form_title text DEFAULT 'Demandez un devis',
  lead_form_description text,
  lead_form_color text DEFAULT '#7c3aed',
  -- 017/019
  calendly_url text,
  onboarding_completed boolean DEFAULT false,
  -- 020 (business profile fields)
  full_name text,
  company_name text,
  company_address text,
  company_siret text,
  company_phone text,
  default_tva_rate numeric(5,2) DEFAULT 20
);

-- 2. If table already existed, add any missing columns
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS logo_url text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_account_id text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_connect_status text DEFAULT 'not_connected';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS auto_invoice_on_sign boolean DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS auto_invoice_on_payment boolean DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS auto_send_invoice boolean DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS lead_form_enabled boolean DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS lead_form_title text DEFAULT 'Demandez un devis';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS lead_form_description text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS lead_form_color text DEFAULT '#7c3aed';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS calendly_url text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_name text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_address text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_siret text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_phone text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS default_tva_rate numeric(5,2) DEFAULT 20;

-- 3. RLS (idempotent)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'users_own_profile'
  ) THEN
    CREATE POLICY "users_own_profile" ON profiles FOR ALL USING (id = auth.uid());
  END IF;
END $$;

-- 4. Trigger: auto-create profile on signup (with full_name)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Monthly quota reset function
CREATE OR REPLACE FUNCTION public.reset_monthly_devis()
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET devis_used = 0,
      devis_reset_at = date_trunc('month', now()) + interval '1 month'
  WHERE devis_reset_at <= now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Sync existing user_metadata into profiles columns
UPDATE profiles p
SET
  full_name = COALESCE(u.raw_user_meta_data->>'full_name', p.full_name),
  company_name = COALESCE(u.raw_user_meta_data->>'company_name', p.company_name),
  company_address = COALESCE(u.raw_user_meta_data->>'company_address', p.company_address),
  company_siret = COALESCE(u.raw_user_meta_data->>'company_siret', p.company_siret),
  company_phone = COALESCE(u.raw_user_meta_data->>'company_phone', p.company_phone)
FROM auth.users u
WHERE p.id = u.id;

-- 7. Mark all existing users as onboarded (skip wizard)
UPDATE profiles SET onboarding_completed = true WHERE onboarding_completed = false;
