import React, { useState } from 'react';
import { Plus, Search, ArrowUpRight, ArrowDownRight, Edit, Trash2, Download, DollarSign, ChevronLeft, ChevronRight, Trash, Paperclip } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Select, Modal, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge } from './ui';
import { useTransactions } from '../hooks/useStorage';
import { notificationService } from '../lib/notificationService';
import { useAuth } from '../contexts/AuthContext';
import { createReceiptSignedUrl, uploadReceipt } from '../lib/receiptUpload';
import type { Transaction } from '../types';

const Transactions: React.FC = () => {
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit' | 'details'>('create');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [formError, setFormError] = useState<string | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [receiptSignedUrl, setReceiptSignedUrl] = useState<string | null>(null);
  const { user } = useAuth();

  const { transactions, addTransaction, updateTransaction, deleteTransaction: removeTransaction, clearAllTransactions } =
    useTransactions();

  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense',
    category: '',
    description: '',
    date: '',
    amount: '',
    status: 'completed' as 'completed' | 'pending'
  });

  const expenseCategories = [
    'Alimentation', 'Logement', 'Transport', 'Santé', 'Loisirs', 'Vêtements', 
    'Éducation', 'Technologie', 'Assurance', 'Impôts', 'Cadeaux', 'Voyage'
  ];

  const incomeCategories = [
    'Salaire', 'Freelance', 'Investissement', 'Vente', 'Prime', 'Allocation', 
    'Pension', 'Loyer perçu', 'Dividendes', 'Intérêts', 'Bonus', 'Autre revenu'
  ];

  const filteredTransactions = transactions.filter(transaction => {
    const matchesType = filterType === 'all' || transaction.type === filterType;
    const matchesSearch = transaction.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleReceiptFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    e.target.value = '';
    setReceiptFile(file);
    if (!file) {
      setReceiptPreview(null);
      return;
    }
    setReceiptPreview(URL.createObjectURL(file));
  };

  const openModal = (type: 'create' | 'edit' | 'details', transaction?: Transaction) => {
    setModalType(type);
    setSelectedTransaction(transaction || null);
    setFormError(null);
    setReceiptFile(null);
    setReceiptPreview(null);
    setReceiptSignedUrl(null);
    if (type === 'edit' && transaction) {
      setFormData({
        type: transaction.type,
        category: transaction.category,
        description: transaction.description,
        date: transaction.date,
        amount: transaction.amount.toString(),
        status: transaction.status
      });
      if (transaction.receiptUrl) {
        void (async () => {
          const signedUrl = await createReceiptSignedUrl(transaction.receiptUrl as string);
          setReceiptSignedUrl(signedUrl);
        })();
      }
    } else if (type === 'create') {
      setFormData({
        type: 'expense',
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        amount: '',
        status: 'completed'
      });
    } else if (type === 'details' && transaction?.receiptUrl) {
      void (async () => {
        const signedUrl = await createReceiptSignedUrl(transaction.receiptUrl as string);
        setReceiptSignedUrl(signedUrl);
      })();
    }
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountValue = Number(formData.amount);
    const desc = formData.description.trim();

    if (!formData.category.trim()) {
      setFormError('Veuillez choisir une catégorie.');
      return;
    }

    if (desc.length < 2) {
      setFormError('La description doit contenir au moins 2 caractères.');
      return;
    }

    if (!formData.date || Number.isNaN(Date.parse(formData.date))) {
      setFormError('Date invalide.');
      return;
    }

    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      setFormError('Veuillez saisir un montant valide strictement supérieur à 0.');
      return;
    }

    void (async () => {
      try {
        let receiptUrl: string | null | undefined = undefined;
        if (receiptFile) {
          if (!user?.id) throw new Error('Utilisateur non authentifié.');
          receiptUrl = await uploadReceipt(user.id, receiptFile);
        }

        if (modalType === 'create') {
          await addTransaction({
            type: formData.type,
            category: formData.category.trim(),
            description: desc,
            date: formData.date,
            amount: amountValue,
            status: formData.status,
            receiptUrl: receiptUrl ?? null,
          });
          await notificationService.createTransactionNotification({
            type: formData.type,
            amount: amountValue,
            category: formData.category,
          });
          if (formData.type === 'expense') {
            await notificationService.checkAndNotifyBudgetThreshold(formData.category.trim());
          }
        } else if (modalType === 'edit' && selectedTransaction) {
          await updateTransaction(selectedTransaction.id, {
            type: formData.type,
            category: formData.category.trim(),
            description: desc,
            date: formData.date,
            amount: amountValue,
            status: formData.status,
            ...(receiptUrl !== undefined
              ? { receiptUrl }
              : selectedTransaction.receiptUrl !== undefined
                ? { receiptUrl: selectedTransaction.receiptUrl }
                : {}),
          });
          await notificationService.createSystemNotification(
            'Transaction modifiée',
            `${formData.type === 'income' ? 'Revenu' : 'Dépense'} modifié : ${formData.amount} F CFA pour ${formData.category}`,
            'success'
          );
          if (formData.type === 'expense') {
            await notificationService.checkAndNotifyBudgetThreshold(formData.category.trim());
          }
        }
        setFormError(null);
        setShowModal(false);
        setReceiptFile(null);
        setReceiptPreview(null);
      } catch (err) {
        setFormError(err instanceof Error ? err.message : 'Enregistrement impossible.');
      }
    })();
  };

  const deleteTransaction = (id: number) => {
    const transactionToDelete = transactions.find((t) => t.id === id);
    void (async () => {
      try {
        await removeTransaction(id);
        if (transactionToDelete) {
          await notificationService.createSystemNotification(
            'Transaction supprimée',
            `${transactionToDelete.type === 'income' ? 'Revenu' : 'Dépense'} de ${transactionToDelete.amount.toLocaleString()} F CFA supprimé`,
            'info'
          );
        }
      } catch (err) {
        setFormError(err instanceof Error ? err.message : 'Suppression impossible.');
      }
    })();
  };

  const clearAllTransactionsLocal = () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer toutes les transactions ? Cette action est irréversible.')) {
      void (async () => {
        try {
          const transactionCount = transactions.length;
          await clearAllTransactions();
          await notificationService.createSystemNotification(
            'Toutes les transactions supprimées',
            `${transactionCount} transaction${transactionCount > 1 ? 's' : ''} supprimée${transactionCount > 1 ? 's' : ''}`,
            'warning'
          );
        } catch (err) {
          setFormError(err instanceof Error ? err.message : 'Suppression impossible.');
        }
      })();
    }
  };

  const exportTransactionsToCSV = () => {
    if (!filteredTransactions.length) {
      return;
    }

    const headers = ['Date', 'Type', 'Catégorie', 'Description', 'Montant (F CFA)', 'Statut'];

    const rows = filteredTransactions.map((t) => [
      t.date,
      t.type === 'income' ? 'Revenu' : 'Dépense',
      t.category,
      t.description,
      t.amount, // colonne numérique pour Excel
      t.status === 'completed' ? 'Terminé' : 'En attente',
    ]);

    const escapeCell = (value: string | number) =>
      `"${String(value).replace(/"/g, '""')}"`;

    const csvBody = [
      headers.map(escapeCell).join(';'),
      ...rows.map((row) => row.map(escapeCell).join(';')),
    ].join('\n');

    // Ajout d'un BOM UTF-8 pour une meilleure compatibilité avec Excel (accents)
    const csvContentWithBom = '\uFEFF' + csvBody;

    const blob = new Blob([csvContentWithBom], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transactions-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportTransactionsToPrint = () => {
    if (!transactions.length) {
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const rowsHtml = transactions
      .map((t) => {
        const typeLabel = t.type === 'income' ? 'Revenu' : 'Dépense';
        const statusLabel = t.status === 'completed' ? 'Terminé' : 'En attente';
        const amountLabel = (t.type === 'income' ? '+' : '-') + t.amount.toLocaleString() + ' F CFA';
        const amountClass = t.type === 'income' ? 'amount-income' : 'amount-expense';

        return `
        <tr>
          <td>${t.date}</td>
          <td>${typeLabel}</td>
          <td>${t.category}</td>
          <td>${t.description}</td>
          <td class="${amountClass}">${amountLabel}</td>
          <td>${statusLabel}</td>
        </tr>`;
      })
      .join('');

    const today = new Date();
    const formattedDate = today.toLocaleDateString('fr-FR');
    const formattedTime = today.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    printWindow.document.write(`<!DOCTYPE html>
      <html lang="fr">
        <head>
          <meta charSet="UTF-8" />
          <title>Relevé des transactions - SamaBudget</title>
          <style>
            * { box-sizing: border-box; }
            body {
              font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              padding: 24px;
              background: #f3f4f6;
              color: #111827;
            }
            .invoice {
              max-width: 900px;
              margin: 0 auto;
              background: #ffffff;
              border-radius: 16px;
              box-shadow: 0 10px 25px rgba(15,23,42,0.12);
              overflow: hidden;
              border: 1px solid #e5e7eb;
            }
            .invoice-header {
              padding: 20px 24px;
              background: linear-gradient(to right, #1f2937, #111827);
              color: #f9fafb;
              display: flex;
              align-items: center;
              justify-content: space-between;
            }
            .brand {
              font-size: 18px;
              font-weight: 700;
              letter-spacing: 0.08em;
              text-transform: uppercase;
            }
            .brand span {
              color: #38bdf8;
            }
            .invoice-meta {
              text-align: right;
              font-size: 12px;
            }
            .invoice-meta-title {
              font-size: 16px;
              font-weight: 600;
              margin-bottom: 4px;
            }
            .invoice-body {
              padding: 20px 24px 24px;
            }
            .summary {
              display: flex;
              gap: 16px;
              margin-bottom: 20px;
            }
            .summary-card {
              flex: 1;
              border-radius: 12px;
              padding: 12px 14px;
              font-size: 12px;
            }
            .summary-card h3 {
              margin: 0 0 4px;
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 0.08em;
            }
            .summary-value {
              font-size: 16px;
              font-weight: 700;
            }
            .summary-income {
              background: linear-gradient(to right, #ecfdf5, #d1fae5);
              color: #166534;
            }
            .summary-expense {
              background: linear-gradient(to right, #fef2f2, #fee2e2);
              color: #b91c1c;
            }
            .summary-balance {
              background: linear-gradient(to right, #eff6ff, #dbeafe);
              color: #1d4ed8;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 8px;
            }
            th, td {
              padding: 8px 10px;
              font-size: 11px;
            }
            thead th {
              background: #111827;
              color: #f9fafb;
              text-align: left;
            }
            tbody tr:nth-child(even) {
              background: #f9fafb;
            }
            tbody tr:nth-child(odd) {
              background: #ffffff;
            }
            td.amount-income {
              text-align: right;
              color: #15803d;
              font-weight: 600;
            }
            td.amount-expense {
              text-align: right;
              color: #b91c1c;
              font-weight: 600;
            }
            tfoot td {
              font-size: 11px;
              padding-top: 12px;
              color: #6b7280;
            }
            .footer {
              margin-top: 16px;
              font-size: 10px;
              color: #9ca3af;
              text-align: right;
            }
          </style>
        </head>
        <body>
          <div class="invoice">
            <div class="invoice-header">
              <div>
                <div class="brand"><span>Sama</span>Budget</div>
                <div style="font-size: 11px; opacity: 0.9;">Relevé détaillé des transactions</div>
              </div>
              <div class="invoice-meta">
                <div class="invoice-meta-title">Relevé de compte</div>
                <div>Généré le ${formattedDate} à ${formattedTime}</div>
                <div>Total transactions: ${transactions.length}</div>
              </div>
            </div>
            <div class="invoice-body">
              <div class="summary">
                <div class="summary-card summary-income">
                  <h3>Revenus</h3>
                  <div class="summary-value">${totalIncome.toLocaleString()} F CFA</div>
                </div>
                <div class="summary-card summary-expense">
                  <h3>Dépenses</h3>
                  <div class="summary-value">${totalExpense.toLocaleString()} F CFA</div>
                </div>
                <div class="summary-card summary-balance">
                  <h3>Solde net</h3>
                  <div class="summary-value">${balance.toLocaleString()} F CFA</div>
                </div>
              </div>

              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Catégorie</th>
                    <th>Description</th>
                    <th>Montant (F CFA)</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  ${rowsHtml}
                </tbody>
              </table>

              <div class="footer">
                Document généré automatiquement par SamaBudget pour un usage personnel et comptable.
              </div>
            </div>
          </div>
        </body>
      </html>`);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-white to-gray-50 p-4 pb-24 dark:from-gray-900 dark:to-gray-800 sm:p-6">
      {/* Header */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-2xl bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Transactions
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Gérez toutes vos transactions financières</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {transactions.length > 0 && (
                <Button 
                  variant="outline"
                  onClick={clearAllTransactionsLocal}
                  icon={Trash}
                  className="text-red-600 hover:text-red-700"
                >
                  Vider tout
                </Button>
              )}
              <Button 
                variant="primary"
                onClick={() => openModal('create')}
                icon={Plus}
              >
                Nouvelle Transaction
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">Total Revenus</h3>
              <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center shadow-lg">
                <ArrowUpRight className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-green-600 mb-1">{totalIncome.toLocaleString()} F CFA</div>
            <div className="text-sm text-green-600">+0% ce mois</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">Total Dépenses</h3>
              <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-red-200 rounded-xl flex items-center justify-center shadow-lg">
                <ArrowDownRight className="w-5 h-5 text-red-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-red-600 mb-1">{totalExpense.toLocaleString()} F CFA</div>
            <div className="text-sm text-red-600">+0% ce mois</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">Solde Net</h3>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center shadow-lg">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className={`text-2xl font-bold ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              {balance.toLocaleString()} F CFA
            </div>
            <div className="text-sm text-blue-600">Différence mensuelle</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Rechercher une transaction..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={Search}
              />
            </div>
          
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filterType === 'all' ? 'secondary' : 'ghost'}
                onClick={() => setFilterType('all')}
              >
                Toutes
              </Button>
              <Button
                variant={filterType === 'income' ? 'success' : 'ghost'}
                onClick={() => setFilterType('income')}
              >
                Revenus
              </Button>
              <Button
                variant={filterType === 'expense' ? 'danger' : 'ghost'}
                onClick={() => setFilterType('expense')}
              >
                Dépenses
              </Button>
            </div>
          
            <div className="flex flex-wrap gap-2">
              <Button variant="ghost" icon={Download} onClick={exportTransactionsToCSV}>
                Excel (CSV)
              </Button>
              <Button variant="ghost" onClick={exportTransactionsToPrint}>
                PDF (Impression)
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Historique des Transactions ({filteredTransactions.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
        
          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune transaction</h3>
              <p className="text-gray-600 mb-6">Commencez par ajouter votre première transaction</p>
              <Button 
                variant="primary"
                onClick={() => openModal('create')}
                icon={Plus}
              >
                Ajouter une transaction
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-3 p-4 md:hidden">
                {paginatedTransactions.map((transaction) => (
                  <div key={transaction.id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-gray-900 dark:text-white">{transaction.description}</p>
                        <p className="text-sm text-gray-500">{transaction.category}</p>
                      </div>
                      <Badge variant={transaction.status === 'completed' ? 'success' : 'warning'} size="sm">
                        {transaction.status === 'completed' ? 'Terminé' : 'En attente'}
                      </Badge>
                    </div>
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs text-gray-500">{transaction.date}</span>
                      <span className={`text-base font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.type === 'income' ? '+' : '-'}{transaction.amount.toLocaleString()} F CFA
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openModal('details', transaction)} className="flex-1">
                        Détails
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openModal('edit', transaction)} icon={Edit} />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteTransaction(transaction.id)}
                        icon={Trash2}
                        className="text-red-600"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Reçu</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                            transaction.type === 'income' 
                              ? 'bg-gradient-to-br from-green-100 to-green-200' 
                              : 'bg-gradient-to-br from-red-100 to-red-200'
                          }`}>
                            {transaction.type === 'income' ? (
                              <ArrowUpRight className="w-3 h-3 text-green-600" />
                            ) : (
                              <ArrowDownRight className="w-3 h-3 text-red-600" />
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-gray-900 text-sm">{transaction.category}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-gray-900 text-sm">{transaction.description}</div>
                      </TableCell>
                      <TableCell className="text-gray-500 text-sm">
                        {transaction.date}
                      </TableCell>
                      <TableCell>
                        <div className={`font-bold text-sm ${
                          transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'income' ? '+' : '-'}{transaction.amount.toLocaleString()} F CFA
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={transaction.status === 'completed' ? 'success' : 'warning'}
                          size="sm"
                        >
                          {transaction.status === 'completed' ? 'Terminé' : 'En attente'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {transaction.receiptUrl ? <Paperclip className="h-4 w-4 text-emerald-600" /> : <span className="text-xs text-gray-400">—</span>}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openModal('details', transaction)}
                            icon={Search}
                            className="p-1"
                          >
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openModal('edit', transaction)}
                            icon={Edit}
                            className="p-1"
                          >
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteTransaction(transaction.id)}
                            icon={Trash2}
                            className="p-1 text-red-600"
                          >
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Affichage de {startIndex + 1} à {Math.min(startIndex + itemsPerPage, filteredTransactions.length)} sur {filteredTransactions.length} transactions
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === page
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Modal */}
      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={
            modalType === 'create' ? 'Nouvelle Transaction' :
            modalType === 'edit' ? 'Modifier la Transaction' :
            'Détails de la Transaction'
          }
          size="lg"
        >

              {(modalType === 'create' || modalType === 'edit') && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {formError && (
                    <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                      {formError}
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Select
                        label="Type"
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        options={[
                          { value: 'expense', label: 'Dépense' },
                          { value: 'income', label: 'Revenu' }
                        ]}
                      />
                    </div>

                    <div>
                      <Select
                        label="Catégorie"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        placeholder="Sélectionner une catégorie"
                        options={[
                          { value: '', label: 'Sélectionner une catégorie' },
                          ...(formData.type === 'expense' ? expenseCategories : incomeCategories).map(cat => ({
                            value: cat,
                            label: cat
                          }))
                        ]}
                      />
                    </div>
                  </div>

                  <div>
                    <Input
                      label="Description"
                      type="text"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Ex: Courses au supermarché"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Input
                        label="Date"
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div>
                      <Input
                        label="Montant (F CFA)"
                        type="number"
                        name="amount"
                        inputMode="numeric"
                        value={formData.amount}
                        onChange={handleInputChange}
                        placeholder="15000"
                        required
                        min="1"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Reçu (optionnel)</label>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleReceiptFile}
                      className="block w-full rounded-xl border border-gray-200 p-3 text-sm dark:border-gray-600 dark:bg-gray-800"
                    />
                    {(receiptPreview || selectedTransaction?.receiptUrl) && (
                      <p className="mt-2 text-xs text-gray-500">
                        {receiptFile ? 'Nouveau reçu prêt pour upload.' : 'Un reçu est déjà associé à cette transaction.'}
                      </p>
                    )}
                  </div>

                  <div>
                    <Select
                      label="Statut"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      options={[
                        { value: 'completed', label: 'Terminé' },
                        { value: 'pending', label: 'En attente' }
                      ]}
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowModal(false)}
                    >
                      Annuler
                    </Button>
                    <Button
                      variant="primary"
                      type="submit"
                    >
                      {modalType === 'create' ? 'Créer' : 'Modifier'}
                    </Button>
                  </div>
                </form>
              )}

              {modalType === 'details' && selectedTransaction && (
                <div className="space-y-4">
                  <div className={`rounded-xl p-4 ${
                    selectedTransaction.type === 'income' 
                      ? 'bg-gradient-to-r from-green-50 to-green-100' 
                      : 'bg-gradient-to-r from-red-50 to-red-100'
                  }`}>
                    <div className="flex items-center space-x-3 mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        selectedTransaction.type === 'income' 
                          ? 'bg-gradient-to-br from-green-500 to-green-600' 
                          : 'bg-gradient-to-br from-red-500 to-red-600'
                      }`}>
                        {selectedTransaction.type === 'income' ? (
                          <ArrowUpRight className="w-5 h-5 text-white" />
                        ) : (
                          <ArrowDownRight className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{selectedTransaction.description}</h3>
                        <p className="text-gray-600">{selectedTransaction.category}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-xl p-4">
                      <div className="text-sm text-blue-600 font-medium mb-1">Montant</div>
                      <div className={`text-2xl font-bold ${
                        selectedTransaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {selectedTransaction.type === 'income' ? '+' : '-'}{selectedTransaction.amount.toLocaleString()} F CFA
                      </div>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-4">
                      <div className="text-sm text-purple-600 font-medium mb-1">Date</div>
                      <div className="text-lg font-bold text-purple-700">{selectedTransaction.date}</div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Statut</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        selectedTransaction.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {selectedTransaction.status === 'completed' ? 'Terminé' : 'En attente'}
                      </span>
                    </div>
                  </div>

                  {(receiptSignedUrl || selectedTransaction.receiptUrl) && (
                    <div className="rounded-xl bg-gray-50 p-4">
                      <h4 className="mb-2 text-sm font-semibold text-gray-700">Reçu</h4>
                      {receiptSignedUrl ? (
                        <img src={receiptSignedUrl} alt="Reçu de transaction" className="max-h-72 w-full rounded-lg object-contain" />
                      ) : (
                        <p className="text-sm text-gray-500">Chargement du reçu...</p>
                      )}
                    </div>
                  )}

                  <div className="flex space-x-3">
                    <Button
                      variant="primary"
                      onClick={() => openModal('edit', selectedTransaction)}
                      className="flex-1"
                    >
                      ✏️ Modifier
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => {
                        deleteTransaction(selectedTransaction.id);
                        setShowModal(false);
                      }}
                      className="flex-1"
                    >
                      🗑️ Supprimer
                    </Button>
                  </div>
                </div>
              )}
        </Modal>
      )}
    </div>
  );
};

export default Transactions;