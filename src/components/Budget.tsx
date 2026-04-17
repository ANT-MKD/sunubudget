import React, { useMemo, useState } from 'react';
import { DollarSign, Plus, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Select } from './ui';
import { useCategoryBudgets, useTransactions } from '../hooks/useStorage';

const EXPENSE_CATEGORIES = [
  'Alimentation',
  'Logement',
  'Transport',
  'Santé',
  'Loisirs',
  'Vêtements',
  'Éducation',
  'Technologie',
  'Assurance',
  'Impôts',
  'Cadeaux',
  'Voyage',
];

const Budget: React.FC = () => {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [amount, setAmount] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { budgets, upsertBudget } = useCategoryBudgets();
  const { transactions } = useTransactions();

  const monthlyExpenses = useMemo(() => {
    const map = new Map<string, number>();
    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        const d = new Date(t.date);
        if (d.getMonth() + 1 !== month || d.getFullYear() !== year) return;
        map.set(t.category, (map.get(t.category) ?? 0) + t.amount);
      });
    return map;
  }, [transactions, month, year]);

  const entries = budgets.map((b) => {
    const spent = monthlyExpenses.get(b.category) ?? 0;
    const pct = b.amount > 0 ? Math.min(100, Math.round((spent / b.amount) * 100)) : 0;
    return { ...b, spent, pct };
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const n = Number(amount);
    if (!Number.isFinite(n) || n <= 0) {
      setError('Le montant doit être supérieur à 0.');
      return;
    }
    setSaving(true);
    try {
      await upsertBudget({ category, amount: n, month, year });
      setAmount('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Enregistrement impossible.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 p-4 pb-24 dark:from-gray-900 dark:to-gray-800 sm:p-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl">Budgets par catégorie</CardTitle>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Définissez vos plafonds mensuels et suivez leur consommation en temps réel.
          </p>
        </CardHeader>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Définir un budget ({month}/{year})</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid grid-cols-1 gap-4 sm:grid-cols-3" onSubmit={handleSave}>
            <Select
              label="Catégorie"
              name="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={EXPENSE_CATEGORIES.map((c) => ({ value: c, label: c }))}
            />
            <Input
              label="Montant (F CFA)"
              name="amount"
              type="number"
              inputMode="numeric"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="50000"
            />
            <div className="flex items-end">
              <Button type="submit" variant="primary" icon={Plus} disabled={saving} className="w-full">
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </div>
          </form>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        </CardContent>
      </Card>

      <div className="space-y-4">
        {entries.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-gray-500">
              <Wallet className="mx-auto mb-3 h-8 w-8 text-gray-400" />
              Aucun budget défini pour ce mois.
            </CardContent>
          </Card>
        ) : (
          entries.map((entry) => (
            <Card key={entry.id}>
              <CardContent className="p-4">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{entry.category}</h3>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {entry.spent.toLocaleString()} / {entry.amount.toLocaleString()} F CFA
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className={`h-2 rounded-full ${entry.pct >= 100 ? 'bg-red-500' : entry.pct >= 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                    style={{ width: `${entry.pct}%` }}
                  />
                </div>
                <div className="mt-2 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <DollarSign className="h-4 w-4" />
                  {entry.pct}% utilisé
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Budget;
