import React, { useMemo } from 'react';
import { ArrowUpRight, ArrowDownRight, TrendingUp, Plus, Wallet, DollarSign, Target, Eye, Edit, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button } from './ui';
import { Page } from '../AppMain';
import { useAuth } from '../contexts/AuthContext';
import { displayNameFromEmail } from '../lib/displayName';
import { useTransactions, useSavingsGoals } from '../hooks/useStorage';

interface DashboardProps {
  onPageChange?: (page: Page) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onPageChange }) => {
  const { user } = useAuth();
  const greetingName = user ? displayNameFromEmail(user.email) : 'Utilisateur';
  // Utiliser les hooks de stockage pour récupérer les vraies données
  const [transactions] = useTransactions();
  const [savingsGoals] = useSavingsGoals();

  const { totalIncome, totalExpense, balance, savingsRate, recentTransactions } = useMemo(() => {
    const totalIncome = transactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const balance = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? Math.round((balance / totalIncome) * 100) : 0;
    const recentTransactions = [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
    return { totalIncome, totalExpense, balance, savingsRate, recentTransactions };
  }, [transactions]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 min-h-screen">
      {/* Header */}
      <div className="mb-8 bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center mb-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">Bonjour, {greetingName}</h1>
          <span className="ml-2 text-2xl">👋</span>
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-lg">Voici un aperçu de vos finances aujourd'hui</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Solde Actuel</h3>
              <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-xl flex items-center justify-center">
                <Wallet className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{balance.toLocaleString()} F CFA</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-2 flex items-center">
              <Eye className="w-4 h-4 mr-1" />
              Dernière mise à jour: maintenant
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Revenus</h3>
              <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                <ArrowUpRight className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-green-600">{totalIncome.toLocaleString()} F CFA</div>
            <div className="text-sm text-green-600 mt-2 flex items-center">
              <TrendingUp className="w-4 h-4 mr-1" />
              {transactions.length > 0 ? `${transactions.filter(t => t.type === 'income').length} transactions` : 'Aucune transaction'}
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Dépenses</h3>
              <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-red-200 rounded-xl flex items-center justify-center">
                <ArrowDownRight className="w-5 h-5 text-red-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-red-600">{totalExpense.toLocaleString()} F CFA</div>
            <div className="text-sm text-red-600 mt-2 flex items-center">
              <Target className="w-4 h-4 mr-1" />
              {transactions.length > 0 ? `${transactions.filter(t => t.type === 'expense').length} transactions` : 'Aucune transaction'}
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Épargne</h3>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-blue-600">{savingsRate}%</div>
            <div className="text-sm text-blue-600 mt-2 flex items-center">
              <DollarSign className="w-4 h-4 mr-1" />
              Taux d'épargne mensuel
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Progress */}
      <Card className="mb-8 hover:shadow-xl transition-all duration-300">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Progression du Budget Mensuel</CardTitle>
            <Button variant="ghost" size="sm">
              Modifier
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>Utilisé: {totalExpense.toLocaleString()} F CFA</span>
            <span>Budget: {totalIncome > 0 ? totalIncome.toLocaleString() : '0'} F CFA</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-gray-800 to-gray-900 h-4 rounded-full transition-all duration-1000 ease-out" 
              style={{ width: `${totalIncome > 0 ? Math.min((totalExpense / totalIncome) * 100, 100) : 0}%` }}
            ></div>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mt-2">
            <span>{totalIncome > 0 ? Math.min((totalExpense / totalIncome) * 100, 100).toFixed(1) : 0}% utilisé</span>
            <span>Reste: {Math.max(totalIncome - totalExpense, 0).toLocaleString()} F CFA</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Transactions */}
        <Card className="hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Transactions Récentes</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => onPageChange?.('transactions')}>
                Voir tout
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentTransactions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">Aucune transaction récente</p>
              </div>
            ) : (
              recentTransactions.map((transaction, index) => (
                <div key={transaction.id} className="group flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 hover:shadow-md">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-12 rounded-full ${transaction.type === 'income' ? 'bg-gradient-to-b from-green-400 to-green-600' : 'bg-gradient-to-b from-red-400 to-red-600'}`}></div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{transaction.category}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{transaction.date}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className={`font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type === 'income' ? '+' : '-'}{transaction.amount.toLocaleString()} F CFA
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                      <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Savings Goals */}
        <Card className="hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Objectifs d'Épargne</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => onPageChange?.('savings')}>
                Voir tout
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {savingsGoals.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">Aucun objectif d'épargne</p>
              </div>
            ) : (
              savingsGoals.map((goal, index) => (
                <div key={index} className="group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900 dark:text-white">{goal.name}</span>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                        <button className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors">
                          <Edit className="w-3 h-3" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{goal.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-gray-800 to-gray-900 h-3 rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: `${goal.percentage}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <span>{goal.current.toLocaleString()} F CFA</span>
                    <span>{goal.target.toLocaleString()} F CFA</span>
                  </div>
                </div>
              ))
            )}
            <Button variant="outline" className="w-full" icon={Plus} onClick={() => onPageChange?.('savings')}>
              Ajouter un objectif
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Actions Rapides</h3>
        <div className="flex flex-wrap gap-4">
          <Button 
            variant="secondary" 
            size="lg" 
            icon={Plus}
            onClick={() => onPageChange?.('transactions')}
          >
            Nouvelle Transaction
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            icon={Plus}
            onClick={() => onPageChange?.('savings')}
          >
            Nouvel Objectif
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => onPageChange?.('stats')}
          >
            Voir Statistiques
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => onPageChange?.('challenges')}
          >
            Mes Défis
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;