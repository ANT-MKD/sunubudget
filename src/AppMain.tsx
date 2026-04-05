import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
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

export type Page =
  | 'dashboard'
  | 'transactions'
  | 'savings'
  | 'challenges'
  | 'help'
  | 'profile'
  | 'stats'
  | 'tontine'
  | 'notifications'
  | 'settings';

export function AppMain() {
  const { logout } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
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

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="fixed left-4 top-4 z-50 lg:hidden">
        <button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="rounded-lg border border-gray-200 bg-white p-2 shadow-lg dark:border-gray-700 dark:bg-gray-800"
        >
          {sidebarOpen ? (
            <X className="h-6 w-6 text-gray-600 dark:text-gray-300" />
          ) : (
            <Menu className="h-6 w-6 text-gray-600 dark:text-gray-300" />
          )}
        </button>
      </div>

      <Sidebar
        currentPage={currentPage}
        onPageChange={(page) => {
          setCurrentPage(page);
          setSidebarOpen(false);
        }}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
      />

      <main className="min-h-screen flex-1 transition-all duration-300 lg:ml-64">{renderPage()}</main>

      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          aria-label="Fermer le menu"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
