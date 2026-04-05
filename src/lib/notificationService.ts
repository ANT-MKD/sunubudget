import { loadFromStorage, saveToStorage, STORAGE_KEYS } from './storage';

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

function readNotifications(): Notification[] {
  return loadFromStorage(STORAGE_KEYS.NOTIFICATIONS, [] as Notification[]);
}

function writeNotifications(notifications: Notification[]): void {
  saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);
}

function emitUnreadCount(notifications: Notification[]): void {
  window.dispatchEvent(
    new CustomEvent('notificationsUpdated', {
      detail: { unreadCount: notifications.filter((n) => !n.read).length },
    })
  );
}

class NotificationService {
  // Générer une notification pour une nouvelle transaction
  createTransactionNotification(transaction: any) {
    const notification: Notification = {
      id: `transaction_${Date.now()}`,
      title: transaction.type === 'income' ? 'Nouveau revenu enregistré' : 'Nouvelle dépense enregistrée',
      message: `${transaction.type === 'income' ? 'Revenu' : 'Dépense'} de ${transaction.amount.toLocaleString()} F CFA pour ${transaction.category}`,
      type: transaction.type === 'income' ? 'success' : 'info',
      timestamp: new Date().toISOString(),
      read: false,
      important: transaction.amount > 100000, // Important si > 100k F CFA
      action: 'Voir les détails',
      category: 'transaction',
    };

    this.addNotification(notification);
  }

  // Générer une notification pour un objectif d'épargne
  createSavingsNotification(goal: any, action: 'created' | 'updated' | 'completed') {
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
        title = 'Objectif d\'épargne mis à jour';
        message = `Progression de "${goal.name}" : ${goal.percentage}% (${goal.current.toLocaleString()} / ${goal.target.toLocaleString()} F CFA)`;
        type = 'info';
        break;
      case 'completed':
        title = '🎉 Objectif d\'épargne atteint !';
        message = `Félicitations ! Vous avez atteint votre objectif "${goal.name}" de ${goal.target.toLocaleString()} F CFA`;
        type = 'success';
        break;
    }

    const notification: Notification = {
      id: `savings_${action}_${Date.now()}`,
      title,
      message,
      type,
      timestamp: new Date().toISOString(),
      read: false,
      important: action === 'completed',
      action: "Voir l'objectif",
      category: 'savings',
    };

    this.addNotification(notification);
  }

  // Générer une notification pour un défi
  createChallengeNotification(challenge: any, action: 'created' | 'completed' | 'failed') {
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

    const notification: Notification = {
      id: `challenge_${action}_${Date.now()}`,
      title,
      message,
      type,
      timestamp: new Date().toISOString(),
      read: false,
      important: action === 'completed',
      action: 'Voir les défis',
      category: 'achievement',
    };

    this.addNotification(notification);
  }

  // Générer une notification pour une tontine
  createTontineNotification(tontine: any, action: 'created' | 'payment' | 'completed') {
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
        message = `Paiement de ${tontine.amount?.toLocaleString() || 0} F CFA reçu pour la tontine "${tontine.name}"`;
        type = 'success';
        break;
      case 'completed':
        title = 'Tontine terminée';
        message = `La tontine "${tontine.name}" a été terminée avec succès`;
        type = 'success';
        break;
    }

    const notification: Notification = {
      id: `tontine_${action}_${Date.now()}`,
      title,
      message,
      type,
      timestamp: new Date().toISOString(),
      read: false,
      important: action === 'payment',
      action: 'Voir la tontine',
      category: 'tontine',
    };

    this.addNotification(notification);
  }

  // Générer une notification de budget
  createBudgetNotification(type: 'warning' | 'exceeded', amount: number, budget: number) {
    const percentage = Math.round((amount / budget) * 100);

    const notification: Notification = {
      id: `budget_${type}_${Date.now()}`,
      title: type === 'exceeded' ? '⚠️ Budget dépassé' : '⚠️ Attention budget',
      message:
        type === 'exceeded'
          ? `Vous avez dépassé votre budget de ${percentage}% (${amount.toLocaleString()} / ${budget.toLocaleString()} F CFA)`
          : `Vous avez utilisé ${percentage}% de votre budget (${amount.toLocaleString()} / ${budget.toLocaleString()} F CFA)`,
      type: type === 'exceeded' ? 'error' : 'warning',
      timestamp: new Date().toISOString(),
      read: false,
      important: true,
      action: 'Voir le budget',
      category: 'budget',
    };

    this.addNotification(notification);
  }

  // Générer une notification système
  createSystemNotification(title: string, message: string, type: Notification['type'] = 'info', important: boolean = false) {
    const notification: Notification = {
      id: `system_${Date.now()}`,
      title,
      message,
      type,
      timestamp: new Date().toISOString(),
      read: false,
      important,
      category: 'system',
    };

    this.addNotification(notification);
  }

  // Ajouter une notification
  private addNotification(notification: Notification) {
    const notifications = readNotifications();
    notifications.unshift(notification);
    const next = notifications.length > 100 ? notifications.slice(0, 100) : notifications;
    writeNotifications(next);
    emitUnreadCount(next);
  }

  // Obtenir toutes les notifications
  getNotifications(): Notification[] {
    return readNotifications();
  }

  // Marquer une notification comme lue
  markAsRead(id: string) {
    const notifications = readNotifications();
    const next = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    writeNotifications(next);
    emitUnreadCount(next);
  }

  // Marquer toutes les notifications comme lues
  markAllAsRead() {
    const notifications = readNotifications();
    const next = notifications.map((n) => ({ ...n, read: true }));
    writeNotifications(next);
    emitUnreadCount(next);
  }

  // Supprimer une notification
  deleteNotification(id: string) {
    const notifications = readNotifications();
    const next = notifications.filter((n) => n.id !== id);
    writeNotifications(next);
    emitUnreadCount(next);
  }

  // Supprimer toutes les notifications
  clearAllNotifications() {
    writeNotifications([]);
    emitUnreadCount([]);
  }

  // Obtenir le nombre de notifications non lues
  getUnreadCount(): number {
    return readNotifications().filter((n) => !n.read).length;
  }

  // Obtenir le nombre de notifications importantes
  getImportantCount(): number {
    return readNotifications().filter((n) => n.important).length;
  }
}

// Instance singleton du service
export const notificationService = new NotificationService();
