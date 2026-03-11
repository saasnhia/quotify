-- Migration 021: Contracts (Business-only feature)
-- contract_templates must be created before contracts (FK dependency)

CREATE TABLE IF NOT EXISTS contract_templates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  name text NOT NULL,
  description text,
  is_system boolean DEFAULT false,
  default_amount numeric(10,2),
  default_frequency text DEFAULT 'monthly',
  default_duration_months integer,
  items jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contracts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  template_id uuid REFERENCES contract_templates(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  amount numeric(10,2) DEFAULT 0,
  currency text DEFAULT 'EUR',
  frequency text DEFAULT 'monthly' CHECK (frequency IN ('monthly', 'quarterly', 'yearly')),
  start_date date NOT NULL,
  end_date date,
  next_invoice_date date,
  status text DEFAULT 'active' CHECK (status IN ('draft', 'active', 'paused', 'ended')),
  invoice_count integer DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_contracts" ON contracts FOR ALL USING (user_id = auth.uid());
CREATE POLICY "users_own_contract_templates" ON contract_templates FOR ALL
  USING (user_id = auth.uid() OR is_system = true);

-- 5 system contract templates
INSERT INTO contract_templates (user_id, name, description, is_system, default_amount, default_frequency, default_duration_months, items) VALUES
(NULL, 'Maintenance site web', 'Contrat de maintenance mensuel pour site web', true, 150, 'monthly', 12, '[{"description": "Maintenance technique mensuelle", "quantity": 1, "unit_price": 100}, {"description": "Mises à jour sécurité", "quantity": 1, "unit_price": 50}]'),
(NULL, 'Support technique', 'Support et assistance technique mensuelle', true, 200, 'monthly', 12, '[{"description": "Support email/téléphone", "quantity": 1, "unit_price": 120}, {"description": "Interventions correctives", "quantity": 1, "unit_price": 80}]'),
(NULL, 'Consulting mensuel', 'Accompagnement conseil mensuel', true, 500, 'monthly', 6, '[{"description": "Réunion mensuelle stratégie", "quantity": 2, "unit_price": 150}, {"description": "Rapport d''analyse", "quantity": 1, "unit_price": 200}]'),
(NULL, 'Formation continue', 'Programme de formation trimestriel', true, 900, 'quarterly', 12, '[{"description": "Session formation (3h)", "quantity": 3, "unit_price": 200}, {"description": "Supports pédagogiques", "quantity": 1, "unit_price": 300}]'),
(NULL, 'Abonnement SEO', 'Optimisation référencement mensuel', true, 350, 'monthly', 12, '[{"description": "Audit SEO mensuel", "quantity": 1, "unit_price": 150}, {"description": "Rédaction contenu optimisé", "quantity": 4, "unit_price": 50}]');
