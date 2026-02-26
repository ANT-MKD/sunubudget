import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, Bell } from 'lucide-react';
import { notificationService, Notification } from '../../../lib/notificationService';

interface ToastProps {
  notification: Notification;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ notification, onClose, duration = 5000 }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Attendre l'animation de sortie
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getBgColor = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700';
      case 'info':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700';
      default:
        return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
    }
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-sm w-full mx-4 sm:mx-0 transform transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className={`${getBgColor()} border rounded-lg shadow-lg p-4`}>
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                {notification.title}
              </h4>
              <button
                onClick={() => {
                  setIsVisible(false);
                  setTimeout(onClose, 300);
                }}
                className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {notification.message}
            </p>
            {notification.action && (
              <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium mt-2">
                {notification.action}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface ToastContainerProps {
  children?: React.ReactNode;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Notification[]>([]);
  const [displayedToastIds, setDisplayedToastIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Écouter les nouvelles notifications
    const checkNewNotifications = () => {
      const notifications = notificationService.getNotifications();
      const unreadNotifications = notifications.filter(n => !n.read);
      
      // Ajouter seulement les nouvelles notifications qui n'ont pas encore été affichées
      unreadNotifications.forEach(notification => {
        if (!displayedToastIds.has(notification.id) && !toasts.find(t => t.id === notification.id)) {
          setToasts(prev => [...prev, notification]);
          setDisplayedToastIds(prev => new Set([...prev, notification.id]));
        }
      });
    };

    // Vérifier toutes les 2 secondes
    const interval = setInterval(checkNewNotifications, 2000);
    
    return () => clearInterval(interval);
  }, [toasts, displayedToastIds]);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
    // Ne pas marquer automatiquement comme lue quand le toast se ferme
    // La notification restera visible dans la liste des notifications
  };

  // Nettoyer les IDs des toasts affichés quand les notifications sont marquées comme lues
  useEffect(() => {
    const handleNotificationsUpdated = () => {
      const notifications = notificationService.getNotifications();
      const readNotificationIds = notifications
        .filter(n => n.read)
        .map(n => n.id);
      
      // Retirer les notifications lues des toasts affichés
      setToasts(prev => prev.filter(toast => !readNotificationIds.includes(toast.id)));
    };

    window.addEventListener('notificationsUpdated', handleNotificationsUpdated);
    
    return () => {
      window.removeEventListener('notificationsUpdated', handleNotificationsUpdated);
    };
  }, []);

  return (
    <>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2 mx-4 sm:mx-0">
        {toasts.slice(0, 3).map((toast) => (
          <Toast
            key={toast.id}
            notification={toast}
            onClose={() => removeToast(toast.id)}
            duration={toast.important ? 8000 : 5000}
          />
        ))}
      </div>
    </>
  );
}; 