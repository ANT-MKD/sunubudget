-- SunuBudget — script unique pour SQL Editor Supabase
-- Coller tout puis Run (projet neuf ou schéma vide).

-- ========== 001_initial_schema.sql ==========

-- SunuBudget — schéma initial (PostgreSQL / Supabase)
-- Extensions : identifiants UUID + primitives cryptographiques (usage futur côté DB)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- Profils (1:1 avec auth.users)
-- ---------------------------------------------------------------------------
CREATE TABLE public.user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  first_name text,
  last_name text,
  phone text,
  address text,
  birth_date date,
  occupation text,
  monthly_income numeric,
  currency text NOT NULL DEFAULT 'XOF',
  language text NOT NULL DEFAULT 'fr',
  onboarding_completed boolean NOT NULL DEFAULT false,
  email_confirmed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Transactions
-- ---------------------------------------------------------------------------
CREATE TABLE public.transactions (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  category text NOT NULL,
  description text NOT NULL DEFAULT '',
  date date NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  status text NOT NULL CHECK (status IN ('completed', 'pending')),
  receipt_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Objectifs d'épargne
-- ---------------------------------------------------------------------------
CREATE TABLE public.savings_goals (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL,
  current_amount numeric NOT NULL DEFAULT 0 CHECK (current_amount >= 0),
  target_amount numeric NOT NULL CHECK (target_amount > 0),
  percentage numeric NOT NULL DEFAULT 0 CHECK (percentage >= 0 AND percentage <= 100),
  deadline date NOT NULL,
  color text,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT savings_current_lte_target CHECK (current_amount <= target_amount)
);

-- ---------------------------------------------------------------------------
-- Défis
-- ---------------------------------------------------------------------------
CREATE TABLE public.challenges (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  type text NOT NULL CHECK (type IN ('savings', 'budget', 'transactions', 'custom')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed')),
  progress numeric NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  target numeric,
  current_value numeric NOT NULL DEFAULT 0,
  reward text,
  deadline date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Badges
-- ---------------------------------------------------------------------------
CREATE TABLE public.badges (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  icon text,
  category text,
  earned boolean NOT NULL DEFAULT false,
  earned_date date,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Tontines
-- ---------------------------------------------------------------------------
CREATE TABLE public.tontines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  monthly_amount numeric NOT NULL CHECK (monthly_amount > 0),
  total_rounds integer NOT NULL CHECK (total_rounds >= 2),
  current_round integer NOT NULL DEFAULT 1,
  current_month text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed')),
  start_date date NOT NULL,
  invite_token text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.tontine_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tontine_id uuid NOT NULL REFERENCES public.tontines (id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  member_name text NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  position integer,
  joined_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX tontine_members_one_user_per_tontine
  ON public.tontine_members (tontine_id, user_id)
  WHERE user_id IS NOT NULL;

CREATE TABLE public.tontine_payments (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  member_id uuid NOT NULL REFERENCES public.tontine_members (id) ON DELETE CASCADE,
  tontine_id uuid NOT NULL REFERENCES public.tontines (id) ON DELETE CASCADE,
  payment_month text NOT NULL,
  paid boolean NOT NULL DEFAULT false,
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (member_id, payment_month)
);

-- ---------------------------------------------------------------------------
-- Budgets par catégorie
-- ---------------------------------------------------------------------------
CREATE TABLE public.category_budgets (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  category text NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  month integer NOT NULL CHECK (month >= 1 AND month <= 12),
  year integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, category, month, year)
);

-- ---------------------------------------------------------------------------
-- Notifications (in-app)
-- ---------------------------------------------------------------------------
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL CHECK (type IN ('success', 'warning', 'error', 'info')),
  read boolean NOT NULL DEFAULT false,
  important boolean NOT NULL DEFAULT false,
  category text,
  action text,
  created_at timestamptz NOT NULL DEFAULT now()
);


-- ========== 002_row_level_security.sql ==========

-- Row Level Security — moindre privilège, aucune policy permissive

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tontines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tontine_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tontine_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- user_profiles : accès strict à la ligne dont id = auth.uid()
-- ---------------------------------------------------------------------------
CREATE POLICY user_profiles_select_own ON public.user_profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY user_profiles_insert_own ON public.user_profiles
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY user_profiles_update_own ON public.user_profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY user_profiles_delete_own ON public.user_profiles
  FOR DELETE TO authenticated
  USING (id = auth.uid());

-- ---------------------------------------------------------------------------
-- Tables avec user_id direct
-- ---------------------------------------------------------------------------
CREATE POLICY transactions_select_own ON public.transactions
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY transactions_insert_own ON public.transactions
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY transactions_update_own ON public.transactions
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY transactions_delete_own ON public.transactions
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY savings_goals_select_own ON public.savings_goals
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY savings_goals_insert_own ON public.savings_goals
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY savings_goals_update_own ON public.savings_goals
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY savings_goals_delete_own ON public.savings_goals
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY challenges_select_own ON public.challenges
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY challenges_insert_own ON public.challenges
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY challenges_update_own ON public.challenges
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY challenges_delete_own ON public.challenges
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY badges_select_own ON public.badges
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY badges_insert_own ON public.badges
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY badges_update_own ON public.badges
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY badges_delete_own ON public.badges
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY category_budgets_select_own ON public.category_budgets
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY category_budgets_insert_own ON public.category_budgets
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY category_budgets_update_own ON public.category_budgets
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY category_budgets_delete_own ON public.category_budgets
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY notifications_select_own ON public.notifications
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY notifications_insert_own ON public.notifications
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY notifications_update_own ON public.notifications
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY notifications_delete_own ON public.notifications
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- tontines : créateur ou membre (user_id renseigné)
-- ---------------------------------------------------------------------------
CREATE POLICY tontines_select_member_or_creator ON public.tontines
  FOR SELECT TO authenticated
  USING (
    creator_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.tontine_members tm
      WHERE tm.tontine_id = tontines.id AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY tontines_insert_as_creator ON public.tontines
  FOR INSERT TO authenticated
  WITH CHECK (creator_id = auth.uid());

CREATE POLICY tontines_update_creator ON public.tontines
  FOR UPDATE TO authenticated
  USING (creator_id = auth.uid())
  WITH CHECK (creator_id = auth.uid());

CREATE POLICY tontines_delete_creator ON public.tontines
  FOR DELETE TO authenticated
  USING (creator_id = auth.uid());

-- ---------------------------------------------------------------------------
-- tontine_members
-- ---------------------------------------------------------------------------
CREATE POLICY tontine_members_select_visible ON public.tontine_members
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.tontines t
      WHERE t.id = tontine_members.tontine_id
      AND (
        t.creator_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.tontine_members tm2
          WHERE tm2.tontine_id = t.id AND tm2.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY tontine_members_insert_creator ON public.tontine_members
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tontines t
      WHERE t.id = tontine_members.tontine_id
      AND t.creator_id = auth.uid()
    )
  );

CREATE POLICY tontine_members_update_creator ON public.tontine_members
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.tontines t
      WHERE t.id = tontine_members.tontine_id
      AND t.creator_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tontines t
      WHERE t.id = tontine_members.tontine_id
      AND t.creator_id = auth.uid()
    )
  );

CREATE POLICY tontine_members_delete_creator ON public.tontine_members
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.tontines t
      WHERE t.id = tontine_members.tontine_id
      AND t.creator_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- tontine_payments
-- ---------------------------------------------------------------------------
CREATE POLICY tontine_payments_select_visible ON public.tontine_payments
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.tontines t
      WHERE t.id = tontine_payments.tontine_id
      AND (
        t.creator_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.tontine_members tm
          WHERE tm.tontine_id = t.id AND tm.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY tontine_payments_insert_creator ON public.tontine_payments
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tontines t
      WHERE t.id = tontine_payments.tontine_id
      AND t.creator_id = auth.uid()
    )
  );

CREATE POLICY tontine_payments_update_creator ON public.tontine_payments
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.tontines t
      WHERE t.id = tontine_payments.tontine_id
      AND t.creator_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tontines t
      WHERE t.id = tontine_payments.tontine_id
      AND t.creator_id = auth.uid()
    )
  );

CREATE POLICY tontine_payments_delete_creator ON public.tontine_payments
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.tontines t
      WHERE t.id = tontine_payments.tontine_id
      AND t.creator_id = auth.uid()
    )
  );


-- ========== 003_indexes.sql ==========

-- Index pour requêtes fréquentes par utilisateur / période

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions (user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON public.transactions (user_id, date);
CREATE INDEX IF NOT EXISTS idx_transactions_user_type ON public.transactions (user_id, type);
CREATE INDEX IF NOT EXISTS idx_transactions_user_category ON public.transactions (user_id, category);

CREATE INDEX IF NOT EXISTS idx_savings_goals_user_id ON public.savings_goals (user_id);
CREATE INDEX IF NOT EXISTS idx_challenges_user_id ON public.challenges (user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications (user_id, read);
CREATE INDEX IF NOT EXISTS idx_tontine_members_tontine_id ON public.tontine_members (tontine_id);
CREATE INDEX IF NOT EXISTS idx_tontine_payments_member_month ON public.tontine_payments (member_id, payment_month);
CREATE INDEX IF NOT EXISTS idx_category_budgets_user_period ON public.category_budgets (user_id, year, month);


-- ========== 004_triggers.sql ==========

-- Profil à l'inscription + updated_at + pourcentage d'épargne

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, first_name, last_name, email_confirmed_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NEW.email_confirmed_at
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.sync_profile_email_confirmed_from_auth()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email_confirmed_at IS DISTINCT FROM OLD.email_confirmed_at THEN
    UPDATE public.user_profiles
    SET email_confirmed_at = NEW.email_confirmed_at
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_email_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_email_confirmed
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_profile_email_confirmed_from_auth();

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER trg_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS trg_savings_goals_updated_at ON public.savings_goals;
CREATE TRIGGER trg_savings_goals_updated_at
  BEFORE UPDATE ON public.savings_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE OR REPLACE FUNCTION public.calculate_savings_percentage()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  pct numeric;
BEGIN
  IF NEW.target_amount IS NULL OR NEW.target_amount <= 0 THEN
    NEW.percentage := 0;
  ELSE
    pct := ROUND((NEW.current_amount / NEW.target_amount) * 100, 2);
    IF pct > 100 THEN
      NEW.percentage := 100;
    ELSIF pct < 0 THEN
      NEW.percentage := 0;
    ELSE
      NEW.percentage := pct;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_savings_goals_percentage ON public.savings_goals;
CREATE TRIGGER trg_savings_goals_percentage
  BEFORE INSERT OR UPDATE OF current_amount, target_amount ON public.savings_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_savings_percentage();


-- ========== 005_storage.sql ==========

-- Bucket reçus : privé, taille et types limités au niveau du bucket

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'receipts',
  'receipts',
  false,
  2097152,
  ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Politiques : dossier racine = auth.uid() (premier segment du chemin objet)

DROP POLICY IF EXISTS receipts_insert_own_folder ON storage.objects;
DROP POLICY IF EXISTS receipts_select_own_folder ON storage.objects;
DROP POLICY IF EXISTS receipts_update_own_folder ON storage.objects;
DROP POLICY IF EXISTS receipts_delete_own_folder ON storage.objects;

CREATE POLICY receipts_insert_own_folder ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'receipts'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY receipts_select_own_folder ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'receipts'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY receipts_update_own_folder ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'receipts'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'receipts'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY receipts_delete_own_folder ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'receipts'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
