-- ============================================================
-- Migration 027: Improved new user trigger
-- Creates a complete profile on signup with proper defaults
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    full_name,
    subscription_status,
    devis_used,
    devis_reset_at,
    onboarding_completed,
    relance_enabled,
    relance_delays,
    is_micro_entrepreneur,
    tva_applicable,
    auto_invoice_on_sign,
    auto_invoice_on_payment,
    auto_send_invoice,
    created_at
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'free',
    0,
    date_trunc('month', now()) + interval '1 month',
    FALSE,
    TRUE,
    '[2, 5, 7]'::jsonb,
    FALSE,
    TRUE,
    TRUE,
    TRUE,
    TRUE,
    now()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
