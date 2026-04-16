// Utilitaires pour gérer le localStorage de manière centralisée

import type { UserProfileData } from '../types';

// Clés de stockage
export const STORAGE_KEYS = {
  TRANSACTIONS: 'transactions',
  SAVINGS_GOALS: 'savingsGoals',
  CHALLENGES: 'challenges',
  BADGES: 'badges',
  MY_TONTINES: 'myTontines',
  AVAILABLE_TONTINES: 'availableTontines',
  USER_SETTINGS: 'userSettings',
  NOTIFICATIONS: 'notifications',
  USER_PROFILE: 'userProfile',
} as const;

// Fonction générique pour sauvegarder des données
export const saveToStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Erreur lors de la sauvegarde de ${key}:`, error);
  }
};

// Fonction générique pour charger des données
export const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const savedData = localStorage.getItem(key);
    if (savedData) {
      return JSON.parse(savedData);
    }
  } catch (error) {
    console.error(`Erreur lors du chargement de ${key}:`, error);
  }
  return defaultValue;
};

/** Valeurs par défaut pour le stockage local (hors Supabase) — aucune donnée fictive. */
export const DEFAULT_USER_PROFILE: UserProfileData = {
  firstName: '',
  lastName: '',
  email: '',
  emailConfirmedAt: null,
  phone: '',
  address: '',
  birthDate: '',
  occupation: '',
  monthlyIncome: '',
  memberSince: new Date().toISOString(),
  avatarUrl: '',
};

/** Fusionne des champs dans le profil stocké (ignore les clés `undefined`). */
export function mergeUserProfile(partial: Partial<UserProfileData>): void {
  const current = loadFromStorage(STORAGE_KEYS.USER_PROFILE, DEFAULT_USER_PROFILE);
  const base: UserProfileData = { ...DEFAULT_USER_PROFILE, ...current };
  const next: UserProfileData = { ...base };
  (Object.entries(partial) as [keyof UserProfileData, UserProfileData[keyof UserProfileData]][]).forEach(
    ([key, value]) => {
      if (value !== undefined) {
        (next as Record<string, unknown>)[key] = value;
      }
    }
  );
  saveToStorage(STORAGE_KEYS.USER_PROFILE, next);
}

// Fonction pour supprimer des données
export const removeFromStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Erreur lors de la suppression de ${key}:`, error);
  }
};

// Fonction pour vider tout le localStorage
export const clearAllStorage = (): void => {
  try {
    localStorage.clear();
  } catch (error) {
    console.error('Erreur lors du nettoyage du localStorage:', error);
  }
};

// Fonction pour obtenir la taille du localStorage
export const getStorageSize = (): number => {
  try {
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length;
      }
    }
    return total;
  } catch (error) {
    console.error('Erreur lors du calcul de la taille du localStorage:', error);
    return 0;
  }
};

// Fonction pour vérifier si le localStorage est disponible
export const isStorageAvailable = (): boolean => {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (error) {
    return false;
  }
}; 