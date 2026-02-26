import { useState, useEffect } from 'react';
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from '../lib/storage';
import type { Transaction, SavingsGoal, TontineGroup } from '../types';

// Hook générique pour gérer le localStorage
export const useLocalStorage = <T>(key: string, defaultValue: T) => {
  const [value, setValue] = useState<T>(() => {
    return loadFromStorage(key, defaultValue);
  });

  useEffect(() => {
    saveToStorage(key, value);
  }, [key, value]);

  return [value, setValue] as const;
};

// Hook spécifique pour les transactions
export const useTransactions = () => {
  const defaultTransactions: Transaction[] = [];

  return useLocalStorage<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, defaultTransactions);
};

// Hook spécifique pour les objectifs d'épargne
export const useSavingsGoals = () => {
  const defaultSavingsGoals: SavingsGoal[] = [];

  return useLocalStorage<SavingsGoal[]>(STORAGE_KEYS.SAVINGS_GOALS, defaultSavingsGoals);
};

// Hook spécifique pour les défis
export const useChallenges = () => {
  const defaultChallenges: any[] = [];

  return useLocalStorage(STORAGE_KEYS.CHALLENGES, defaultChallenges);
};

// Hook spécifique pour les badges
export const useBadges = () => {
  const defaultBadges: any[] = [];

  return useLocalStorage(STORAGE_KEYS.BADGES, defaultBadges);
};

// Hook spécifique pour les tontines
export const useTontines = () => {
  const defaultMyTontines: TontineGroup[] = [];
  const defaultAvailableTontines: TontineGroup[] = [];

  const [myTontines, setMyTontines] = useLocalStorage<TontineGroup[]>(STORAGE_KEYS.MY_TONTINES, defaultMyTontines);
  const [availableTontines, setAvailableTontines] = useLocalStorage<TontineGroup[]>(STORAGE_KEYS.AVAILABLE_TONTINES, defaultAvailableTontines);

  return {
    myTontines,
    setMyTontines,
    availableTontines,
    setAvailableTontines
  };
};

// Hook spécifique pour les paramètres utilisateur
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
      achievements: true
    },
    security: {
      twoFactor: true,
      loginAlerts: true,
      sessionTimeout: '30'
    }
  };

  return useLocalStorage(STORAGE_KEYS.USER_SETTINGS, defaultSettings);
};

// Hook spécifique pour les notifications
export const useNotifications = () => {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    // Charger les notifications depuis le service
    const loadNotifications = () => {
      // Importer le service de notifications de manière dynamique pour éviter les imports circulaires
      import('../lib/notificationService').then(({ notificationService }) => {
        const currentNotifications = notificationService.getNotifications();
        setNotifications(currentNotifications);
      });
    };

    loadNotifications();

    // Écouter les changements dans le localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.NOTIFICATIONS) {
        loadNotifications();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const updateNotifications = (newNotifications: any[]) => {
    setNotifications(newNotifications);
    // Le service de notifications gère déjà la sauvegarde
  };

  return [notifications, updateNotifications] as const;
};

// Hook spécifique pour le profil utilisateur
export const useUserProfile = () => {
  const defaultProfile = {
    firstName: 'Diallo',
    lastName: 'Kiron',
    email: 'diallo.kiron@email.com',
    phone: '+221 77 123 45 67',
    address: 'Dakar, Sénégal',
    birthDate: '1995-03-15',
    occupation: 'Développeur Web',
    monthlyIncome: '500000',
    memberSince: new Date().toISOString()
  };

  return useLocalStorage(STORAGE_KEYS.USER_PROFILE, defaultProfile);
}; 