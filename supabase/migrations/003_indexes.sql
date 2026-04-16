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
