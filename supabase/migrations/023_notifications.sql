CREATE TABLE IF NOT EXISTS notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('lead', 'signature', 'payment', 'reminder', 'system')),
  title text NOT NULL,
  message text,
  link text,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_notifications" ON notifications FOR ALL USING (user_id = auth.uid());

CREATE INDEX idx_notifications_user_unread ON notifications(user_id, read) WHERE read = false;
