import React, { useState } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastContainer } from './components/ui/feedback/Toast';
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
import { Menu, X } from 'lucide-react';

export type Page = 'dashboard' | 'transactions' | 'savings' | 'challenges' | 'help' | 'profile' | 'stats' | 'tontine' | 'notifications' | 'settings';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    <ThemeProvider>
      <ToastContainer>
        <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
          {/* Mobile menu button */}
          <div className="lg:hidden fixed top-4 left-4 z-50">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
            >
              {sidebarOpen ? (
                <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              ) : (
                <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              )}
            </button>
          </div>

          {/* Sidebar */}
          <Sidebar 
            currentPage={currentPage} 
            onPageChange={(page) => {
              setCurrentPage(page);
              setSidebarOpen(false); // Close sidebar on mobile when page changes
            }}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
          
          {/* Main content */}
          <main className="flex-1 lg:ml-64 transition-all duration-300">
            {renderPage()}
          </main>

          {/* Mobile overlay */}
          {sidebarOpen && (
            <div 
              className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </div>
      </ToastContainer>
    </ThemeProvider>
  );
}

export default App;