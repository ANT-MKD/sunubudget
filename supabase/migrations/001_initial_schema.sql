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
