import React, { useState } from 'react';
import { Settings as SettingsIcon, Bell, Shield, Palette, Globe, Download, Trash2 } from 'lucide-react';
import { useUserSettings } from '../hooks/useStorage';
import { STORAGE_KEYS, clearAllStorage, loadFromStorage, isStorageAvailable } from '../lib/storage';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const Settings: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'general' | 'notifications' | 'security' | 'appearance' | 'data'>('general');
  
  // Utiliser le hook pour les paramètres utilisateur
  const [settings, setSettings] = useUserSettings();
  const [dataMessage, setDataMessage] = useState<string | null>(null);
  const [dataError, setDataError] = useState<string | null>(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { user, signOut } = useAuth();

  const handleToggle = (section: string, key: string) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [key]: !prev[section as keyof typeof prev][key as keyof typeof prev[typeof section]]
      }
    }));
  };

  const handleSettingChange = (section: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [key]: value
      }
    }));
  };

  const handleExportData = () => {
    try {
      if (!isStorageAvailable()) {
        setDataError('Le stockage local n\'est pas disponible dans ce navigateur.');
        setDataMessage(null);
        return;
      }

      const exportPayload = {
        transactions: loadFromStorage(STORAGE_KEYS.TRANSACTIONS, []),
        savingsGoals: loadFromStorage(STORAGE_KEYS.SAVINGS_GOALS, []),
        challenges: loadFromStorage(STORAGE_KEYS.CHALLENGES, []),
        badges: loadFromStorage(STORAGE_KEYS.BADGES, []),
        myTontines: loadFromStorage(STORAGE_KEYS.MY_TONTINES, []),
        availableTontines: loadFromStorage(STORAGE_KEYS.AVAILABLE_TONTINES, []),
        userSettings: loadFromStorage(STORAGE_KEYS.USER_SETTINGS, settings),
        notifications: loadFromStorage(STORAGE_KEYS.NOTIFICATIONS, []),
        userProfile: loadFromStorage(STORAGE_KEYS.USER_PROFILE, null),
        exportedAt: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
        type: 'application/json;charset=utf-8',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `samabudget-data-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setDataMessage('Vos données ont été exportées dans un fichier JSON.');
      setDataError(null);
    } catch (error) {
      console.error('Erreur lors de l\'export des données:', error);
      setDataError('Une erreur est survenue lors de l\'export des données.');
      setDataMessage(null);
    }
  };

  const handleResetData = () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer toutes vos données locales ? Cette action est irréversible.')) {
      return;
    }

    try {
      if (!isStorageAvailable()) {
        setDataError('Le stockage local n\'est pas disponible dans ce navigateur.');
        setDataMessage(null);
        return;
      }

      clearAllStorage();
      setDataMessage('Toutes vos données locales ont été supprimées. L\'application repart sur une base vierge.');
      setDataError(null);

      // Optionnel : recharger la page pour repartir proprement
      window.location.reload();
    } catch (error) {
      console.error('Erreur lors de la réinitialisation des données:', error);
      setDataError('Une erreur est survenue lors de la suppression des données.');
      setDataMessage(null);
    }
  };

  const handleDeleteAccount = async () => {
    setDataError(null);
    setDataMessage(null);

    if (!user?.email) {
      setDataError('Utilisateur non authentifié.');
      return;
    }
    if (!deletePassword.trim()) {
      setDataError('Veuillez saisir votre mot de passe pour confirmer.');
      return;
    }
    if (deleteConfirmText.trim().toUpperCase() !== 'SUPPRIMER') {
      setDataError('Tapez "SUPPRIMER" pour confirmer la suppression du compte.');
      return;
    }

    const confirmed = window.confirm(
      'Cette action supprimera définitivement votre compte et vos données. Voulez-vous continuer ?'
    );
    if (!confirmed) return;

    setDeleteLoading(true);
    try {
      const { error: authErr } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: deletePassword,
      });
      if (authErr) {
        setDataError('Mot de passe incorrect. La suppression a été annulée.');
        return;
      }

      const { error: fnErr } = await supabase.functions.invoke('delete-account', {
        body: { confirm: true },
      });
      if (fnErr) throw fnErr;

      clearAllStorage();
      await signOut();
      window.location.href = '/';
    } catch (error) {
      setDataError(error instanceof Error ? error.message : 'Suppression impossible pour le moment.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const sections = [
    { id: 'general', label: 'Général', icon: SettingsIcon },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Sécurité', icon: Shield },
    { id: 'appearance', label: 'Apparence', icon: Palette },
    { id: 'data', label: 'Données', icon: Download },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 p-4 pb-24 dark:from-gray-900 dark:to-gray-800 sm:p-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 mb-8">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">Paramètres</h1>
          <p className="text-gray-600 dark:text-gray-400">Personnalisez votre expérience SamaBudget</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <nav className="space-y-1">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id as any)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-all duration-300 ${
                      activeSection === section.id
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{section.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            {/* General Settings */}
            {activeSection === 'general' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Paramètres Généraux</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Langue
                    </label>
                    <select
                      value={settings.language}
                      onChange={(e) => handleSettingChange('language', 'language', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="fr">Français</option>
                      <option value="en">English</option>
                      <option value="es">Español</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Devise
                    </label>
                    <select
                      value={settings.currency}
                      onChange={(e) => handleSettingChange('currency', 'currency', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="XOF">F CFA (XOF)</option>
                      <option value="EUR">Euro (EUR)</option>
                      <option value="USD">Dollar US (USD)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Settings */}
            {activeSection === 'notifications' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Paramètres de Notifications</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                        <Bell className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">Notifications par email</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Recevoir des alertes par email</div>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={settings.notifications.email}
                        onChange={() => handleToggle('notifications', 'email')}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                        <Bell className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">Notifications push</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Recevoir des alertes sur l'appareil</div>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={settings.notifications.push}
                        onChange={() => handleToggle('notifications', 'push')}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
                        <Bell className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">Alertes de budget</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Être averti quand le budget est dépassé</div>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={settings.notifications.budget}
                        onChange={() => handleToggle('notifications', 'budget')}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-900/10">
                    <div className="mb-3 flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-red-200 rounded-xl flex items-center justify-center">
                        <Trash2 className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <div className="font-medium text-red-900 dark:text-red-300">Zone dangereuse : supprimer mon compte</div>
                        <div className="text-sm text-red-700 dark:text-red-400">
                          Cette action efface définitivement votre compte, vos données et vos fichiers reçus.
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <input
                        type="password"
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        className="w-full rounded-lg border border-red-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-red-500"
                        placeholder="Retapez votre mot de passe"
                      />
                      <input
                        type="text"
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        className="w-full rounded-lg border border-red-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-red-500"
                        placeholder='Tapez "SUPPRIMER"'
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => void handleDeleteAccount()}
                      disabled={deleteLoading}
                      className="mt-3 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {deleteLoading ? 'Suppression en cours...' : 'Supprimer mon compte'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeSection === 'security' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Sécurité et Confidentialité</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                        <Shield className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">Authentification à deux facteurs</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Sécurisez votre compte avec 2FA</div>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={settings.security.twoFactor}
                        onChange={() => handleToggle('security', 'twoFactor')}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                        <Bell className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">Alertes de connexion</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Être notifié des nouvelles connexions</div>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={settings.security.loginAlerts}
                        onChange={() => handleToggle('security', 'loginAlerts')}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Timeout de session (minutes)
                    </label>
                    <select
                      value={settings.security.sessionTimeout}
                      onChange={(e) => handleSettingChange('security', 'sessionTimeout', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="15">15 minutes</option>
                      <option value="30">30 minutes</option>
                      <option value="60">1 heure</option>
                      <option value="120">2 heures</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Appearance Settings */}
            {activeSection === 'appearance' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Apparence</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Thème
                    </label>
                    <div className="flex justify-center">
                      <ThemeToggle />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
                      Choisissez entre le thème clair, sombre ou automatique selon vos préférences
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Couleur d'accent
                    </label>
                    <div className="grid grid-cols-6 gap-3">
                      {['blue', 'purple', 'green', 'red', 'orange', 'pink'].map((color) => (
                        <button
                          key={color}
                          onClick={() => handleSettingChange('accentColor', 'accentColor', color)}
                          className={`w-12 h-12 rounded-full border-2 transition-all ${
                            settings.accentColor === color 
                              ? 'border-gray-800 dark:border-white scale-110' 
                              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                          }`}
                          style={{ backgroundColor: getColorValue(color) }}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Taille de police
                    </label>
                    <select
                      value={settings.fontSize}
                      onChange={(e) => handleSettingChange('fontSize', 'fontSize', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="small">Petite</option>
                      <option value="normal">Normale</option>
                      <option value="large">Grande</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Data Settings */}
            {activeSection === 'data' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Gestion des Données</h2>
                
                <div className="space-y-4">
                  {dataError && (
                    <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                      {dataError}
                    </div>
                  )}
                  {dataMessage && (
                    <div className="rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-700">
                      {dataMessage}
                    </div>
                  )}
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                        <Download className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">Exporter mes données</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Télécharger toutes vos données en format JSON</div>
                      </div>
                    </div>
                    <button
                      onClick={handleExportData}
                      className="bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-4 py-2 rounded-xl text-sm font-medium hover:bg-green-200 dark:hover:bg-green-900/30 transition-colors"
                    >
                      Exporter
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-red-200 rounded-xl flex items-center justify-center">
                        <Trash2 className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">Supprimer toutes les données</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Cette action est irréversible</div>
                      </div>
                    </div>
                    <button
                      onClick={handleResetData}
                      className="bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-4 py-2 rounded-xl text-sm font-medium hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Fonction utilitaire pour obtenir la valeur de couleur
const getColorValue = (color: string): string => {
  const colors: { [key: string]: string } = {
    blue: '#3B82F6',
    purple: '#8B5CF6',
    green: '#10B981',
    red: '#EF4444',
    orange: '#F97316',
    pink: '#EC4899'
  };
  return colors[color] || '#3B82F6';
};

export default Settings;