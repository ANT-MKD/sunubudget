import { supabase } from './supabase';
import { enqueueOfflineOperation } from './offlineQueue';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
  timestamp: string;
  read: boolean;
  important: boolean;
  action?: string;
  category?: 'transaction' | 'savings' | 'budget' | 'tontine' | 'achievement' | 'system';
}

function emitUpdated(): void {
  window.dispatchEvent(new CustomEvent('notificationsUpdated'));
}

async function insertNotification(row: {
  title: string;
  message: string;
  type: Notification['type'];
  important?: boolean;
  action?: string | null;
  category?: string | null;
}): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase.from('notifications').insert({
    user_id: user.id,
    title: row.title,
    message: row.message,
    type: row.type,
    read: false,
    important: row.important ?? false,
    action: row.action ?? null,
    category: row.category ?? null,
  });

  if (error) {
    enqueueOfflineOperation('notifications', 'insert', row);
    throw error;
  }
  emitUpdated();
}

class NotificationService {
  private async getCurrentUserId(): Promise<string | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user?.id ?? null;
  }

  async createTransactionNotification(transaction: {
    type: string;
    amount: number;
    category: string;
  }): Promise<void> {
    await insertNotification({
      title: transaction.type === 'income' ? 'Nouveau revenu enregistré' : 'Nouvelle dépense enregistrée',
      message: `${transaction.type === 'income' ? 'Revenu' : 'Dépense'} de ${transaction.amount.toLocaleString()} F CFA pour ${transaction.category}`,
      type: transaction.type === 'income' ? 'success' : 'info',
      important: transaction.amount > 100000,
      action: 'Voir les détails',
      category: 'transaction',
    });
  }

  async createSavingsNotification(
    goal: { name: string; target: number; current: number; percentage: number },
    action: 'created' | 'updated' | 'completed'
  ): Promise<void> {
    let title = '';
    let message = '';
    let type: Notification['type'] = 'info';

    switch (action) {
      case 'created':
        title = "Nouvel objectif d'épargne créé";
        message = `Objectif "${goal.name}" créé avec un objectif de ${goal.target.toLocaleString()} F CFA`;
        type = 'success';
        break;
      case 'updated':
        title = "Objectif d'épargne mis à jour";
        message = `Progression de "${goal.name}" : ${goal.percentage}% (${goal.current.toLocaleString()} / ${goal.target.toLocaleString()} F CFA)`;
        type = 'info';
        break;
      case 'completed':
        title = '🎉 Objectif d’épargne atteint !';
        message = `Félicitations ! Vous avez atteint votre objectif "${goal.name}" de ${goal.target.toLocaleString()} F CFA`;
        type = 'success';
        break;
    }

    await insertNotification({
      title,
      message,
      type,
      important: action === 'completed',
      action: "Voir l'objectif",
      category: 'savings',
    });
  }

  async createChallengeNotification(
    challenge: { title: string; description: string; reward: string },
    action: 'created' | 'completed' | 'failed'
  ): Promise<void> {
    let title = '';
    let message = '';
    let type: Notification['type'] = 'info';

    switch (action) {
      case 'created':
        title = 'Nouveau défi disponible';
        message = `Défi "${challenge.title}" - ${challenge.description}`;
        type = 'info';
        break;
      case 'completed':
        title = '🏆 Défi terminé !';
        message = `Félicitations ! Vous avez terminé le défi "${challenge.title}" et gagné ${challenge.reward}`;
        type = 'success';
        break;
      case 'failed':
        title = 'Défi non terminé';
        message = `Le défi "${challenge.title}" n'a pas été terminé dans les délais`;
        type = 'warning';
        break;
    }

    await insertNotification({
      title,
      message,
      type,
      important: action === 'completed',
      action: 'Voir les défis',
      category: 'achievement',
    });
  }

  async createTontineNotification(
    tontine: { name: string; members?: unknown[]; amount?: number },
    action: 'created' | 'payment' | 'completed'
  ): Promise<void> {
    let title = '';
    let message = '';
    let type: Notification['type'] = 'info';

    switch (action) {
      case 'created':
        title = 'Nouvelle tontine créée';
        message = `Tontine "${tontine.name}" créée avec ${tontine.members?.length || 0} membres`;
        type = 'success';
        break;
      case 'payment':
        title = 'Paiement de tontine reçu';
        message = `Paiement de ${(tontine.amount ?? 0).toLocaleString()} F CFA reçu pour la tontine "${tontine.name}"`;
        type = 'success';
        break;
      case 'completed':
        title = 'Tontine terminée';
        message = `La tontine "${tontine.name}" a été terminée avec succès`;
        type = 'success';
        break;
    }

    await insertNotification({
      title,
      message,
      type,
      important: action === 'payment',
      action: 'Voir la tontine',
      category: 'tontine',
    });
  }

  async createBudgetNotification(type: 'warning' | 'exceeded', amount: number, budget: number): Promise<void> {
    const percentage = Math.round((amount / budget) * 100);

    await insertNotification({
      title: type === 'exceeded' ? '⚠️ Budget dépassé' : '⚠️ Attention budget',
      message:
        type === 'exceeded'
          ? `Vous avez dépassé votre budget de ${percentage}% (${amount.toLocaleString()} / ${budget.toLocaleString()} F CFA)`
          : `Vous avez utilisé ${percentage}% de votre budget (${amount.toLocaleString()} / ${budget.toLocaleString()} F CFA)`,
      type: type === 'exceeded' ? 'error' : 'warning',
      important: true,
      action: 'Voir le budget',
      category: 'budget',
    });
  }

  async checkAndNotifyBudgetThreshold(category: string): Promise<void> {
    const userId = await this.getCurrentUserId();
    if (!userId) return;

    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const from = new Date(year, now.getMonth(), 1).toISOString().slice(0, 10);
    const to = new Date(year, now.getMonth() + 1, 0).toISOString().slice(0, 10);

    const { data: budgetRow, error: budgetError } = await supabase
      .from('category_budgets')
      .select('amount')
      .eq('user_id', userId)
      .eq('category', category)
      .eq('month', month)
      .eq('year', year)
      .maybeSingle();
    if (budgetError || !budgetRow) return;

    const { data: expenses, error: expensesError } = await supabase
      .from('transactions')
      .select('amount')
      .eq('user_id', userId)
      .eq('type', 'expense')
      .eq('category', category)
      .gte('date', from)
      .lte('date', to);
    if (expensesError) return;

    const spent = (expenses || []).reduce((sum, row) => sum + Number((row as { amount: number }).amount), 0);
    const budget = Number((budgetRow as { amount: number }).amount);
    if (!Number.isFinite(budget) || budget <= 0) return;

    if (spent >= budget) {
      await this.createBudgetNotification('exceeded', spent, budget);
    } else if (spent >= budget * 0.8) {
      await this.createBudgetNotification('warning', spent, budget);
    }
  }

  async createSystemNotification(
    title: string,
    message: string,
    type: Notification['type'] = 'info',
    important: boolean = false
  ): Promise<void> {
    await insertNotification({
      title,
      message,
      type,
      important,
      action: null,
      category: 'system',
    });
  }

  async markAsRead(id: string): Promise<void> {
    const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id);
    if (error) throw error;
    emitUpdated();
  }

  async markAllAsRead(): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from('notifications').update({ read: true }).eq('user_id', user.id);
    if (error) throw error;
    emitUpdated();
  }

  async deleteNotification(id: string): Promise<void> {
    const { error } = await supabase.from('notifications').delete().eq('id', id);
    if (error) throw error;
    emitUpdated();
  }

  async clearAllNotifications(): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from('notifications').delete().eq('user_id', user.id);
    if (error) throw error;
    emitUpdated();
  }
}

export const notificationService = new NotificationService();
