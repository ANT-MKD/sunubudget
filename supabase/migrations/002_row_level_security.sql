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
