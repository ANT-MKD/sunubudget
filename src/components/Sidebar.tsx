import React, { useState } from 'react';
import { 
  BarChart3, 
  CircleDollarSign,
  CreditCard, 
  PiggyBank, 
  TrendingUp, 
  Trophy, 
  User, 
  Users, 
  Bell, 
  Settings, 
  HelpCircle, 
  LogOut 
} from 'lucide-react';
import { Page } from '../AppMain';
import { useTransactions, useChallenges, useBadges, useNotificationCounts } from '../hooks/useStorage';
interface SidebarProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
  isOpen?: boolean;
  onClose?: () => void;
  onLogout?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onPageChange, isOpen = false, onClose, onLogout }) => {
  // Utiliser les hooks pour récupérer les vraies données
  const { transactions } = useTransactions();
  const { challenges } = useChallenges();
  const { badges } = useBadges();
  const { unread: unreadNotificationsCount, important: importantNotificationsCount } = useNotificationCounts();

  // Calculer les compteurs dynamiques
  const transactionsCount = transactions.length;
  const activeChallengesCount = challenges.filter((c) => c.status === 'active').length;

  const menuItems = [
    { id: 'dashboard', label: 'Tableau de Bord', icon: BarChart3, badge: null },
    { id: 'transactions', label: 'Transactions', icon: CreditCard, badge: transactionsCount > 0 ? transactionsCount.toString() : null },
    { id: 'savings', label: 'Épargne', icon: PiggyBank, badge: null },
    { id: 'stats', label: 'Statistiques', icon: TrendingUp, badge: null },
    { id: 'challenges', label: 'Défis', icon: Trophy, badge: activeChallengesCount > 0 ? activeChallengesCount.toString() : null },
    { id: 'profile', label: 'Profil', icon: User, badge: null },
    { id: 'tontine', label: 'Tontine', icon: Users, badge: null },
    { id: 'budget', label: 'Budgets', icon: CircleDollarSign, badge: null },
  ];

  const bottomItems = [
    { 
      id: 'notifications', 
      label: 'Notifications', 
      icon: Bell, 
      badge: unreadNotificationsCount > 0 ? unreadNotificationsCount.toString() : null,
      importantBadge: importantNotificationsCount > 0 ? importantNotificationsCount.toString() : null
    },
    { id: 'settings', label: 'Paramètres', icon: Settings, badge: null, importantBadge: null },
    { id: 'help', label: 'Aide', icon: HelpCircle, badge: null, importantBadge: null },
  ];

  return (
    <div className={`fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-700 flex flex-col shadow-xl z-50 transition-transform duration-300 lg:translate-x-0 ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    }`}>
      {/* Logo */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <span className="font-bold text-xl bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">SamaBudget</span>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onPageChange(item.id as Page)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all duration-300 ${
                    currentPage === item.id
                      ? 'bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-lg'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:translate-x-1'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                      currentPage === item.id 
                        ? 'bg-white text-gray-900' 
                        : 'bg-blue-100 text-blue-600'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Navigation */}
      <div className="px-4 py-4 border-t border-gray-100 dark:border-gray-700">
        <ul className="space-y-2">
          {bottomItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onPageChange(item.id as Page)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all duration-300 ${
                    currentPage === item.id
                      ? 'bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-lg'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:translate-x-1'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {item.importantBadge && (
                      <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                        currentPage === item.id 
                          ? 'bg-white text-yellow-600' 
                          : 'bg-yellow-100 text-yellow-600'
                      }`}>
                        {item.importantBadge}
                      </span>
                    )}
                    {item.badge && (
                      <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                        currentPage === item.id 
                          ? 'bg-white text-gray-900' 
                          : 'bg-red-100 text-red-600'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>

        {/* Logout */}
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <button
            type="button"
            onClick={() => onLogout?.()}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300 hover:translate-x-1"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Déconnexion</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;