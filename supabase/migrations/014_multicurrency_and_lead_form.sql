-- ============================================
-- 014: Multi-currency + Lead form settings + Prospect source
-- ============================================

-- Multi-currency on quotes
ALTER TABLE quotes
  ADD COLUMN IF NOT EXISTS currency text DEFAULT 'EUR';

-- Lead form settings on profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS lead_form_enabled boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS lead_form_title text DEFAULT 'Demandez un devis',
  ADD COLUMN IF NOT EXISTS lead_form_description text,
  ADD COLUMN IF NOT EXISTS lead_form_color text DEFAULT '#7c3aed';

-- Prospect source tracking
ALTER TABLE prospects
  ADD COLUMN IF NOT EXISTS source text DEFAULT 'manual'
    CHECK (source IN ('manual', 'form'));
