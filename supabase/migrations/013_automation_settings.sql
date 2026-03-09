-- ============================================
-- 013: Automation settings on profiles
-- ============================================

-- Preferences for auto-invoicing behavior
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS auto_invoice_on_sign boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS auto_invoice_on_payment boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS auto_send_invoice boolean DEFAULT true;
