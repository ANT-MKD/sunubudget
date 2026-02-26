import React, { useState, useEffect } from 'react';
import { Bell, Check, X, AlertCircle, Info, Star, Clock, Filter, Search, Trash2 } from 'lucide-react';
import { notificationService, Notification } from '../lib/notificationService';

const Notifications: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'unread' | 'important'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Charger les notifications depuis le service
  useEffect(() => {
    const loadNotifications = () => {
      const currentNotifications = notificationService.getNotifications();
      setNotifications(currentNotifications);
    };

    loadNotifications();

    // Les notifications de test ont été supprimées

    // Écouter les changements dans le localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'notifications') {
        loadNotifications();
      }
    };

    // Écouter l'événement personnalisé de mise à jour des notifications
    const handleNotificationsUpdated = () => {
      loadNotifications();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('notificationsUpdated', handleNotificationsUpdated);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('notificationsUpdated', handleNotificationsUpdated);
    };
  }, []);

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

  const markAsRead = (id: string) => {
    notificationService.markAsRead(id);
    setNotifications(notificationService.getNotifications());
  };

  const markAllAsRead = () => {
    notificationService.markAllAsRead();
    setNotifications(notificationService.getNotifications());
  };

  const deleteNotification = (id: string) => {
    const notificationToDelete = notifications.find(n => n.id === id);
    if (notificationToDelete && window.confirm(`Êtes-vous sûr de vouloir supprimer la notification "${notificationToDelete.title}" ?`)) {
      notificationService.deleteNotification(id);
      setNotifications(notificationService.getNotifications());
    }
  };

  const clearAllNotifications = () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer toutes les notifications ? Cette action est irréversible.')) {
      notificationService.clearAllNotifications();
      setNotifications(notificationService.getNotifications());
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
      filteredNotifications.forEach(notification => {
        notificationService.deleteNotification(notification.id);
      });
      setNotifications(notificationService.getNotifications());
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

  const unreadCount = notifications.filter(n => !n.read).length;
  const importantCount = notifications.filter(n => n.important).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Notifications</h1>
            <p className="text-gray-600 text-lg">Restez informé de vos activités financières</p>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            {notifications.length > 0 && (
              <button
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
                onClick={markAllAsRead}
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