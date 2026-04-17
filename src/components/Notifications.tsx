import React, { useState, useEffect, useCallback } from 'react';
import { Bell, Check, X, AlertCircle, Info, Star, Clock, Search, Trash2 } from 'lucide-react';
import { notificationService, Notification } from '../lib/notificationService';
import { supabase } from '../lib/supabase';

function mapDbToNotification(row: Record<string, unknown>): Notification {
  return {
    id: String(row.id),
    title: String(row.title),
    message: String(row.message),
    type: row.type as Notification['type'],
    timestamp: String(row.created_at),
    read: Boolean(row.read),
    important: Boolean(row.important),
    action: row.action ? String(row.action) : undefined,
    category: (row.category as Notification['category']) ?? undefined,
  };
}

const Notifications: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'unread' | 'important'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadNotifications = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setNotifications([]);
      return;
    }
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) {
      setLoadError(error.message);
      return;
    }
    setLoadError(null);
    setNotifications((data || []).map((r) => mapDbToNotification(r as Record<string, unknown>)));
  }, []);

  useEffect(() => {
    void loadNotifications();
    const handleNotificationsUpdated = () => {
      void loadNotifications();
    };
    window.addEventListener('notificationsUpdated', handleNotificationsUpdated);
    return () => window.removeEventListener('notificationsUpdated', handleNotificationsUpdated);
  }, [loadNotifications]);

  // Filtrer les notifications
  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = 
      filter === 'all' || 
      (filter === 'unread' && !notification.read) ||
      (filter === 'important' && notification.important);
    
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const markAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      await loadNotifications();
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Impossible de marquer comme lu.');
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      await loadNotifications();
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Action impossible.');
    }
  };

  const deleteNotification = (id: string) => {
    const notificationToDelete = notifications.find((n) => n.id === id);
    if (
      notificationToDelete &&
      window.confirm(`Êtes-vous sûr de vouloir supprimer la notification "${notificationToDelete.title}" ?`)
    ) {
      void (async () => {
        try {
          await notificationService.deleteNotification(id);
          await loadNotifications();
        } catch (e) {
          setLoadError(e instanceof Error ? e.message : 'Suppression impossible.');
        }
      })();
    }
  };

  const clearAllNotifications = () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer toutes les notifications ? Cette action est irréversible.')) {
      void (async () => {
        try {
          await notificationService.clearAllNotifications();
          await loadNotifications();
        } catch (e) {
          setLoadError(e instanceof Error ? e.message : 'Suppression impossible.');
        }
      })();
    }
  };

  const clearFilteredNotifications = () => {
    let message = '';
    let count = 0;

    if (filter === 'unread') {
      count = unreadCount;
      message = `Êtes-vous sûr de vouloir supprimer les ${count} notification${count > 1 ? 's' : ''} non lue${count > 1 ? 's' : ''} ?`;
    } else if (filter === 'important') {
      count = importantCount;
      message = `Êtes-vous sûr de vouloir supprimer les ${count} notification${count > 1 ? 's' : ''} importante${count > 1 ? 's' : ''} ?`;
    } else {
      count = filteredNotifications.length;
      message = `Êtes-vous sûr de vouloir supprimer les ${count} notification${count > 1 ? 's' : ''} filtrée${count > 1 ? 's' : ''} ?`;
    }

    if (window.confirm(message)) {
      void (async () => {
        try {
          await Promise.all(filteredNotifications.map((n) => notificationService.deleteNotification(n.id)));
          await loadNotifications();
        } catch (e) {
          setLoadError(e instanceof Error ? e.message : 'Suppression impossible.');
        }
      })();
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <Check className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'error':
        return <X className="w-5 h-5 text-red-600" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const importantCount = notifications.filter((n) => n.important).length;

  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-white to-gray-50 p-4 pb-24 dark:from-gray-900 dark:to-gray-800 sm:p-6 lg:p-8">
      {loadError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-500/40 dark:bg-red-950/50 dark:text-red-200">
          {loadError}
        </div>
      )}
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Notifications</h1>
            <p className="text-gray-600 text-lg">Restez informé de vos activités financières</p>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            {notifications.length > 0 && (
              <button
                type="button"
                onClick={clearAllNotifications}
                className="bg-red-50 text-red-600 hover:bg-red-100 px-3 sm:px-4 py-2 rounded-xl font-medium transition-colors flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Tout supprimer</span>
                <span className="sm:hidden">Supprimer</span>
              </button>
            )}
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => void markAllAsRead()}
                className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 sm:px-4 py-2 rounded-xl font-medium transition-colors flex items-center space-x-2"
              >
                <Check className="w-4 h-4" />
                <span className="hidden sm:inline">Tout marquer comme lu</span>
                <span className="sm:hidden">Marquer lu</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Total</h3>
            <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
              <Bell className="w-5 h-5 text-gray-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">{notifications.length}</div>
          <div className="text-sm text-gray-500 mt-2">Notifications</div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Non lues</h3>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-blue-600">{unreadCount}</div>
          <div className="text-sm text-blue-600 mt-2">En attente</div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Importantes</h3>
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl flex items-center justify-center">
              <Star className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-yellow-600">{importantCount}</div>
          <div className="text-sm text-yellow-600 mt-2">Prioritaires</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              {[
                { key: 'all', label: 'Toutes', count: notifications.length },
                { key: 'unread', label: 'Non lues', count: unreadCount },
                { key: 'important', label: 'Importantes', count: importantCount }
              ].map((filterOption) => (
                <button
                  key={filterOption.key}
                  onClick={() => setFilter(filterOption.key as 'all' | 'unread' | 'important')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
                    filter === filterOption.key
                      ? 'bg-white shadow-sm text-gray-900'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <span>{filterOption.label}</span>
                  {filterOption.count > 0 && (
                    <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                      filter === filterOption.key
                        ? 'bg-gray-900 text-white'
                        : filterOption.key === 'unread'
                        ? 'bg-blue-100 text-blue-600'
                        : filterOption.key === 'important'
                        ? 'bg-yellow-100 text-yellow-600'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {filterOption.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher dans les notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-80 pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
            {filteredNotifications.length > 0 && (
              <button
                onClick={clearFilteredNotifications}
                className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center space-x-2 text-sm"
                title={`Supprimer les ${filteredNotifications.length} notification${filteredNotifications.length > 1 ? 's' : ''} affichée${filteredNotifications.length > 1 ? 's' : ''}`}
              >
                <Trash2 className="w-4 h-4" />
                <span>Supprimer ({filteredNotifications.length})</span>
              </button>
            )}
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune notification</h3>
              <p className="text-gray-600">
                {filter === 'unread' && 'Toutes vos notifications ont été lues'}
                {filter === 'important' && 'Aucune notification importante pour le moment'}
                {filter === 'all' && 'Vous n\'avez aucune notification'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-6 hover:bg-gray-50 transition-colors ${
                  !notification.read ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    getNotificationColor(notification.type).split(' ')[0]
                  }`}>
                    {getNotificationIcon(notification.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <h3 className={`text-lg font-semibold ${
                          !notification.read ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {notification.title}
                        </h3>
                        {notification.important && (
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                            Important
                          </span>
                        )}
                        {!notification.read && (
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                            Nouveau
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">
                          {new Date(notification.timestamp).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        <div className="flex items-center space-x-1">
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                              title="Marquer comme lu"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Supprimer cette notification"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600 mt-2">{notification.message}</p>
                    {notification.action && (
                      <div className="mt-3">
                        <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                          {notification.action}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;