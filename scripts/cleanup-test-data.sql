-- ============================================================
-- NETTOYAGE DATA TEST — Garder seulement harounchikh71@gmail.com
-- ============================================================
-- USAGE : Coller dans Supabase Dashboard > SQL Editor > Run
-- NE PAS utiliser comme migration (one-time destructive operation)
-- ============================================================

DO $$
DECLARE
  v_keep_user_id UUID;
  v_deleted_users INTEGER;
BEGIN
  -- 1. Recupere l'ID a conserver
  SELECT id INTO v_keep_user_id
  FROM auth.users
  WHERE email = 'harounchikh71@gmail.com';

  IF v_keep_user_id IS NULL THEN
    RAISE EXCEPTION 'User harounchikh71@gmail.com introuvable dans auth.users';
  END IF;

  RAISE NOTICE 'User a conserver : % (harounchikh71@gmail.com)', v_keep_user_id;

  -- 2. Nettoyage explicite des tables sans CASCADE ou avec FK speciales
  --    (la plupart des autres tables cascadent via auth.users ON DELETE CASCADE)

  -- signup_ips : pas de CASCADE, pas de RLS
  DELETE FROM public.signup_ips WHERE user_id != v_keep_user_id;

  -- team_members : deux FK vers auth.users (owner_id + member_user_id)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'team_members') THEN
    DELETE FROM public.team_members
    WHERE owner_id != v_keep_user_id AND (member_user_id IS NULL OR member_user_id != v_keep_user_id);
  END IF;

  -- quote_views : FK vers quotes (CASCADE), mais pas de user_id — clean orphans
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'quote_views') THEN
    DELETE FROM public.quote_views
    WHERE quote_id IN (SELECT id FROM public.quotes WHERE user_id != v_keep_user_id);
  END IF;

  -- leads : user_id nullable (system leads possible)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'leads') THEN
    DELETE FROM public.leads
    WHERE user_id IS NOT NULL AND user_id != v_keep_user_id;
  END IF;

  -- prospects
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'prospects') THEN
    DELETE FROM public.prospects WHERE user_id != v_keep_user_id;
  END IF;

  -- 3. Supprimer les users auth (CASCADE supprime automatiquement :
  --    profiles, clients, quotes, quote_items, invoices, contracts,
  --    quote_reminders, relance_logs, notifications, daily_briefings,
  --    lead_forms (user-owned), quote_templates (user-owned),
  --    contract_templates (user-owned))
  DELETE FROM auth.users WHERE id != v_keep_user_id;
  GET DIAGNOSTICS v_deleted_users = ROW_COUNT;

  -- 4. Nettoyage des templates/lead_forms systeme orphelins (garder user_id IS NULL)
  -- On ne touche PAS aux templates systeme : user_id IS NULL

  RAISE NOTICE 'Nettoyage termine. % users supprimes. User conserve : %', v_deleted_users, v_keep_user_id;
END $$;

-- ============================================================
-- VERIFICATION
-- ============================================================
SELECT 'auth.users' as tbl, COUNT(*) as nb FROM auth.users
UNION ALL SELECT 'profiles', COUNT(*) FROM public.profiles
UNION ALL SELECT 'quotes', COUNT(*) FROM public.quotes
UNION ALL SELECT 'clients', COUNT(*) FROM public.clients
UNION ALL SELECT 'invoices', COUNT(*) FROM public.invoices;
