import React, { useState } from 'react';
import { Trophy, Star, Target, Award, Plus, Edit, Trash2, Calendar, Clock, CheckCircle, X, Search } from 'lucide-react';
import { useChallenges, useBadges } from '../hooks/useStorage';
import { notificationService } from '../lib/notificationService';
import type { AppChallenge } from '../types';

const Challenges: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'challenges' | 'badges'>('challenges');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit' | 'details'>('create');
  const [selectedChallenge, setSelectedChallenge] = useState<AppChallenge | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Filtres pour les défis
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { challenges, addChallenge, updateChallenge, deleteChallenge: removeChallenge } = useChallenges();
  const { badges } = useBadges();

  // Filtrer les défis
  const filteredChallenges = challenges.filter(challenge => {
    const matchesType = filterType === 'all' || challenge.type === filterType;
    const matchesStatus = filterStatus === 'all' || challenge.status === filterStatus;
    const matchesSearch = challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         challenge.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesType && matchesStatus && matchesSearch;
  });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'custom' as AppChallenge['type'],
    target: '',
    deadline: '',
    reward: ''
  });

  const stats = [
    { 
      label: 'Niveau', 
      value: '1', 
      subtext: '90 pts pour le niveau 2', 
      color: 'text-orange-600', 
      bgColor: 'bg-orange-100',
      progress: 0
    },
    { 
      label: 'Points Totaux', 
      value: '0', 
      subtext: '+0 pts des défis', 
      color: 'text-purple-600', 
      bgColor: 'bg-purple-100' 
    },
    { 
      label: 'Défis Terminés', 
      value: challenges.filter(c => c.status === 'completed').length.toString(), 
      subtext: `${challenges.filter(c => c.status === 'active').length} défis actifs`, 
      color: 'text-green-600', 
      bgColor: 'bg-green-100' 
    },
    { 
      label: 'Badges Débloqués', 
      value: badges.filter(b => b.earned).length.toString(), 
      subtext: `${badges.filter(b => !b.earned).length} badges restants`, 
      color: 'text-pink-600', 
      bgColor: 'bg-pink-100' 
    },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openModal = (type: 'create' | 'edit' | 'details', challenge?: AppChallenge) => {
    setModalType(type);
    setSelectedChallenge(challenge || null);
    if (type === 'edit' && challenge) {
      setFormData({
        title: challenge.title,
        description: challenge.description,
        type: challenge.type,
        target: challenge.target?.toString() || '',
        deadline: challenge.deadline,
        reward: challenge.reward
      });
    } else if (type === 'create') {
      setFormData({
        title: '',
        description: '',
        type: 'custom',
        target: '',
        deadline: '',
        reward: ''
      });
    }
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const title = formData.title.trim();
    const desc = formData.description.trim();
    if (title.length < 2) {
      setFormError('Le titre doit contenir au moins 2 caractères.');
      return;
    }
    if (desc.length < 3) {
      setFormError('La description doit contenir au moins 3 caractères.');
      return;
    }
    if (!formData.deadline) {
      setFormError('La date limite est obligatoire.');
      return;
    }
    const deadlineDate = new Date(formData.deadline);
    if (Number.isNaN(deadlineDate.getTime())) {
      setFormError('Date limite invalide.');
      return;
    }

    void (async () => {
      try {
        if (modalType === 'create') {
          const payload: Omit<AppChallenge, 'id'> = {
            title,
            description: desc,
            progress: 0,
            reward: formData.reward.trim(),
            deadline: formData.deadline,
            type: formData.type,
            status: 'active',
            target: formData.target ? parseInt(formData.target, 10) : undefined,
            current: 0,
          };
          await addChallenge(payload);
          await notificationService.createChallengeNotification(
            { title, description: desc, reward: formData.reward },
            'created'
          );
        } else if (modalType === 'edit' && selectedChallenge) {
          await updateChallenge(selectedChallenge.id, {
            title,
            description: desc,
            type: formData.type,
            target: formData.target ? parseInt(formData.target, 10) : undefined,
            deadline: formData.deadline,
            reward: formData.reward.trim(),
          });
        }
        setShowModal(false);
      } catch (err) {
        setFormError(err instanceof Error ? err.message : 'Enregistrement impossible.');
      }
    })();
  };

  const deleteChallenge = (id: number) => {
    void (async () => {
      try {
        await removeChallenge(id);
      } catch (err) {
        setFormError(err instanceof Error ? err.message : 'Suppression impossible.');
      }
    })();
  };

  const completeChallenge = (id: number) => {
    void (async () => {
      try {
        const ch = challenges.find((c) => c.id === id);
        if (!ch) return;
        await updateChallenge(id, { status: 'completed', progress: 100 });
        await notificationService.createChallengeNotification(
          { title: ch.title, description: ch.description, reward: ch.reward },
          'completed'
        );
      } catch (err) {
        setFormError(err instanceof Error ? err.message : 'Mise à jour impossible.');
      }
    })();
  };

  return (
    <div className="p-8 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 min-h-screen">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-700 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">Gamification</h1>
            <p className="text-gray-600 dark:text-gray-400 text-xl mt-2">Relevez des défis et gagnez des récompenses pour améliorer vos habitudes financières</p>
          </div>
          <button 
            onClick={() => openModal('create')}
            className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-8 py-4 rounded-2xl font-medium hover:from-purple-700 hover:to-purple-800 transition-all duration-300 flex items-center space-x-3 shadow-xl hover:shadow-2xl hover:-translate-y-1"
          >
            <Plus className="w-5 h-5" />
            <span>Créer un Défi</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">{stat.label}</h3>
              <div className={`w-12 h-12 ${stat.bgColor} dark:bg-opacity-20 rounded-2xl flex items-center justify-center shadow-lg`}>
                {index === 0 && <Trophy className={`w-6 h-6 ${stat.color}`} />}
                {index === 1 && <Star className={`w-6 h-6 ${stat.color}`} />}
                {index === 2 && <Target className={`w-6 h-6 ${stat.color}`} />}
                {index === 3 && <Award className={`w-6 h-6 ${stat.color}`} />}
              </div>
            </div>
            <div className={`text-4xl font-bold ${stat.color} mb-2`}>{stat.value}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">{stat.subtext}</div>
            {stat.progress !== undefined && (
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-orange-400 to-orange-600 h-3 rounded-full transition-all duration-1000"
                  style={{ width: `${stat.progress}%` }}
                ></div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-8">
        <div className="flex bg-white dark:bg-gray-900 rounded-2xl p-2 shadow-xl border border-gray-100 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('challenges')}
            className={`px-8 py-3 rounded-xl font-medium transition-all duration-300 ${
              activeTab === 'challenges'
                ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            🏆 Défis ({challenges.filter(c => c.status === 'active').length})
          </button>
          <button
            onClick={() => setActiveTab('badges')}
            className={`px-8 py-3 rounded-xl font-medium transition-all duration-300 ${
              activeTab === 'badges'
                ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            🏅 Badges ({badges.filter(b => b.earned).length}/{badges.length})
          </button>
        </div>
      </div>

      {/* Filtres pour les défis */}
      {activeTab === 'challenges' && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Rechercher un défi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">Tous les types</option>
                <option value="savings">Épargne</option>
                <option value="budget">Budget</option>
                <option value="transactions">Transactions</option>
                <option value="custom">Personnalisé</option>
              </select>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actifs</option>
                <option value="completed">Terminés</option>
                <option value="failed">Échoués</option>
              </select>
            </div>
          </div>
          
          {filteredChallenges.length !== challenges.length && (
            <div className="mt-4 text-sm text-gray-600">
              Affichage de {filteredChallenges.length} défi{filteredChallenges.length > 1 ? 's' : ''} sur {challenges.length}
            </div>
          )}
        </div>
      )}

      {/* Challenges Tab */}
      {activeTab === 'challenges' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredChallenges.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun défi</h3>
              <p className="text-gray-600">Créez votre premier défi pour commencer</p>
            </div>
          ) : (
            filteredChallenges.map((challenge) => (
              <div key={challenge.id} className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-bold text-xl text-gray-900">{challenge.title}</h4>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        challenge.status === 'active' ? 'bg-blue-100 text-blue-800' :
                        challenge.status === 'completed' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {challenge.status === 'active' ? 'Actif' :
                         challenge.status === 'completed' ? 'Terminé' : 'Échoué'}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">{challenge.description}</p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button 
                      onClick={() => openModal('details', challenge)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                    >
                      <Target className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => openModal('edit', challenge)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => deleteChallenge(challenge.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="mb-6">
                  <div className="flex items-center justify-between text-sm font-medium mb-3">
                    <span className="text-gray-600">Progression</span>
                    <span className="text-lg font-bold text-gray-900">{challenge.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className={`h-3 rounded-full transition-all duration-1000 ${
                        challenge.status === 'completed' ? 'bg-gradient-to-r from-green-400 to-green-600' :
                        challenge.status === 'failed' ? 'bg-gradient-to-r from-red-400 to-red-600' :
                        'bg-gradient-to-r from-purple-400 to-purple-600'
                      }`}
                      style={{ width: `${challenge.progress}%` }}
                    ></div>
                  </div>
                </div>

                {challenge.target && challenge.current !== undefined && (
                  <div className="bg-gray-50 rounded-2xl p-4 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Actuel: {challenge.current}</span>
                      <span className="text-gray-600">Objectif: {challenge.target}</span>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between text-sm mb-6">
                  <span className="text-gray-500 flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {challenge.deadline}
                  </span>
                  <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-medium">
                    {challenge.reward}
                  </span>
                </div>

                {challenge.status === 'active' && (
                  <button
                    onClick={() => completeChallenge(challenge.id)}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-4 rounded-xl font-medium hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    ✅ Marquer comme terminé
                  </button>
                )}
              </div>
            ))
          )}

          {/* Add New Challenge Card */}
          <div 
            onClick={() => openModal('create')}
            className="bg-white rounded-3xl shadow-xl border-2 border-dashed border-gray-300 hover:border-purple-400 transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
          >
            <div className="p-8 flex flex-col items-center justify-center h-full min-h-[400px]">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Plus className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Nouveau Défi</h3>
              <p className="text-gray-500 text-center">Créez un défi personnalisé pour vous motiver</p>
            </div>
          </div>
        </div>
      )}

      {/* Badges Tab */}
      {activeTab === 'badges' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {badges.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun badge</h3>
              <p className="text-gray-600">Les badges apparaîtront ici quand vous les débloquerez</p>
            </div>
          ) : (
            badges.map((badge) => (
              <div key={badge.id} className={`rounded-3xl p-8 shadow-xl border transition-all duration-300 hover:-translate-y-1 ${
                badge.earned 
                  ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 hover:shadow-2xl' 
                  : 'bg-white border-gray-100 hover:shadow-2xl opacity-75'
              }`}>
                <div className="text-center">
                  <div className={`text-6xl mb-4 ${badge.earned ? 'grayscale-0' : 'grayscale'}`}>
                    {badge.icon}
                  </div>
                  <h3 className={`text-xl font-bold mb-2 ${badge.earned ? 'text-yellow-800' : 'text-gray-600'}`}>
                    {badge.name}
                  </h3>
                  <p className={`text-sm mb-4 ${badge.earned ? 'text-yellow-700' : 'text-gray-500'}`}>
                    {badge.description}
                  </p>
                  <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    badge.earned 
                      ? 'bg-yellow-200 text-yellow-800' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {badge.category}
                  </div>
                  {badge.earned && badge.earnedDate && (
                    <div className="mt-3 text-xs text-yellow-600">
                      Débloqué le {badge.earnedDate}
                    </div>
                  )}
                  {badge.earned && (
                    <div className="mt-4">
                      <CheckCircle className="w-6 h-6 text-green-600 mx-auto" />
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {modalType === 'create' && 'Créer un Défi'}
                  {modalType === 'edit' && 'Modifier le Défi'}
                  {modalType === 'details' && 'Détails du Défi'}
                </h2>
                <button 
                  onClick={() => setShowModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {(modalType === 'create' || modalType === 'edit') && (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {formError && (
                    <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
                      {formError}
                    </p>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Titre du défi</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="Ex: Économiser 50000 F CFA"
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
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all"
                      placeholder="Décrivez votre défi..."
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Type de défi</label>
                      <select
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      >
                        <option value="savings">Épargne</option>
                        <option value="budget">Budget</option>
                        <option value="transactions">Transactions</option>
                        <option value="custom">Personnalisé</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Objectif numérique</label>
                      <input
                        type="number"
                        name="target"
                        value={formData.target}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        placeholder="25000"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Échéance</label>
                      <input
                        type="date"
                        name="deadline"
                        value={formData.deadline}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Récompense</label>
                      <input
                        type="text"
                        name="reward"
                        value={formData.reward}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        placeholder="50 pts"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4 pt-6">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-8 py-3 rounded-xl font-medium hover:from-purple-700 hover:to-purple-800 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      {modalType === 'create' ? 'Créer' : 'Modifier'}
                    </button>
                  </div>
                </form>
              )}

              {modalType === 'details' && selectedChallenge && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedChallenge.title}</h3>
                    <p className="text-gray-700 mb-4">{selectedChallenge.description}</p>
                    <div className="flex items-center space-x-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        selectedChallenge.status === 'active' ? 'bg-blue-100 text-blue-800' :
                        selectedChallenge.status === 'completed' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {selectedChallenge.status === 'active' ? 'Actif' :
                         selectedChallenge.status === 'completed' ? 'Terminé' : 'Échoué'}
                      </span>
                      <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                        {selectedChallenge.reward}
                      </span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-6">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-gray-700 font-medium">Progression</span>
                      <span className="text-2xl font-bold text-purple-600">{selectedChallenge.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-purple-600 h-4 rounded-full transition-all duration-1000"
                        style={{ width: `${selectedChallenge.progress}%` }}
                      ></div>
                    </div>
                    {selectedChallenge.target && selectedChallenge.current !== undefined && (
                      <div className="flex justify-between text-sm text-gray-600 mt-2">
                        <span>Actuel: {selectedChallenge.current}</span>
                        <span>Objectif: {selectedChallenge.target}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-2xl">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <span className="text-blue-800 font-medium">Échéance</span>
                    </div>
                    <span className="text-blue-800 font-bold">{selectedChallenge.deadline}</span>
                  </div>

                  {selectedChallenge.status === 'active' && (
                    <div className="flex space-x-4">
                      <button
                        onClick={() => completeChallenge(selectedChallenge.id)}
                        className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-4 rounded-xl font-medium hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        ✅ Marquer terminé
                      </button>
                      <button
                        onClick={() => openModal('edit', selectedChallenge)}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        ✏️ Modifier
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Challenges;