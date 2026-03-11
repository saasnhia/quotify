-- =============================================================
-- Migration 022: Team members (Business plan multi-user)
-- =============================================================

CREATE TABLE IF NOT EXISTS team_members (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  member_email text NOT NULL,
  member_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  role text DEFAULT 'viewer' CHECK (role IN ('admin', 'editor', 'viewer')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  invited_at timestamptz DEFAULT now(),
  accepted_at timestamptz,
  UNIQUE(owner_id, member_email)
);

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Owner can manage their team
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'team_members' AND policyname = 'owner_manages_team'
  ) THEN
    CREATE POLICY "owner_manages_team" ON team_members FOR ALL
      USING (owner_id = auth.uid());
  END IF;
END $$;

-- Members can see their own invitations
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'team_members' AND policyname = 'member_sees_invitations'
  ) THEN
    CREATE POLICY "member_sees_invitations" ON team_members FOR SELECT
      USING (member_user_id = auth.uid() OR member_email IN (
        SELECT email FROM auth.users WHERE id = auth.uid()
      ));
  END IF;
END $$;
