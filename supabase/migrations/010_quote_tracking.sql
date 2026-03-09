-- Quote view tracking
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- Relance logs (manual + auto)
CREATE TABLE IF NOT EXISTS relance_logs (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  quote_id uuid REFERENCES quotes(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  sent_at timestamptz DEFAULT now(),
  subject text,
  body_preview text,
  type text DEFAULT 'manual' CHECK (type IN ('manual', 'auto')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE relance_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_relance_logs" ON relance_logs
  FOR ALL USING (user_id = auth.uid());

CREATE INDEX idx_relance_logs_quote ON relance_logs(quote_id, created_at DESC);
