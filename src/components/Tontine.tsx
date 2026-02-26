import React, { useState, useMemo, useEffect } from 'react';
import { Users, Plus, Calendar, DollarSign, Clock, UserCheck, Edit, Trash2, X, Eye, Check } from 'lucide-react';
import { useTontines } from '../hooks/useStorage';
import { notificationService } from '../lib/notificationService';
import type { TontineGroup, TontineMember, MemberPayment, TontineTour } from '../types';

// Palette de couleurs pour les cards de groupes
const groupCardColors = [
  'from-pink-400 to-pink-600',
  'from-blue-400 to-blue-600',
  'from-green-400 to-green-600',
  'from-yellow-400 to-yellow-600',
  'from-purple-400 to-purple-600',
  'from-orange-400 to-orange-600',
  'from-teal-400 to-teal-600',
  'from-indigo-400 to-indigo-600',
];

const Tontine: React.FC = () => {
  // Utiliser le hook de stockage pour les tontines (doit être en premier)
  const { myTontines, setMyTontines, availableTontines, setAvailableTontines } = useTontines();

  const [activeTab, setActiveTab] = useState<'my-tontines' | 'available' | 'create' | 'history'>('my-tontines');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit' | 'details' | 'join' | 'payment' | 'manage'>('create');
  const [selectedTontine, setSelectedTontine] = useState<TontineGroup | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  
  // Filtres pour l'historique
  const [filterTontine, setFilterTontine] = useState<string>('1');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterPeriod, setFilterPeriod] = useState<string>('2025-01');

  // Fonction pour générer les périodes disponibles basées sur la date de début et le mois actuel de la tontine
  const generatePeriodsFromStartDate = (startDate: string, currentMonth: string) => {
    console.log('generatePeriodsFromStartDate appelé avec startDate:', startDate, 'currentMonth:', currentMonth);
    
    const periods = [];
    const start = new Date(startDate);
    
    console.log('start:', start);
    
    // Générer les périodes depuis le mois de début jusqu'au mois actuel de la tontine
    let currentPeriod = new Date(start.getFullYear(), start.getMonth(), 1);
    const endPeriod = new Date(parseInt(currentMonth.split('-')[0]), parseInt(currentMonth.split('-')[1]) - 1, 1);
    
    console.log('currentPeriod:', currentPeriod);
    console.log('endPeriod:', endPeriod);
    
    while (currentPeriod <= endPeriod) {
      const year = currentPeriod.getFullYear();
      const month = String(currentPeriod.getMonth() + 1).padStart(2, '0');
      const periodKey = `${year}-${month}`;
      
      const monthNames = [
        'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
      ];
      
      const period = {
        value: periodKey,
        label: `${monthNames[currentPeriod.getMonth()]} ${year}`
      };
      
      console.log('Ajout de la période:', period);
      periods.push(period);
      
      currentPeriod.setMonth(currentPeriod.getMonth() + 1);
    }
    
    console.log('Périodes finales:', periods);
    return periods;
  };

  // Obtenir les périodes disponibles pour la tontine sélectionnée
  const availablePeriods = useMemo(() => {
    const selectedTontineForHistory = myTontines.find(t => t.id === filterTontine);
    if (!selectedTontineForHistory) return [];
    
    console.log('Tontine sélectionnée pour historique:', selectedTontineForHistory);
    console.log('Date de début:', selectedTontineForHistory.startDate);
    console.log('Mois actuel de la tontine:', selectedTontineForHistory.currentMonth);
    
    const periods = generatePeriodsFromStartDate(selectedTontineForHistory.startDate, selectedTontineForHistory.currentMonth);
    console.log('Périodes générées:', periods);
    
    return periods;
  }, [filterTontine, myTontines]);

  // Initialiser filterTontine avec la première tontine disponible
  useEffect(() => {
    if (myTontines.length > 0 && (!filterTontine || !myTontines.find(t => t.id === filterTontine))) {
      console.log('Initialisation de filterTontine avec:', myTontines[0].id);
      setFilterTontine(myTontines[0].id);
    }
  }, [myTontines, filterTontine]);

  // Mettre à jour la période par défaut quand une tontine est sélectionnée
  useEffect(() => {
    if (availablePeriods.length > 0) {
      // Sélectionner la période la plus récente par défaut
      const mostRecentPeriod = availablePeriods[availablePeriods.length - 1];
      setFilterPeriod(mostRecentPeriod.value);
    }
  }, [availablePeriods]);

  // Surveiller les changements d'onglet
  useEffect(() => {
    console.log('Onglet changé vers:', activeTab);
    if (activeTab === 'create') {
      console.log('Onglet création activé');
    }
    if (activeTab === 'history' && myTontines.length > 0) {
      console.log('Onglet historique activé, réinitialisation de filterTontine');
      setFilterTontine(myTontines[0].id);
    }
  }, [activeTab, myTontines]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    montantCotisation: '',
    totalMembers: '',
    frequency: 'monthly',
    rules: ['Paiements obligatoires à date fixe', 'Ordre de réception déterminé par tirage au sort']
  });

  const [memberFormData, setMemberFormData] = useState({
    name: '',
    amount: ''
  });

  // Statistiques calculées
  const totalGroups = myTontines.length;
  const totalMembers = useMemo(() => myTontines.reduce((acc: number, g: TontineGroup) => acc + g.members.length, 0), [myTontines]);
  const totalContributed = useMemo(() => 
    myTontines.reduce((acc: number, g: TontineGroup) => 
      acc + g.members.reduce((memberAcc: number, m: TontineMember) => 
        memberAcc + m.payments.filter((p: MemberPayment) => p.paid).length * m.amount, 0
      ), 0
    ), [myTontines]
  );
  const nextTour = useMemo(() => {
    const allTours = myTontines.flatMap((g: TontineGroup) => 
      g.tours.map((t: TontineTour) => ({...t, group: g.name, groupId: g.id}))
    );
    const futureTours = allTours.filter((t: any) => t.date >= new Date());
    if (!futureTours.length) return null;
    return futureTours.sort((a: any, b: any) => a.date.getTime() - b.date.getTime())[0];
  }, [myTontines]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    console.log('handleInputChange:', name, value);
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMemberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    console.log('handleMemberInputChange:', name, value);
    setMemberFormData(prev => ({ ...prev, [name]: value }));
  };

  const openModal = (type: 'create' | 'edit' | 'details' | 'join' | 'payment' | 'manage', tontine?: TontineGroup) => {
    console.log('openModal appelé avec type:', type, 'tontine:', tontine);
    console.log('showModal avant:', showModal);
    
    setModalType(type);
    setSelectedTontine(tontine || null);
    setFormError(null);
    
    // Toujours réinitialiser le formulaire principal
    setFormData({
      name: '',
      description: '',
      montantCotisation: '',
      totalMembers: '',
      frequency: 'monthly',
      rules: ['Paiements obligatoires à date fixe', 'Ordre de réception déterminé par tirage au sort']
    });
    
    // Réinitialiser le formulaire membre
    setMemberFormData({
      name: '',
      amount: ''
    });
    
    // Si c'est une édition, remplir le formulaire avec les données existantes
    if (type === 'edit' && tontine) {
      setFormData({
        name: tontine.name,
        description: tontine.description,
        montantCotisation: tontine.montantCotisation.toString(),
        totalMembers: tontine.totalRounds.toString(),
        frequency: 'monthly',
        rules: ['Paiements obligatoires à date fixe', 'Ordre de réception déterminé par tirage au sort']
      });
    }
    
    setShowModal(true);
    console.log('showModal après setShowModal(true)');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('handleSubmit appelé avec modalType:', modalType);
    console.log('formData:', formData);
    
    if (modalType === 'create') {
      // Validation des données
      if (!formData.name.trim() || !formData.description.trim() || !formData.montantCotisation || !formData.totalMembers) {
        console.log('Données manquantes:', {
          name: !!formData.name.trim(),
          description: !!formData.description.trim(),
          montantCotisation: !!formData.montantCotisation,
          totalMembers: !!formData.totalMembers
        });
        setFormError('Veuillez remplir tous les champs obligatoires pour créer la tontine.');
        return;
      }

      const tontineId = `tontine_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const newTontine: TontineGroup = {
        id: tontineId,
        name: formData.name,
        description: formData.description,
        members: [],
        cycle: 1,
        tours: [],
        montantCotisation: parseInt(formData.montantCotisation),
        currentMonth: getCurrentMonth(),
        status: 'pending',
        startDate: new Date().toISOString().split('T')[0], // Date d'aujourd'hui
        totalRounds: parseInt(formData.totalMembers)
      };
      
      console.log('Nouvelle tontine à créer:', newTontine);
      setMyTontines(prev => [...prev, newTontine]);
      console.log('Tontine ajoutée avec succès');
      
      // Créer une notification
      notificationService.createTontineNotification(newTontine, 'created');
      
      // Fermer le modal et réinitialiser le formulaire
      setShowModal(false);
      setFormData({
        name: '',
        description: '',
        montantCotisation: '',
        totalMembers: '',
        frequency: 'monthly',
        rules: ['Paiements obligatoires à date fixe', 'Ordre de réception déterminé par tirage au sort']
      });
      setFormError(null);
    } else {
      setShowModal(false);
      setFormError(null);
    }
  };

  const addMember = () => {
    console.log('addMember appelé');
    console.log('selectedTontine:', selectedTontine);
    console.log('memberFormData:', memberFormData);
    
    if (!selectedTontine || !memberFormData.name.trim()) {
      console.log('Condition non remplie - selectedTontine:', !!selectedTontine, 'name:', memberFormData.name.trim());
      return;
    }
    
    const newMember: TontineMember = {
      id: `member_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: memberFormData.name,
      amount: parseInt(memberFormData.amount) || selectedTontine.montantCotisation,
      payments: [{ date: selectedTontine.currentMonth, paid: false }],
      createdAt: new Date().toISOString()
    };

    console.log('Nouveau membre à ajouter:', newMember);

    setMyTontines(prev => prev.map(tontine => 
      tontine.id === selectedTontine.id 
        ? { ...tontine, members: [...tontine.members, newMember] }
        : tontine
    ));

    // Mettre à jour selectedTontine pour refléter les changements
    setSelectedTontine(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        members: [...prev.members, newMember]
      };
    });

    setMemberFormData({ name: '', amount: '' });
    
    // Créer une notification pour l'ajout du membre
    notificationService.createSystemNotification(
      'Membre ajouté',
      `Membre "${newMember.name}" ajouté à la tontine`,
      'success'
    );
    
    console.log('Membre ajouté avec succès');
  };

  const togglePayment = (memberId: string, paymentDate: string) => {
    if (!selectedTontine) return;

    const member = selectedTontine.members.find(m => m.id === memberId);
    const payment = member?.payments.find(p => p.date === paymentDate);
    const newPaidStatus = !payment?.paid;

    setMyTontines(prev => prev.map(tontine => 
      tontine.id === selectedTontine.id 
        ? {
            ...tontine,
            members: tontine.members.map((member: TontineMember) => 
              member.id === memberId 
                ? {
                    ...member,
                    payments: member.payments.map((payment: MemberPayment) => 
                      payment.date === paymentDate 
                        ? { ...payment, paid: !payment.paid }
                        : payment
                    )
                  }
                : member
            )
          }
        : tontine
    ));

    // Mettre à jour selectedTontine pour refléter les changements
    setSelectedTontine(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        members: prev.members.map(member => 
          member.id === memberId 
            ? {
                ...member,
                payments: member.payments.map(payment => 
                  payment.date === paymentDate 
                    ? { ...payment, paid: !payment.paid }
                    : payment
                )
              }
            : member
        )
      };
    });

    // Créer une notification pour le changement de statut de paiement
    if (member) {
      notificationService.createSystemNotification(
        newPaidStatus ? 'Paiement marqué comme effectué' : 'Paiement marqué comme non effectué',
        `${member.name} - ${formatMonth(paymentDate)}`,
        newPaidStatus ? 'success' : 'warning'
      );
    }
  };

  const deleteMember = (memberId: string) => {
    if (!selectedTontine) return;

    const memberToDelete = selectedTontine.members.find(m => m.id === memberId);

    setMyTontines(prev => prev.map(tontine => 
      tontine.id === selectedTontine.id 
        ? { ...tontine, members: tontine.members.filter((m: TontineMember) => m.id !== memberId) }
        : tontine
    ));

    setSelectedTontine(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        members: prev.members.filter(m => m.id !== memberId)
      };
    });

    // Créer une notification pour la suppression du membre
    if (memberToDelete) {
      notificationService.createSystemNotification(
        'Membre supprimé',
        `Membre "${memberToDelete.name}" supprimé de la tontine`,
        'warning'
      );
    }
  };

  const deleteTontine = (id: string) => {
    const tontineToDelete = myTontines.find(t => t.id === id);
    setMyTontines(prev => prev.filter(t => t.id !== id));
    
    // Créer une notification pour la suppression de la tontine
    if (tontineToDelete) {
      notificationService.createSystemNotification(
        'Tontine supprimée',
        `Tontine "${tontineToDelete.name}" supprimée`,
        'warning'
      );
    }
  };

  const joinTontine = (tontineId: string) => {
    const tontine = availableTontines.find(t => t.id === tontineId);
    if (tontine) {
      const updatedTontine = {
        ...tontine,
        members: [{
          id: Date.now().toString(),
          name: 'Diallo Kiron',
          amount: tontine.montantCotisation,
          payments: [{ date: getCurrentMonth(), paid: false }],
          createdAt: new Date().toISOString()
        }],
        status: 'active' as const,
        currentMonth: getCurrentMonth()
      };
      setMyTontines(prev => [...prev, updatedTontine]);
      setAvailableTontines(prev => prev.filter(t => t.id !== tontineId));
    }
    setShowModal(false);
  };

  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    return `${month}/${year}`;
  };

  const passToNextMonth = () => {
    if (!selectedTontine) return;

    const [year, month] = selectedTontine.currentMonth.split('-').map(Number);
    const nextDate = new Date(year, month, 1);
    const nextMonth = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}`;

    setMyTontines(prev => prev.map(tontine => 
      tontine.id === selectedTontine.id 
        ? {
            ...tontine,
            currentMonth: nextMonth,
            cycle: Math.min(tontine.cycle + 1, tontine.totalRounds),
            members: tontine.members.map((member: TontineMember) => ({
              ...member,
              payments: [...member.payments, { date: nextMonth, paid: false }]
            }))
          }
        : tontine
    ));

    setSelectedTontine(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        currentMonth: nextMonth,
        cycle: Math.min(prev.cycle + 1, prev.totalRounds),
        members: prev.members.map(member => ({
          ...member,
          payments: [...member.payments, { date: nextMonth, paid: false }]
        }))
      };
    });
  };

  return (
    <div className="p-4 sm:p-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Tontines</h1>
            <p className="text-gray-600 text-lg mt-2">Participez à des groupes d'épargne collaborative</p>
          </div>
          <button
            onClick={() => {
              console.log('Bouton Créer une Tontine cliqué');
              console.log('activeTab avant:', activeTab);
              setActiveTab('create');
              console.log('activeTab après setActiveTab:', 'create');
            }}
            className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-2xl font-medium hover:from-purple-700 hover:to-purple-800 transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl hover:-translate-y-1"
          >
            <Plus className="w-5 h-5" />
            <span>Créer une Tontine</span>
          </button>
        </div>
      </div>

      {/* Prochain tour */}
      {nextTour && (
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-4 mb-6 border border-blue-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-semibold text-blue-900">Prochain tour :</span>
              <span className="font-bold text-blue-800 ml-2">
                {nextTour.member} ({nextTour.group}) - {nextTour.date.toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wider">Tontines Actives</h3>
            <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-purple-600">{totalGroups}</div>
          <div className="text-sm text-purple-600 mt-1">Groupes créés</div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wider">Total Membres</h3>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-blue-600">{totalMembers}</div>
          <div className="text-sm text-blue-600 mt-1">Membres au total</div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wider">Total Cotisé</h3>
            <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-green-600">{totalContributed.toLocaleString()} F CFA</div>
          <div className="text-sm text-green-600 mt-1">Depuis le début</div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wider">Prochain Tour</h3>
            <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-orange-600">{nextTour ? nextTour.member : '-'}</div>
          <div className="text-sm text-orange-600 mt-1">{nextTour ? nextTour.group : 'Aucun tour'}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-6">
        <div className="flex bg-white rounded-2xl p-2 shadow-lg border border-gray-100">
          <button
            onClick={() => setActiveTab('my-tontines')}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
              activeTab === 'my-tontines'
                ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Mes Tontines ({myTontines.length})
          </button>
          <button
            onClick={() => setActiveTab('available')}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
              activeTab === 'available'
                ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Disponibles ({availableTontines.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
              activeTab === 'history'
                ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Historique
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
              activeTab === 'create'
                ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Créer
          </button>
        </div>
      </div>

      {/* My Tontines */}
      {activeTab === 'my-tontines' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myTontines.map((tontine, index) => {
            const currentPayment = tontine.members.find((m: TontineMember) => m.name === 'Diallo Kiron')?.payments.find((p: MemberPayment) => p.date === tontine.currentMonth);
            const allPaid = tontine.members.every((m: TontineMember) => m.payments.find((p: MemberPayment) => p.date === tontine.currentMonth)?.paid);
            const progression = tontine.totalRounds > 0
              ? Math.min(
                  100,
                  Math.max(0, Math.round(((tontine.cycle - 1) / tontine.totalRounds) * 100))
                )
              : 0;

            return (
              <div key={tontine.id} className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div className={`h-2 bg-gradient-to-r ${groupCardColors[index % groupCardColors.length]}`}></div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{tontine.name}</h3>
                      <p className="text-gray-600 text-sm mb-3">{tontine.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {tontine.members.length} membres
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          Tour {tontine.cycle}/{tontine.totalRounds}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button 
                        onClick={() => openModal('details', tontine)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => openModal('manage', tontine)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => deleteTontine(tontine.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-4">
                        <div className="text-sm text-purple-600 font-medium mb-1">Montant mensuel</div>
                        <div className="text-lg font-bold text-purple-700">{tontine.montantCotisation.toLocaleString()} F CFA</div>
                      </div>
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4">
                        <div className="text-sm text-blue-600 font-medium mb-1">Mois actuel</div>
                        <div className="text-lg font-bold text-blue-700">{formatMonth(tontine.currentMonth)}</div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-700 font-medium">Progression</span>
                        <span className="text-lg font-bold text-gray-900">{progression}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-1000"
                          style={{ width: `${progression}%` }}
                        ></div>
                      </div>
                    </div>

                    {currentPayment && (
                      <div className={`flex items-center justify-between p-3 rounded-2xl border ${
                        currentPayment.paid 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-yellow-50 border-yellow-200'
                      }`}>
                        <div className="flex items-center space-x-2">
                          {currentPayment.paid ? (
                            <Check className="w-5 h-5 text-green-600" />
                          ) : (
                            <Clock className="w-5 h-5 text-yellow-600" />
                          )}
                          <span className={`text-sm font-medium ${
                            currentPayment.paid ? 'text-green-800' : 'text-yellow-800'
                          }`}>
                            {currentPayment.paid ? 'Payé ce mois' : 'Paiement en attente'}
                          </span>
                        </div>
                        {allPaid && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                            Tous payés
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex space-x-2">
                      <button 
                        onClick={() => openModal('details', tontine)}
                        className="flex-1 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 py-2 px-3 rounded-xl font-medium hover:from-blue-100 hover:to-blue-200 transition-all duration-300 text-sm"
                      >
                        👁️ Détails
                      </button>
                      <button 
                        onClick={() => openModal('manage', tontine)}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white py-2 px-3 rounded-xl font-medium hover:from-purple-700 hover:to-purple-800 transition-all duration-300 shadow-lg hover:shadow-xl text-sm"
                      >
                        ⚙️ Gérer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Available Tontines */}
      {activeTab === 'available' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableTontines.map((tontine, index) => (
            <div key={tontine.id} className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className={`h-2 bg-gradient-to-r ${groupCardColors[index % groupCardColors.length]}`}></div>
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{tontine.name}</h3>
                  <p className="text-gray-600 mb-4">{tontine.description}</p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-4">
                      <div className="text-sm text-purple-600 font-medium mb-1">Montant mensuel</div>
                      <div className="text-lg font-bold text-purple-700">{tontine.montantCotisation.toLocaleString()} F CFA</div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4">
                      <div className="text-sm text-blue-600 font-medium mb-1">Durée</div>
                      <div className="text-lg font-bold text-blue-700">{tontine.totalRounds} mois</div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date de début</span>
                      <span className="font-medium text-gray-900">{new Date(tontine.startDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pot total</span>
                      <span className="font-medium text-green-600">{(tontine.montantCotisation * tontine.totalRounds).toLocaleString()} F CFA</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button 
                      onClick={() => openModal('details', tontine)}
                      className="flex-1 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 py-2 px-3 rounded-xl font-medium hover:from-blue-100 hover:to-blue-200 transition-all duration-300 text-sm"
                    >
                      👁️ Détails
                    </button>
                    <button 
                      onClick={() => openModal('join', tontine)}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white py-2 px-3 rounded-xl font-medium hover:from-purple-700 hover:to-purple-800 transition-all duration-300 shadow-lg hover:shadow-xl text-sm"
                    >
                      🤝 Rejoindre
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 border-b border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Historique des Paiements</h3>
            <p className="text-gray-600">Suivi complet de tous les paiements effectués dans vos tontines</p>
          </div>
          
          <div className="p-6">
            {/* Filtres */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Tontine</label>
                <select 
                  value={filterTontine}
                  onChange={(e) => setFilterTontine(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {myTontines.length === 0 ? (
                    <option value="">Aucune tontine disponible</option>
                  ) : (
                    myTontines.map(tontine => (
                      <option key={tontine.id} value={tontine.id}>{tontine.name}</option>
                    ))
                  )}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                <select 
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Tous les statuts</option>
                  <option value="paid">Payé</option>
                  <option value="unpaid">Non payé</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Période</label>
                <select 
                  value={filterPeriod}
                  onChange={(e) => setFilterPeriod(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {availablePeriods.map(period => (
                    <option key={period.value} value={period.value}>
                      {period.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Filtrer les paiements */}
            {(() => {
              // Vérifier si une tontine est sélectionnée
              if (!filterTontine || filterTontine === '') {
                return (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune tontine sélectionnée</h3>
                    <p className="text-gray-600">Veuillez sélectionner une tontine pour voir l'historique des paiements</p>
                  </div>
                );
              }

              // Vérifier si des périodes sont disponibles
              if (availablePeriods.length === 0) {
                return (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune période disponible</h3>
                    <p className="text-gray-600">Aucune période n'est disponible pour cette tontine</p>
                  </div>
                );
              }

              const allPayments = myTontines.flatMap((tontine: TontineGroup) => 
                tontine.members.flatMap((member: TontineMember) => 
                  member.payments.map((payment: MemberPayment) => ({
                    memberName: member.name,
                    tontineName: tontine.name,
                    tontineId: tontine.id,
                    amount: member.amount,
                    date: payment.date,
                    paid: payment.paid,
                    tontineColor: groupCardColors[myTontines.indexOf(tontine) % groupCardColors.length]
                  }))
                )
              );

              const filteredPayments = allPayments.filter(payment => {
                const matchesTontine = payment.tontineId === filterTontine;
                const matchesStatus = !filterStatus || 
                  (filterStatus === 'paid' && payment.paid) || 
                  (filterStatus === 'unpaid' && !payment.paid);
                const matchesPeriod = payment.date === filterPeriod;
                
                return matchesTontine && matchesStatus && matchesPeriod;
              });

              return (
                <>
                  {/* Tableau des paiements */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Membre</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tontine</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {filteredPayments.map((payment, index) => (
                          <tr key={index} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center">
                                  <span className="text-purple-600 font-bold text-sm">
                                    {payment.memberName.split(' ').map((n: string) => n[0]).join('')}
                                  </span>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{payment.memberName}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className={`w-3 h-3 rounded-full mr-2 ${payment.tontineColor.replace('bg-gradient-to-r from-', 'bg-').replace(' to-pink-200', '').replace(' to-blue-200', '').replace(' to-green-200', '').replace(' to-yellow-200', '').replace(' to-purple-200', '').replace(' to-orange-200', '').replace(' to-teal-200', '')}`}></div>
                                <span className="text-sm text-gray-900">{payment.tontineName}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-bold text-gray-900">{payment.amount.toLocaleString()} F CFA</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                {(() => {
                                  const [year, month] = payment.date.split('-');
                                  return `${month}/${year}`;
                                })()}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                                payment.paid
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {payment.paid ? '✅ Payé' : '❌ Non payé'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Message si aucun résultat */}
                  {filteredPayments.length === 0 && (
                    <div className="text-center py-8">
                      <div className="text-gray-500 text-lg mb-2">Aucun paiement trouvé</div>
                      <div className="text-gray-400 text-sm">Essayez de modifier vos filtres</div>
                    </div>
                  )}

                  {/* Compteur de résultats */}
                  {filteredPayments.length !== allPayments.length && (
                    <div className="mt-4 text-sm text-gray-600">
                      Affichage de {filteredPayments.length} paiement{filteredPayments.length > 1 ? 's' : ''} sur {allPayments.length}
                    </div>
                  )}

                  {/* Résumé des paiements */}
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-medium text-green-800">Paiements Effectués</h4>
                        <div className="w-8 h-8 bg-green-200 rounded-lg flex items-center justify-center">
                          <span className="text-green-700 font-bold">✓</span>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-green-700">
                        {filteredPayments.filter(p => p.paid).length}
                      </div>
                      <div className="text-sm text-green-600">Paiements validés</div>
                    </div>

                    <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6 border border-red-200">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-medium text-red-800">Paiements en Attente</h4>
                        <div className="w-8 h-8 bg-red-200 rounded-lg flex items-center justify-center">
                          <span className="text-red-700 font-bold">⏳</span>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-red-700">
                        {filteredPayments.filter(p => !p.paid).length}
                      </div>
                      <div className="text-sm text-red-600">À effectuer</div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-medium text-blue-800">Montant Total</h4>
                        <div className="w-8 h-8 bg-blue-200 rounded-lg flex items-center justify-center">
                          <span className="text-blue-700 font-bold">💰</span>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-blue-700">
                        {filteredPayments.filter(p => p.paid).reduce((sum, p) => sum + p.amount, 0).toLocaleString()} F CFA
                      </div>
                      <div className="text-sm text-blue-600">Cotisations payées</div>
                    </div>
                  </div>
                </>
              );
            })()}


          </div>
        </div>
      )}

      {/* Create Tontine */}
      {activeTab === 'create' && (
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Créer une Nouvelle Tontine</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nom de la tontine</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Ex: Tontine Famille Diallo"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Montant mensuel (F CFA)</label>
                  <input
                    type="number"
                    name="montantCotisation"
                    value={formData.montantCotisation}
                    onChange={handleInputChange}
                    placeholder="50000"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Décrivez l'objectif de cette tontine..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de membres</label>
                  <input
                    type="number"
                    name="totalMembers"
                    value={formData.totalMembers}
                    onChange={handleInputChange}
                    placeholder="12"
                    min="3"
                    max="50"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fréquence</label>
                  <select 
                    name="frequency"
                    value={formData.frequency}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  >
                    <option value="monthly">Mensuel</option>
                    <option value="weekly">Hebdomadaire</option>
                    <option value="biweekly">Bi-mensuel</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setActiveTab('my-tontines')}
                  className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-8 py-3 rounded-xl font-medium hover:from-purple-700 hover:to-purple-800 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Créer la Tontine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {modalType === 'details' && 'Détails de la Tontine'}
                  {modalType === 'join' && 'Rejoindre la Tontine'}
                  {modalType === 'manage' && 'Gérer la Tontine'}
                </h2>
                <button 
                  onClick={() => setShowModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {formError && (
                <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                  {formError}
                </div>
              )}

              {modalType === 'details' && selectedTontine && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedTontine.name}</h3>
                    <p className="text-gray-700 mb-4">{selectedTontine.description}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Membres</span>
                        <div className="font-bold text-purple-600">{selectedTontine.members.length}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Montant</span>
                        <div className="font-bold text-green-600">{selectedTontine.montantCotisation.toLocaleString()} F CFA</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Tour actuel</span>
                        <div className="font-bold text-blue-600">{selectedTontine.cycle}/{selectedTontine.totalRounds}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Mois actuel</span>
                        <div className="font-bold text-orange-600">{formatMonth(selectedTontine.currentMonth)}</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-2xl p-6">
                    <h4 className="font-bold text-gray-900 mb-4">Liste des Membres</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedTontine.members.map((member, index) => {
                        const currentPayment = member.payments.find(p => p.date === selectedTontine.currentMonth);
                        return (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                {member.name.split(' ').map(n => n[0]).join('')}
                              </div>
                              <span className="font-medium text-gray-900">{member.name}</span>
                            </div>
                            {currentPayment && (
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                currentPayment.paid 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {currentPayment.paid ? 'Payé' : 'En attente'}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {modalType === 'join' && selectedTontine && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedTontine.name}</h3>
                    <p className="text-gray-700">{selectedTontine.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-green-50 rounded-2xl p-6">
                      <div className="text-sm text-green-600 font-medium mb-1">Contribution mensuelle</div>
                      <div className="text-2xl font-bold text-green-700">{selectedTontine.montantCotisation.toLocaleString()} F CFA</div>
                    </div>
                    <div className="bg-blue-50 rounded-2xl p-6">
                      <div className="text-sm text-blue-600 font-medium mb-1">Pot total</div>
                      <div className="text-2xl font-bold text-blue-700">{(selectedTontine.montantCotisation * selectedTontine.totalRounds).toLocaleString()} F CFA</div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
                    <h4 className="font-bold text-yellow-900 mb-3">Conditions de participation</h4>
                    <ul className="space-y-2 text-yellow-800">
                      <li>• Engagement sur {selectedTontine.totalRounds} mois</li>
                      <li>• Paiement mensuel de {selectedTontine.montantCotisation.toLocaleString()} F CFA</li>
                      <li>• Début des paiements: {new Date(selectedTontine.startDate).toLocaleDateString()}</li>
                    </ul>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={() => setShowModal(false)}
                      className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={() => joinTontine(selectedTontine.id)}
                      className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-8 py-3 rounded-xl font-medium hover:from-purple-700 hover:to-purple-800 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      Confirmer l'adhésion
                    </button>
                  </div>
                </div>
              )}

              {modalType === 'manage' && selectedTontine && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedTontine.name}</h3>
                    <p className="text-gray-700 mb-4">{selectedTontine.description}</p>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Membres</span>
                        <div className="font-bold text-purple-600">{selectedTontine.members.length}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Mois actuel</span>
                        <div className="font-bold text-blue-600">{formatMonth(selectedTontine.currentMonth)}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Montant</span>
                        <div className="font-bold text-green-600">{selectedTontine.montantCotisation.toLocaleString()} F CFA</div>
                      </div>
                    </div>
                  </div>

                  {/* Ajouter un membre */}
                  <div className="bg-white border border-gray-200 rounded-2xl p-6">
                    <h4 className="font-bold text-gray-900 mb-4">Ajouter un membre</h4>
                    <div className="flex space-x-4">
                      <input
                        type="text"
                        name="name"
                        value={memberFormData.name}
                        onChange={handleMemberInputChange}
                        placeholder="Nom du membre"
                        className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      />
                      <input
                        type="number"
                        name="amount"
                        value={memberFormData.amount}
                        onChange={handleMemberInputChange}
                        placeholder={selectedTontine.montantCotisation.toString()}
                        className="w-32 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      />
                      <button
                        onClick={addMember}
                        className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-xl font-medium hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        Ajouter
                      </button>
                    </div>
                  </div>

                  {/* Liste des membres avec statuts */}
                  <div className="bg-white border border-gray-200 rounded-2xl p-6">
                    <h4 className="font-bold text-gray-900 mb-4">Membres et Paiements</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="px-4 py-3 text-left">Nom</th>
                            <th className="px-4 py-3 text-right">Montant</th>
                            <th className="px-4 py-3 text-center">Mois</th>
                            <th className="px-4 py-3 text-center">Statut</th>
                            <th className="px-4 py-3 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedTontine.members.map((member) => {
                            const currentPayment = member.payments.find(p => p.date === selectedTontine.currentMonth);
                            return (
                              <tr key={member.id} className={currentPayment?.paid ? 'bg-green-50' : 'bg-yellow-50'}>
                                <td className="px-4 py-3 font-medium">{member.name}</td>
                                <td className="px-4 py-3 text-right font-mono">{member.amount.toLocaleString()} F CFA</td>
                                <td className="px-4 py-3 text-center">{formatMonth(selectedTontine.currentMonth)}</td>
                                <td className="px-4 py-3 text-center">
                                  {currentPayment?.paid ? (
                                    <span className="text-green-600 font-bold">✔ Payé</span>
                                  ) : (
                                    <span className="text-red-600 font-bold">✗ Non payé</span>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <div className="flex justify-center space-x-2">
                                    <button
                                      onClick={() => togglePayment(member.id, selectedTontine.currentMonth)}
                                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                                        currentPayment?.paid 
                                          ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                                      }`}
                                    >
                                      {currentPayment?.paid ? 'Annuler' : 'Marquer payé'}
                                    </button>
                                    <button
                                      onClick={() => deleteMember(member.id)}
                                      className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-medium hover:bg-red-200 transition-colors"
                                    >
                                      Supprimer
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Contrôles de tour */}
                  <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                    <h4 className="font-bold text-blue-900 mb-4">Gestion des Tours</h4>
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm text-blue-700 mb-1">Mois actuel: {formatMonth(selectedTontine.currentMonth)}</div>
                        <div className="text-sm text-blue-700">
                          Membres payés: {selectedTontine.members.filter(m => m.payments.find(p => p.date === selectedTontine.currentMonth)?.paid).length}/{selectedTontine.members.length}
                        </div>
                      </div>
                      <button
                        onClick={passToNextMonth}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        Passer au mois suivant
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tontine;