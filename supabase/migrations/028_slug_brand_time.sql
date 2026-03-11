-- Migration 028: Slug + brand color for freelancers + time tracking
-- Safe pattern with existence checks

DO $$ BEGIN
  -- Slug + brand color on profiles
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'slug') THEN
      ALTER TABLE public.profiles ADD COLUMN slug VARCHAR(50) UNIQUE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'brand_color') THEN
      ALTER TABLE public.profiles ADD COLUMN brand_color VARCHAR(7) DEFAULT '#8B5CF6';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'email') THEN
      ALTER TABLE public.profiles ADD COLUMN email TEXT;
    END IF;
  END IF;
END $$;

-- Time entries table for time tracking
CREATE TABLE IF NOT EXISTS public.time_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  quote_id UUID REFERENCES public.quotes(id) ON DELETE SET NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  description TEXT,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  duration_minutes INTEGER,
  hourly_rate DECIMAL(10,2),
  billed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for time_entries
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'time_entries' AND policyname = 'users_own_time_entries'
  ) THEN
    CREATE POLICY "users_own_time_entries" ON public.time_entries FOR ALL USING (user_id = auth.uid());
  END IF;
END $$;
