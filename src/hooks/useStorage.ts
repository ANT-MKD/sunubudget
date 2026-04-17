import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { enqueueOfflineOperation } from '../lib/offlineQueue';
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from '../lib/storage';
import type {
  AppBadge,
  AppChallenge,
  CategoryBudget,
  SavingsGoal,
  TontineGroup,
  TontineMember,
  TontineStatus,
  Transaction,
  UserProfileData,
} from '../types';

// ---------------------------------------------------------------------------
// localStorage (paramètres UI uniquement — pas de données sensibles serveur)
// ---------------------------------------------------------------------------

export const useLocalStorage = <T>(key: string, defaultValue: T) => {
  const [value, setValue] = useState<T>(() => loadFromStorage(key, defaultValue));

  useEffect(() => {
    saveToStorage(key, value);
  }, [key, value]);

  return [value, setValue] as const;
};

export const useUserSettings = () => {
  const defaultSettings = {
    language: 'fr',
    currency: 'XOF',
    theme: 'light' as 'light' | 'dark' | 'auto',
    accentColor: 'blue' as 'blue' | 'purple' | 'green' | 'red' | 'orange' | 'pink',
    fontSize: 'normal' as 'small' | 'normal' | 'large',
    notifications: {
      email: true,
      push: true,
      sms: false,
      budget: true,
      tontine: true,
      achievements: true,
    },
    security: {
      twoFactor: true,
      loginAlerts: true,
      sessionTimeout: '30',
    },
  };

  return useLocalStorage(STORAGE_KEYS.USER_SETTINGS, defaultSettings);
};

// ---------------------------------------------------------------------------
// Mappers
// ---------------------------------------------------------------------------

function mapTransactionRow(row: Record<string, unknown>): Transaction {
  return {
    id: Number(row.id),
    type: row.type as Transaction['type'],
    category: String(row.category),
    description: String(row.description ?? ''),
    date: String(row.date),
    amount: Number(row.amount),
    status: row.status as Transaction['status'],
    receiptUrl: row.receipt_url ? String(row.receipt_url) : null,
  };
}

function mapCategoryBudgetRow(row: Record<string, unknown>): CategoryBudget {
  return {
    id: Number(row.id),
    category: String(row.category),
    amount: Number(row.amount),
    month: Number(row.month),
    year: Number(row.year),
  };
}

function mapSavingsRow(row: Record<string, unknown>): SavingsGoal {
  return {
    id: Number(row.id),
    name: String(row.name),
    type: String(row.type),
    current: Number(row.current_amount),
    target: Number(row.target_amount),
    deadline: String(row.deadline),
    percentage: Number(row.percentage ?? 0),
    color: String(row.color ?? 'bg-blue-500'),
    description: row.description ? String(row.description) : undefined,
  };
}

function mapChallengeRow(row: Record<string, unknown>): AppChallenge {
  return {
    id: Number(row.id),
    title: String(row.title),
    description: String(row.description ?? ''),
    progress: Number(row.progress ?? 0),
    reward: String(row.reward ?? ''),
    deadline: String(row.deadline),
    type: row.type as AppChallenge['type'],
    status: row.status as AppChallenge['status'],
    target: row.target != null ? Number(row.target) : undefined,
    current: Number(row.current_value ?? 0),
  };
}

function mapBadgeRow(row: Record<string, unknown>): AppBadge {
  return {
    id: Number(row.id),
    name: String(row.name),
    description: String(row.description ?? ''),
    icon: String(row.icon ?? ''),
    earned: Boolean(row.earned),
    earnedDate: row.earned_date ? String(row.earned_date) : undefined,
    category: String(row.category ?? ''),
  };
}

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

async function buildTontineGroup(t: Record<string, unknown>): Promise<TontineGroup> {
  const id = String(t.id);
  const { data: members } = await supabase.from('tontine_members').select('*').eq('tontine_id', id);
  const memberIds = (members || []).map((m: { id: string }) => m.id);
  let payments: { member_id: string; payment_month: string; paid: boolean }[] = [];
  if (memberIds.length) {
    const { data: pmts } = await supabase.from('tontine_payments').select('*').in('member_id', memberIds);
    payments = (pmts || []) as typeof payments;
  }

  const membersBuilt: TontineMember[] = (members || []).map((m: Record<string, unknown>) => ({
    id: String(m.id),
    name: String(m.member_name),
    amount: Number(m.amount),
    createdAt: String(m.joined_at),
    payments: payments
      .filter((p) => p.member_id === m.id)
      .map((p) => ({ date: p.payment_month, paid: p.paid })),
  }));

  return {
    id,
    name: String(t.name),
    description: String(t.description ?? ''),
    members: membersBuilt,
    cycle: Number(t.current_round ?? 1),
    tours: [],
    montantCotisation: Number(t.monthly_amount),
    currentMonth: String(t.current_month),
    status: t.status as TontineStatus,
    startDate: String(t.start_date),
    totalRounds: Number(t.total_rounds),
  };
}

// ---------------------------------------------------------------------------
// Transactions
// ---------------------------------------------------------------------------

export function useTransactions() {
  const { user, loading: authLoading } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user?.id) {
      setTransactions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error: e } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });
    if (e) {
      setError(e.message);
      enqueueOfflineOperation('transactions', 'select', { user_id: user.id });
    } else {
      setTransactions((data || []).map((r) => mapTransactionRow(r as Record<string, unknown>)));
    }
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    if (authLoading) return;
    void refresh();
  }, [authLoading, refresh]);

  const addTransaction = async (input: Omit<Transaction, 'id'>) => {
    if (!user?.id) throw new Error('Non authentifié');
    const row = {
      user_id: user.id,
      type: input.type,
      category: input.category,
      description: input.description,
      date: input.date,
      amount: input.amount,
      status: input.status,
      receipt_url: input.receiptUrl ?? null,
    };
    const { data, error: e } = await supabase.from('transactions').insert(row).select('*').single();
    if (e) {
      enqueueOfflineOperation('transactions', 'insert', row);
      throw e;
    }
    setTransactions((prev) => [mapTransactionRow(data as Record<string, unknown>), ...prev]);
  };

  const updateTransaction = async (id: number, partial: Partial<Transaction>) => {
    if (!user?.id) throw new Error('Non authentifié');
    const { data, error: e } = await supabase
      .from('transactions')
      .update({
        ...(partial.type !== undefined ? { type: partial.type } : {}),
        ...(partial.category !== undefined ? { category: partial.category } : {}),
        ...(partial.description !== undefined ? { description: partial.description } : {}),
        ...(partial.date !== undefined ? { date: partial.date } : {}),
        ...(partial.amount !== undefined ? { amount: partial.amount } : {}),
        ...(partial.status !== undefined ? { status: partial.status } : {}),
        ...(partial.receiptUrl !== undefined ? { receipt_url: partial.receiptUrl } : {}),
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select('*')
      .single();
    if (e) {
      enqueueOfflineOperation('transactions', 'update', { id, partial });
      throw e;
    }
    const mapped = mapTransactionRow(data as Record<string, unknown>);
    setTransactions((prev) => prev.map((t) => (t.id === id ? mapped : t)));
  };

  const deleteTransaction = async (id: number) => {
    if (!user?.id) throw new Error('Non authentifié');
    const { error: e } = await supabase.from('transactions').delete().eq('id', id).eq('user_id', user.id);
    if (e) {
      enqueueOfflineOperation('transactions', 'delete', { id });
      throw e;
    }
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const clearAllTransactions = async () => {
    if (!user?.id) throw new Error('Non authentifié');
    const { error: e } = await supabase.from('transactions').delete().eq('user_id', user.id);
    if (e) throw e;
    setTransactions([]);
  };

  return {
    transactions,
    loading,
    error,
    refresh,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    clearAllTransactions,
  };
}

// ---------------------------------------------------------------------------
// Budgets par catégorie
// ---------------------------------------------------------------------------

export function useCategoryBudgets() {
  const { user, loading: authLoading } = useAuth();
  const [budgets, setBudgets] = useState<CategoryBudget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(
    async (month?: number, year?: number) => {
      if (!user?.id) {
        setBudgets([]);
        setLoading(false);
        return;
      }
      const now = new Date();
      const targetMonth = month ?? now.getMonth() + 1;
      const targetYear = year ?? now.getFullYear();

      setLoading(true);
      setError(null);
      const { data, error: e } = await supabase
        .from('category_budgets')
        .select('*')
        .eq('user_id', user.id)
        .eq('month', targetMonth)
        .eq('year', targetYear)
        .order('category', { ascending: true });

      if (e) {
        setError(e.message);
        enqueueOfflineOperation('category_budgets', 'select', {
          user_id: user.id,
          month: targetMonth,
          year: targetYear,
        });
      } else {
        setBudgets((data || []).map((r) => mapCategoryBudgetRow(r as Record<string, unknown>)));
      }
      setLoading(false);
    },
    [user?.id]
  );

  useEffect(() => {
    if (authLoading) return;
    void refresh();
  }, [authLoading, refresh]);

  const upsertBudget = async (payload: { category: string; amount: number; month: number; year: number }) => {
    if (!user?.id) throw new Error('Non authentifié');
    const row = {
      user_id: user.id,
      category: payload.category,
      amount: payload.amount,
      month: payload.month,
      year: payload.year,
    };
    const { data, error: e } = await supabase
      .from('category_budgets')
      .upsert(row, { onConflict: 'user_id,category,month,year' })
      .select('*')
      .single();
    if (e) throw e;
    const mapped = mapCategoryBudgetRow(data as Record<string, unknown>);
    setBudgets((prev) => {
      const idx = prev.findIndex(
        (b) => b.category === mapped.category && b.month === mapped.month && b.year === mapped.year
      );
      if (idx === -1) return [...prev, mapped].sort((a, b) => a.category.localeCompare(b.category));
      return prev.map((b, i) => (i === idx ? mapped : b));
    });
  };

  return { budgets, loading, error, refresh, upsertBudget };
}

// ---------------------------------------------------------------------------
// Épargne
// ---------------------------------------------------------------------------

export function useSavingsGoals() {
  const { user, loading: authLoading } = useAuth();
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user?.id) {
      setSavingsGoals([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error: e } = await supabase.from('savings_goals').select('*').eq('user_id', user.id);
    if (e) {
      setError(e.message);
      enqueueOfflineOperation('savings_goals', 'select', { user_id: user.id });
    } else {
      setSavingsGoals((data || []).map((r) => mapSavingsRow(r as Record<string, unknown>)));
    }
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    if (authLoading) return;
    void refresh();
  }, [authLoading, refresh]);

  const addGoal = async (goal: Omit<SavingsGoal, 'id' | 'percentage'>) => {
    if (!user?.id) throw new Error('Non authentifié');
    const row = {
      user_id: user.id,
      name: goal.name,
      type: goal.type,
      current_amount: goal.current,
      target_amount: goal.target,
      deadline: goal.deadline,
      color: goal.color,
      description: goal.description ?? null,
    };
    const { data, error: e } = await supabase.from('savings_goals').insert(row).select('*').single();
    if (e) {
      enqueueOfflineOperation('savings_goals', 'insert', row);
      throw e;
    }
    setSavingsGoals((prev) => [...prev, mapSavingsRow(data as Record<string, unknown>)]);
  };

  const updateGoal = async (id: number, partial: Partial<SavingsGoal>) => {
    if (!user?.id) throw new Error('Non authentifié');
    const payload: Record<string, unknown> = {};
    if (partial.name !== undefined) payload.name = partial.name;
    if (partial.type !== undefined) payload.type = partial.type;
    if (partial.current !== undefined) payload.current_amount = partial.current;
    if (partial.target !== undefined) payload.target_amount = partial.target;
    if (partial.deadline !== undefined) payload.deadline = partial.deadline;
    if (partial.color !== undefined) payload.color = partial.color;
    if (partial.description !== undefined) payload.description = partial.description;
    const { data, error: e } = await supabase
      .from('savings_goals')
      .update(payload)
      .eq('id', id)
      .eq('user_id', user.id)
      .select('*')
      .single();
    if (e) {
      enqueueOfflineOperation('savings_goals', 'update', { id, partial });
      throw e;
    }
    const mapped = mapSavingsRow(data as Record<string, unknown>);
    setSavingsGoals((prev) => prev.map((g) => (g.id === id ? mapped : g)));
  };

  const deleteGoal = async (id: number) => {
    if (!user?.id) throw new Error('Non authentifié');
    const { error: e } = await supabase.from('savings_goals').delete().eq('id', id).eq('user_id', user.id);
    if (e) throw e;
    setSavingsGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const addMoneyToGoal = async (goalId: number, amount: number) => {
    const goal = savingsGoals.find((g) => g.id === goalId);
    if (!goal) throw new Error('Objectif introuvable');
    const nextCurrent = Math.min(goal.current + amount, goal.target);
    await updateGoal(goalId, { current: nextCurrent });
  };

  return {
    savingsGoals,
    loading,
    error,
    refresh,
    addGoal,
    updateGoal,
    deleteGoal,
    addMoneyToGoal,
  };
}

// ---------------------------------------------------------------------------
// Défis & badges
// ---------------------------------------------------------------------------

export function useChallenges() {
  const { user, loading: authLoading } = useAuth();
  const [challenges, setChallengesState] = useState<AppChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user?.id) {
      setChallengesState([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error: e } = await supabase.from('challenges').select('*').eq('user_id', user.id);
    if (e) {
      setError(e.message);
    } else {
      setChallengesState((data || []).map((r) => mapChallengeRow(r as Record<string, unknown>)));
    }
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    if (authLoading) return;
    void refresh();
  }, [authLoading, refresh]);

  const addChallenge = async (c: Omit<AppChallenge, 'id'>) => {
    if (!user?.id) throw new Error('Non authentifié');
    const row = {
      user_id: user.id,
      title: c.title,
      description: c.description,
      type: c.type,
      status: c.status,
      progress: c.progress,
      target: c.target ?? null,
      current_value: c.current ?? 0,
      reward: c.reward,
      deadline: c.deadline,
    };
    const { data, error: e } = await supabase.from('challenges').insert(row).select('*').single();
    if (e) throw e;
    setChallengesState((prev) => [...prev, mapChallengeRow(data as Record<string, unknown>)]);
  };

  const updateChallenge = async (id: number, partial: Partial<AppChallenge>) => {
    if (!user?.id) throw new Error('Non authentifié');
    const payload: Record<string, unknown> = {};
    if (partial.title !== undefined) payload.title = partial.title;
    if (partial.description !== undefined) payload.description = partial.description;
    if (partial.type !== undefined) payload.type = partial.type;
    if (partial.status !== undefined) payload.status = partial.status;
    if (partial.progress !== undefined) payload.progress = partial.progress;
    if (partial.target !== undefined) payload.target = partial.target;
    if (partial.current !== undefined) payload.current_value = partial.current;
    if (partial.reward !== undefined) payload.reward = partial.reward;
    if (partial.deadline !== undefined) payload.deadline = partial.deadline;
    const { data, error: e } = await supabase
      .from('challenges')
      .update(payload)
      .eq('id', id)
      .eq('user_id', user.id)
      .select('*')
      .single();
    if (e) throw e;
    const mapped = mapChallengeRow(data as Record<string, unknown>);
    setChallengesState((prev) => prev.map((x) => (x.id === id ? mapped : x)));
  };

  const deleteChallenge = async (id: number) => {
    if (!user?.id) throw new Error('Non authentifié');
    const { error: e } = await supabase.from('challenges').delete().eq('id', id).eq('user_id', user.id);
    if (e) throw e;
    setChallengesState((prev) => prev.filter((x) => x.id !== id));
  };

  return {
    challenges,
    loading,
    error,
    refresh,
    addChallenge,
    updateChallenge,
    deleteChallenge,
    setChallenges: setChallengesState,
  };
}

export function useBadges() {
  const { user, loading: authLoading } = useAuth();
  const [badges, setBadgesState] = useState<AppBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user?.id) {
      setBadgesState([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error: e } = await supabase.from('badges').select('*').eq('user_id', user.id);
    if (e) {
      setError(e.message);
    } else {
      setBadgesState((data || []).map((r) => mapBadgeRow(r as Record<string, unknown>)));
    }
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    if (authLoading) return;
    void refresh();
  }, [authLoading, refresh]);

  const updateBadge = async (id: number, partial: Partial<AppBadge>) => {
    if (!user?.id) throw new Error('Non authentifié');
    const payload: Record<string, unknown> = {};
    if (partial.name !== undefined) payload.name = partial.name;
    if (partial.description !== undefined) payload.description = partial.description;
    if (partial.icon !== undefined) payload.icon = partial.icon;
    if (partial.category !== undefined) payload.category = partial.category;
    if (partial.earned !== undefined) payload.earned = partial.earned;
    if (partial.earnedDate !== undefined) payload.earned_date = partial.earnedDate;
    const { data, error: e } = await supabase
      .from('badges')
      .update(payload)
      .eq('id', id)
      .eq('user_id', user.id)
      .select('*')
      .single();
    if (e) throw e;
    const mapped = mapBadgeRow(data as Record<string, unknown>);
    setBadgesState((prev) => prev.map((b) => (b.id === id ? mapped : b)));
  };

  return {
    badges,
    loading,
    error,
    refresh,
    updateBadge,
    setBadges: setBadgesState,
  };
}

// ---------------------------------------------------------------------------
// Profil utilisateur
// ---------------------------------------------------------------------------

const emptyProfile = (email: string): UserProfileData => ({
  firstName: '',
  lastName: '',
  email,
  emailConfirmedAt: null,
  phone: '',
  address: '',
  birthDate: '',
  occupation: '',
  monthlyIncome: '',
  memberSince: new Date().toISOString(),
  avatarUrl: '',
});

export function useUserProfile() {
  const { user, loading: authLoading } = useAuth();
  const [profileData, setProfileData] = useState<UserProfileData>(emptyProfile(''));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user?.id) {
      setProfileData(emptyProfile(''));
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error: e } = await supabase.from('user_profiles').select('*').eq('id', user.id).maybeSingle();
    if (e) {
      setError(e.message);
      setLoading(false);
      return;
    }
    const email = user.email ?? '';
    if (!data) {
      setProfileData({
        ...emptyProfile(email),
        emailConfirmedAt: user.email_confirmed_at ?? null,
        memberSince: user.created_at ?? new Date().toISOString(),
      });
      setLoading(false);
      return;
    }
    const row = data as Record<string, unknown>;
    const confirmed =
      row.email_confirmed_at != null ? String(row.email_confirmed_at) : null;
    setProfileData({
      firstName: String(row.first_name ?? ''),
      lastName: String(row.last_name ?? ''),
      email,
      emailConfirmedAt: confirmed,
      phone: String(row.phone ?? ''),
      address: String(row.address ?? ''),
      birthDate: row.birth_date ? String(row.birth_date) : '',
      occupation: String(row.occupation ?? ''),
      monthlyIncome: row.monthly_income != null ? String(row.monthly_income) : '',
      memberSince: user.created_at ?? new Date().toISOString(),
      avatarUrl: '',
    });
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    void refresh();
  }, [authLoading, refresh]);

  const saveProfile = async (next: UserProfileData) => {
    if (!user?.id) throw new Error('Non authentifié');
    const row = {
      id: user.id,
      first_name: next.firstName,
      last_name: next.lastName,
      phone: next.phone || null,
      address: next.address || null,
      birth_date: next.birthDate || null,
      occupation: next.occupation || null,
      monthly_income: next.monthlyIncome ? Number(next.monthlyIncome) : null,
    };
    const { error: e } = await supabase.from('user_profiles').upsert(row);
    if (e) throw e;
    setProfileData(next);
  };

  return { profileData, setProfileData, loading, error, refresh, saveProfile };
}

// ---------------------------------------------------------------------------
// Compteurs notifications (sidebar)
// ---------------------------------------------------------------------------

export function useNotificationCounts() {
  const { user, loading: authLoading } = useAuth();
  const [unread, setUnread] = useState(0);
  const [important, setImportant] = useState(0);

  useEffect(() => {
    if (authLoading || !user?.id) {
      setUnread(0);
      setImportant(0);
      return;
    }

    const load = async () => {
      const u = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('read', false);
      setUnread(u.count ?? 0);
      const i = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('important', true);
      setImportant(i.count ?? 0);
    };

    void load();
    window.addEventListener('notificationsUpdated', load);
    return () => window.removeEventListener('notificationsUpdated', load);
  }, [user?.id, authLoading]);

  return { unread, important };
}

// ---------------------------------------------------------------------------
// Tontines
// ---------------------------------------------------------------------------

export function useTontines() {
  const { user, loading: authLoading } = useAuth();
  const [myTontines, setMyTontines] = useState<TontineGroup[]>([]);
  const [availableTontines] = useState<TontineGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user?.id) {
      setMyTontines([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const { data: created } = await supabase.from('tontines').select('id').eq('creator_id', user.id);
    const { data: memberRows } = await supabase.from('tontine_members').select('tontine_id').eq('user_id', user.id);
    const ids = new Set<string>();
    (created || []).forEach((r: { id: string }) => ids.add(r.id));
    (memberRows || []).forEach((r: { tontine_id: string }) => ids.add(r.tontine_id));
    if (ids.size === 0) {
      setMyTontines([]);
      setLoading(false);
      return;
    }
    const { data: allT, error: e } = await supabase.from('tontines').select('*').in('id', [...ids]);
    if (e) {
      setError(e.message);
      setLoading(false);
      return;
    }
    const groups: TontineGroup[] = [];
    for (const t of allT || []) {
      groups.push(await buildTontineGroup(t as Record<string, unknown>));
    }
    setMyTontines(groups);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    if (authLoading) return;
    void refresh();
  }, [authLoading, refresh]);

  const createTontine = async (input: {
    name: string;
    description: string;
    montantCotisation: number;
    totalMembers: number;
  }) => {
    if (!user?.id) throw new Error('Non authentifié');
    const { data, error: e } = await supabase
      .from('tontines')
      .insert({
        creator_id: user.id,
        name: input.name,
        description: input.description,
        monthly_amount: input.montantCotisation,
        total_rounds: input.totalMembers,
        current_round: 1,
        current_month: getCurrentMonth(),
        status: 'pending',
        start_date: new Date().toISOString().split('T')[0],
      })
      .select('*')
      .single();
    if (e) throw e;
    const g = await buildTontineGroup(data as Record<string, unknown>);
    setMyTontines((prev) => [...prev, g]);
    return g;
  };

  const addMember = async (tontineId: string, member: { name: string; amount: number }, currentMonth: string) => {
    const { data: mem, error: e1 } = await supabase
      .from('tontine_members')
      .insert({
        tontine_id: tontineId,
        user_id: null,
        member_name: member.name,
        amount: member.amount,
      })
      .select('*')
      .single();
    if (e1) throw e1;
    const { error: e2 } = await supabase.from('tontine_payments').insert({
      member_id: mem.id,
      tontine_id: tontineId,
      payment_month: currentMonth,
      paid: false,
    });
    if (e2) throw e2;
    await refresh();
  };

  const togglePayment = async (tontineId: string, memberId: string, paymentMonth: string, currentlyPaid: boolean) => {
    const newPaid = !currentlyPaid;
    const { error: e } = await supabase.from('tontine_payments').upsert(
      {
        member_id: memberId,
        tontine_id: tontineId,
        payment_month: paymentMonth,
        paid: newPaid,
        paid_at: newPaid ? new Date().toISOString() : null,
      },
      { onConflict: 'member_id,payment_month' }
    );
    if (e) throw e;
    await refresh();
  };

  const deleteMember = async (memberId: string) => {
    const { error: e } = await supabase.from('tontine_members').delete().eq('id', memberId);
    if (e) throw e;
    await refresh();
  };

  const deleteTontine = async (tontineId: string) => {
    const { error: e } = await supabase.from('tontines').delete().eq('id', tontineId);
    if (e) throw e;
    await refresh();
  };

  const passToNextMonth = async (tontineId: string, currentMonth: string, totalRounds: number, currentCycle: number) => {
    const [y, m] = currentMonth.split('-').map(Number);
    const next = new Date(y, m, 1);
    const nextMonth = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`;
    const nextCycle = Math.min(currentCycle + 1, totalRounds);
    const { data: members } = await supabase.from('tontine_members').select('id').eq('tontine_id', tontineId);
    const { error: e1 } = await supabase
      .from('tontines')
      .update({ current_month: nextMonth, current_round: nextCycle })
      .eq('id', tontineId);
    if (e1) throw e1;
    if (members?.length) {
      const rows = members.map((row: { id: string }) => ({
        member_id: row.id,
        tontine_id: tontineId,
        payment_month: nextMonth,
        paid: false,
      }));
      await supabase.from('tontine_payments').insert(rows);
    }
    await refresh();
  };

  return {
    myTontines,
    availableTontines,
    loading,
    error,
    refresh,
    createTontine,
    addMember,
    togglePayment,
    deleteMember,
    deleteTontine,
    passToNextMonth,
  };
}
