import React, { useState } from 'react';
import { BarChart3, CreditCard, PiggyBank, PlusCircle, Users, X } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Savings from './components/Savings';
import Statistics from './components/Statistics';
import Challenges from './components/Challenges';
import Profile from './components/Profile';
import Tontine from './components/Tontine';
import Notifications from './components/Notifications';
import Settings from './components/Settings';
import HelpCenter from './components/HelpCenter';
import Budget from './components/Budget';

export type Page =
  | 'dashboard'
  | 'transactions'
  | 'savings'
  | 'challenges'
  | 'help'
  | 'profile'
  | 'stats'
  | 'tontine'
  | 'budget'
  | 'notifications'
  | 'settings';

export function AppMain() {
  const { signOut } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [moreOpen, setMoreOpen] = useState(false);

  const handleLogout = () => {
    void signOut();
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onPageChange={setCurrentPage} />;
      case 'transactions':
        return <Transactions />;
      case 'savings':
        return <Savings />;
      case 'stats':
        return <Statistics />;
      case 'challenges':
        return <Challenges />;
      case 'profile':
        return <Profile />;
      case 'tontine':
        return <Tontine />;
      case 'budget':
        return <Budget />;
      case 'notifications':
        return <Notifications />;
      case 'settings':
        return <Settings />;
      case 'help':
        return <HelpCenter />;
      default:
        return <Dashboard onPageChange={setCurrentPage} />;
    }
  };

  const mobileNavItems: Array<{ id: Page; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'dashboard', label: 'Accueil', icon: BarChart3 },
    { id: 'transactions', label: 'Transactions', icon: CreditCard },
    { id: 'savings', label: 'Epargne', icon: PiggyBank },
    { id: 'tontine', label: 'Tontines', icon: Users },
  ];

  const mobileMoreItems: Array<{ id: Page; label: string }> = [
    { id: 'profile', label: 'Profil' },
    { id: 'stats', label: 'Statistiques' },
    { id: 'challenges', label: 'Défis' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'settings', label: 'Paramètres' },
    { id: 'help', label: 'Aide' },
    { id: 'budget', label: 'Budgets' },
  ];

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Sidebar
        currentPage={currentPage}
        onPageChange={(page) => {
          setCurrentPage(page);
        }}
        isOpen={false}
        onLogout={handleLogout}
      />

      <main className="min-h-screen flex-1 transition-all duration-300 lg:ml-64">{renderPage()}</main>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white/95 px-2 py-2 backdrop-blur dark:border-gray-700 dark:bg-gray-900/95 lg:hidden">
        <ul className="grid grid-cols-5 gap-1">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            const active = currentPage === item.id;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setCurrentPage(item.id)}
                  className={`flex w-full flex-col items-center justify-center rounded-xl px-1 py-2 text-[11px] font-medium ${
                    active
                      ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                      : 'text-gray-600 dark:text-gray-300'
                  }`}
                >
                  <Icon className="mb-1 h-4 w-4" />
                  {item.label}
                </button>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              className="flex w-full flex-col items-center justify-center rounded-xl px-1 py-2 text-[11px] font-medium text-gray-600 dark:text-gray-300"
            >
              <PlusCircle className="mb-1 h-4 w-4" />
              Plus
            </button>
          </li>
        </ul>
      </nav>

      {moreOpen && (
        <div className="fixed inset-0 z-[60] bg-black/40 lg:hidden">
          <div className="absolute inset-x-0 bottom-0 rounded-t-2xl bg-white p-4 dark:bg-gray-900">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Autres pages</h3>
              <button type="button" onClick={() => setMoreOpen(false)} className="rounded-lg p-2 text-gray-500">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {mobileMoreItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setCurrentPage(item.id);
                    setMoreOpen(false);
                  }}
                  className={`rounded-xl border px-3 py-3 text-left text-sm ${
                    currentPage === item.id
                      ? 'border-gray-900 bg-gray-900 text-white dark:border-white dark:bg-white dark:text-gray-900'
                      : 'border-gray-200 text-gray-700 dark:border-gray-700 dark:text-gray-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  handleLogout();
                  setMoreOpen(false);
                }}
                className="col-span-2 rounded-xl border border-red-200 px-3 py-3 text-left text-sm font-medium text-red-600"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
