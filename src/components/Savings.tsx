import React, { useState } from 'react';
import { Plus, Edit, Trash2, TrendingUp, Target, DollarSign, X, Home, GraduationCap, Plane, Heart, Car, Briefcase, Gift, Shield, Search } from 'lucide-react';
import { useSavingsGoals } from '../hooks/useStorage';
import { notificationService } from '../lib/notificationService';
import type { SavingsGoal } from '../types';

const Savings: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit' | 'details' | 'add-money'>('create');
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  
  // Filtres
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'Personnel',
    target: '',
    deadline: '',
    description: '',
    color: 'bg-blue-500'
  });

  const { savingsGoals, addGoal, updateGoal, deleteGoal: removeGoal, addMoneyToGoal } = useSavingsGoals();

  // Filtrer les objectifs
  const filteredGoals = savingsGoals.filter(goal => {
    const matchesType = filterType === 'all' || goal.type === filterType;
    const matchesSearch = goal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (goal.description && goal.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    let matchesStatus = true;
    if (filterStatus === 'completed') {
      matchesStatus = goal.percentage >= 100;
    } else if (filterStatus === 'in-progress') {
      matchesStatus = goal.percentage > 0 && goal.percentage < 100;
    } else if (filterStatus === 'not-started') {
      matchesStatus = goal.percentage === 0;
    } else if (filterStatus === 'urgent') {
      matchesStatus = goal.deadline.includes('9 jours') || goal.deadline.includes('10 jours');
    }
    
    return matchesType && matchesSearch && matchesStatus;
  });

  const totalSaved = savingsGoals.reduce((sum, goal) => sum + goal.current, 0);
  const totalGoals = savingsGoals.reduce((sum, goal) => sum + goal.target, 0);
  const averageProgress = savingsGoals.length
    ? savingsGoals.reduce((sum, goal) => sum + goal.percentage, 0) / savingsGoals.length
    : 0;

  const savingsTypes = [
    { value: 'Urgence', label: 'Urgence', icon: Shield, color: 'bg-red-500' },
    { value: 'Éducation', label: 'Éducation', icon: GraduationCap, color: 'bg-blue-500' },
    { value: 'Voyage', label: 'Voyage', icon: Plane, color: 'bg-green-500' },
    { value: 'Logement', label: 'Logement', icon: Home, color: 'bg-purple-500' },
    { value: 'Véhicule', label: 'Véhicule', icon: Car, color: 'bg-orange-500' },
    { value: 'Santé', label: 'Santé', icon: Heart, color: 'bg-pink-500' },
    { value: 'Retraite', label: 'Retraite', icon: Briefcase, color: 'bg-indigo-500' },
    { value: 'Cadeau', label: 'Cadeau', icon: Gift, color: 'bg-yellow-500' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openModal = (type: 'create' | 'edit' | 'details' | 'add-money', goal?: SavingsGoal) => {
    setModalType(type);
    setSelectedGoal(goal || null);
    setFormError(null);
    if (type === 'edit' && goal) {
      setFormData({
        name: goal.name,
        type: goal.type,
        target: goal.target.toString(),
        deadline: goal.deadline,
        description: goal.description || '',
        color: goal.color || 'bg-blue-500'
      });
    } else if (type === 'create') {
      setFormData({
        name: '',
        type: 'Urgence',
        target: '',
        deadline: '',
        description: '',
        color: 'bg-red-500'
      });
    }
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const targetValue = Number(formData.target);
    const name = formData.name.trim();

    if (!name) {
      setFormError('Veuillez saisir un nom d\'objectif.');
      return;
    }

    if (savingsGoals.some((g) => g.name.toLowerCase() === name.toLowerCase() && (!selectedGoal || g.id !== selectedGoal.id))) {
      setFormError('Un objectif avec ce nom existe déjà.');
      return;
    }

    if (!Number.isFinite(targetValue) || targetValue <= 0) {
      setFormError('Veuillez saisir un montant cible valide strictement supérieur à 0.');
      return;
    }

    if (!formData.deadline) {
      setFormError('Veuillez choisir une date d\'échéance.');
      return;
    }

    const deadlineTs = Date.parse(formData.deadline);
    if (Number.isNaN(deadlineTs)) {
      setFormError('Date d\'échéance invalide.');
      return;
    }
    if (deadlineTs <= Date.now()) {
      setFormError('La date d\'échéance doit être dans le futur.');
      return;
    }

    if (modalType === 'edit' && selectedGoal && targetValue <= selectedGoal.current) {
      setFormError('Le montant cible doit être supérieur au montant déjà épargné.');
      return;
    }

    void (async () => {
      try {
        if (modalType === 'create') {
          const payload: Omit<SavingsGoal, 'id' | 'percentage'> = {
            name,
            type: formData.type,
            current: 0,
            target: targetValue,
            deadline: formData.deadline,
            color: formData.color,
            description: formData.description,
          };
          await addGoal(payload);
          await notificationService.createSavingsNotification(
            { name, target: targetValue, current: 0, percentage: 0 },
            'created'
          );
        } else if (modalType === 'edit' && selectedGoal) {
          await updateGoal(selectedGoal.id, {
            name,
            type: formData.type,
            target: targetValue,
            deadline: formData.deadline,
            color: formData.color,
            description: formData.description,
          });
          const pct = selectedGoal.target > 0 ? (selectedGoal.current / targetValue) * 100 : 0;
          await notificationService.createSavingsNotification(
            { name, target: targetValue, current: selectedGoal.current, percentage: pct },
            'updated'
          );
        }
        setFormError(null);
        setShowModal(false);
      } catch (err) {
        setFormError(err instanceof Error ? err.message : 'Enregistrement impossible.');
      }
    })();
  };

  const deleteGoal = (id: number) => {
    const goalToDelete = savingsGoals.find((g) => g.id === id);
    void (async () => {
      try {
        await removeGoal(id);
        if (goalToDelete) {
          await notificationService.createSystemNotification(
            'Objectif d\'épargne supprimé',
            `Objectif "${goalToDelete.name}" supprimé`,
            'warning'
          );
        }
      } catch (err) {
        setFormError(err instanceof Error ? err.message : 'Suppression impossible.');
      }
    })();
  };

  const addMoney = (goalId: number, amount: number) => {
    if (!Number.isFinite(amount) || amount <= 0) {
      setFormError('Veuillez saisir un montant à ajouter valide supérieur à 0.');
      return;
    }

    void (async () => {
      try {
        const goal = savingsGoals.find((g) => g.id === goalId);
        if (!goal) return;
        const newCurrent = Math.min(goal.current + amount, goal.target);
        const newPercentage = goal.target > 0 ? (newCurrent / goal.target) * 100 : 0;
        await addMoneyToGoal(goalId, amount);
        if (newPercentage >= 100 && goal.percentage < 100) {
          await notificationService.createSavingsNotification(
            { ...goal, name: goal.name, current: newCurrent, percentage: newPercentage, target: goal.target },
            'completed'
          );
        } else if (newPercentage > goal.percentage) {
          await notificationService.createSavingsNotification(
            { ...goal, name: goal.name, current: newCurrent, percentage: newPercentage, target: goal.target },
            'updated'
          );
        }
      } catch (err) {
        setFormError(err instanceof Error ? err.message : 'Mise à jour impossible.');
      }
    })();
  };

  return (
    <div className="p-4 sm:p-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 min-h-screen">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">Objectifs d'Épargne</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Gérez vos objectifs d'épargne et suivez vos progrès</p>
          </div>
          <button 
            onClick={() => openModal('create')}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl hover:-translate-y-1"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvel Objectif</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">Total Épargné</h3>
            <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center shadow-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-green-600 mb-1">{totalSaved.toLocaleString()} F CFA</div>
          <div className="text-sm text-green-600">{savingsGoals.length} objectifs actifs</div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">Objectifs Totaux</h3>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center shadow-lg">
              <Target className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-blue-600 mb-1">{totalGoals.toLocaleString()} F CFA</div>
          <div className="text-sm text-blue-600">Somme de tous les objectifs</div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">Progression Moyenne</h3>
            <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center shadow-lg">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-purple-600 mb-1">{averageProgress.toFixed(1)}%</div>
          <div className="text-sm text-purple-600">De tous vos objectifs</div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher un objectif..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="all">Tous les types</option>
              {savingsTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="all">Tous les statuts</option>
              <option value="completed">Terminés</option>
              <option value="in-progress">En cours</option>
              <option value="not-started">Non commencés</option>
              <option value="urgent">Urgents</option>
            </select>
          </div>
        </div>
        
        {filteredGoals.length !== savingsGoals.length && (
          <div className="mt-4 text-sm text-gray-600">
            Affichage de {filteredGoals.length} objectif{filteredGoals.length > 1 ? 's' : ''} sur {savingsGoals.length}
          </div>
        )}
      </div>

      {/* Savings Goals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredGoals.map((goal) => (
          <div key={goal.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <div className={`w-4 h-4 rounded-full ${goal.color}`}></div>
                    <h3 className="font-bold text-lg text-gray-900">{goal.name}</h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    {(() => {
                      const typeInfo = savingsTypes.find(t => t.value === goal.type);
                      const IconComponent = typeInfo?.icon || Shield;
                      return (
                        <div className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded-full">
                          <IconComponent className="w-3 h-3 text-gray-600" />
                          <span className="text-xs text-gray-600">{goal.type}</span>
                        </div>
                      );
                    })()}
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <button 
                    onClick={() => openModal('details', goal)}
                    className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Target className="w-3 h-3" />
                  </button>
                  <button 
                    onClick={() => openModal('edit', goal)}
                    className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-3 h-3" />
                  </button>
                  <button 
                    onClick={() => deleteGoal(goal.id)}
                    className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between text-sm font-medium mb-2">
                  <span className="text-gray-600">Progression</span>
                  <span className="text-base font-bold text-gray-900">{goal.percentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-2 rounded-full transition-all duration-1000 ease-out ${goal.color.replace('bg-', 'bg-gradient-to-r from-').replace('-500', '-400 to-').replace('to-', goal.color.replace('-500', '-600'))}`}
                    style={{ width: `${Math.min(goal.percentage, 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Actuel</span>
                  <span className="font-bold text-gray-900">{goal.current.toLocaleString()} F CFA</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Objectif</span>
                  <span className="font-bold text-gray-900">{goal.target.toLocaleString()} F CFA</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Échéance</span>
                  <span className={`font-bold ${goal.deadline.includes('9 jours') ? 'text-red-600' : 'text-gray-900'}`}>
                    {goal.deadline}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Restant</span>
                  <span className="font-bold text-red-600">{(goal.target - goal.current).toLocaleString()} F CFA</span>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-100">
              <div className="flex space-x-2">
                <button 
                  onClick={() => openModal('add-money', goal)}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-2 px-3 rounded-lg font-medium hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl text-sm"
                >
                  💰 Ajouter
                </button>
                <button 
                  onClick={() => openModal('details', goal)}
                  className="flex-1 bg-white text-gray-700 border border-gray-200 py-2 px-3 rounded-lg font-medium hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl text-sm"
                >
                  📊 Détails
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Add New Goal Card */}
        <div 
          onClick={() => openModal('create')}
          className="bg-white rounded-2xl shadow-lg border-2 border-dashed border-gray-300 hover:border-blue-400 transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
        >
          <div className="p-6 flex flex-col items-center justify-center h-full min-h-[300px]">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Plus className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Nouvel Objectif</h3>
            <p className="text-gray-500 text-center text-sm">Créez un nouvel objectif d'épargne pour atteindre vos rêves</p>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {modalType === 'create' && 'Créer un Objectif'}
                  {modalType === 'edit' && 'Modifier l\'Objectif'}
                  {modalType === 'details' && 'Détails de l\'Objectif'}
                  {modalType === 'add-money' && 'Ajouter de l\'Argent'}
                </h2>
                <button 
                  onClick={() => setShowModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {(modalType === 'create' || modalType === 'edit') && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {formError && (
                    <div className="mb-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                      {formError}
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nom de l'objectif</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Ex: Voyage en Europe"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                      <select
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      >
                        {savingsTypes.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Montant cible (F CFA)</label>
                      <input
                        type="number"
                        name="target"
                        value={formData.target}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="500000"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Échéance</label>
                    <input
                      type="date"
                      name="deadline"
                      value={formData.deadline}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
                      placeholder="Décrivez votre objectif..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Couleur de l'objectif</label>
                    <div className="flex flex-wrap gap-2">
                      {savingsTypes.map((type) => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, color: type.color }))}
                          className={`w-8 h-8 ${type.color} rounded-lg hover:scale-110 transition-transform ${
                            formData.color === type.color ? 'ring-2 ring-blue-300' : ''
                          }`}
                          title={type.label}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      {modalType === 'create' ? 'Créer' : 'Modifier'}
                    </button>
                  </div>
                </form>
              )}

              {modalType === 'details' && selectedGoal && (
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className={`w-10 h-10 ${selectedGoal.color} rounded-xl flex items-center justify-center`}>
                        <Target className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{selectedGoal.name}</h3>
                        <p className="text-gray-600">{selectedGoal.type}</p>
                      </div>
                    </div>
                    {selectedGoal.description && (
                      <p className="text-gray-700">{selectedGoal.description}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50 rounded-xl p-4">
                      <div className="text-sm text-green-600 font-medium mb-1">Montant Actuel</div>
                      <div className="text-xl font-bold text-green-700">{selectedGoal.current.toLocaleString()} F CFA</div>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-4">
                      <div className="text-sm text-blue-600 font-medium mb-1">Objectif</div>
                      <div className="text-xl font-bold text-blue-700">{selectedGoal.target.toLocaleString()} F CFA</div>
                    </div>
                  </div>

                  <div className="bg-purple-50 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-purple-700 font-medium">Progression</span>
                      <span className="text-lg font-bold text-purple-700">{selectedGoal.percentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-purple-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-1000"
                        style={{ width: `${Math.min(selectedGoal.percentage, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm text-purple-600 mt-2">
                      <span>Restant: {(selectedGoal.target - selectedGoal.current).toLocaleString()} F CFA</span>
                      <span>Échéance: {selectedGoal.deadline}</span>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => openModal('add-money', selectedGoal)}
                      className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-2 px-3 rounded-lg font-medium hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      💰 Ajouter de l'argent
                    </button>
                    <button
                      onClick={() => openModal('edit', selectedGoal)}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 px-3 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      ✏️ Modifier
                    </button>
                  </div>
                </div>
              )}

              {modalType === 'add-money' && selectedGoal && (
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4">
                    <h3 className="text-lg font-bold text-green-900 mb-2">{selectedGoal.name}</h3>
                    <div className="flex justify-between text-green-700">
                      <span>Actuel: {selectedGoal.current.toLocaleString()} F CFA</span>
                      <span>Objectif: {selectedGoal.target.toLocaleString()} F CFA</span>
                    </div>
                  </div>

                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const amount = parseInt((e.target as any).amount.value);
                    addMoney(selectedGoal.id, amount);
                    setShowModal(false);
                  }}>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Montant à ajouter (F CFA)</label>
                      <input
                        type="number"
                        name="amount"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        placeholder="25000"
                        required
                        min="1"
                      />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowModal(false)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-2 rounded-lg font-medium hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        Ajouter
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Savings;