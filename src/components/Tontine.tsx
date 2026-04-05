import React, { useState, useMemo, useEffect } from 'react';
import { Users, Plus, Calendar, DollarSign, Clock, UserCheck } from 'lucide-react';
import { useTontines } from '../hooks/useStorage';
import { notificationService } from '../lib/notificationService';
import type { TontineGroup, TontineMember, MemberPayment, TontineTour } from '../types';
import { groupCardColors } from './tontine/constants';
import { generatePeriodsFromStartDate, formatMonth } from './tontine/utils';
import TontineCard from './tontine/TontineCard';
import TontineForm from './tontine/TontineForm';
import TontineHistory from './tontine/TontineHistory';
import TontineModal from './tontine/TontineModal';

const HIGHLIGHT_MEMBER_NAME = 'Diallo Kiron';

const Tontine: React.FC = () => {
  const { myTontines, setMyTontines, availableTontines, setAvailableTontines } = useTontines();

  const [activeTab, setActiveTab] = useState<'my-tontines' | 'available' | 'create' | 'history'>('my-tontines');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit' | 'details' | 'join' | 'payment' | 'manage'>('create');
  const [selectedTontine, setSelectedTontine] = useState<TontineGroup | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [filterTontine, setFilterTontine] = useState<string>('1');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterPeriod, setFilterPeriod] = useState<string>('2025-01');

  const availablePeriods = useMemo(() => {
    const selectedTontineForHistory = myTontines.find((t) => t.id === filterTontine);
    if (!selectedTontineForHistory) return [];
    return generatePeriodsFromStartDate(selectedTontineForHistory.startDate, selectedTontineForHistory.currentMonth);
  }, [filterTontine, myTontines]);

  useEffect(() => {
    if (myTontines.length > 0 && (!filterTontine || !myTontines.find((t) => t.id === filterTontine))) {
      setFilterTontine(myTontines[0].id);
    }
  }, [myTontines, filterTontine]);

  useEffect(() => {
    if (availablePeriods.length > 0) {
      const mostRecentPeriod = availablePeriods[availablePeriods.length - 1];
      setFilterPeriod(mostRecentPeriod.value);
    }
  }, [availablePeriods]);

  useEffect(() => {
    if (activeTab === 'history' && myTontines.length > 0) {
      setFilterTontine(myTontines[0].id);
    }
  }, [activeTab, myTontines]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    montantCotisation: '',
    totalMembers: '',
    frequency: 'monthly',
    rules: ['Paiements obligatoires à date fixe', 'Ordre de réception déterminé par tirage au sort'],
  });

  const [memberFormData, setMemberFormData] = useState({
    name: '',
    amount: '',
  });

  const totalGroups = myTontines.length;
  const totalMembers = useMemo(
    () => myTontines.reduce((acc: number, g: TontineGroup) => acc + g.members.length, 0),
    [myTontines]
  );
  const totalContributed = useMemo(
    () =>
      myTontines.reduce(
        (acc: number, g: TontineGroup) =>
          acc +
          g.members.reduce(
            (memberAcc: number, m: TontineMember) =>
              memberAcc + m.payments.filter((p: MemberPayment) => p.paid).length * m.amount,
            0
          ),
        0
      ),
    [myTontines]
  );
  const nextTour = useMemo(() => {
    const allTours = myTontines.flatMap((g: TontineGroup) =>
      g.tours.map((t: TontineTour) => ({ ...t, group: g.name, groupId: g.id }))
    );
    const futureTours = allTours.filter((t: { date: Date }) => t.date >= new Date());
    if (!futureTours.length) return null;
    return futureTours.sort((a: { date: Date }, b: { date: Date }) => a.date.getTime() - b.date.getTime())[0];
  }, [myTontines]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMemberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setMemberFormData((prev) => ({ ...prev, [name]: value }));
  };

  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };

  const openModal = (type: 'create' | 'edit' | 'details' | 'join' | 'payment' | 'manage', tontine?: TontineGroup) => {
    setModalType(type);
    setSelectedTontine(tontine || null);
    setFormError(null);

    setFormData({
      name: '',
      description: '',
      montantCotisation: '',
      totalMembers: '',
      frequency: 'monthly',
      rules: ['Paiements obligatoires à date fixe', 'Ordre de réception déterminé par tirage au sort'],
    });

    setMemberFormData({
      name: '',
      amount: '',
    });

    if (type === 'edit' && tontine) {
      setFormData({
        name: tontine.name,
        description: tontine.description,
        montantCotisation: tontine.montantCotisation.toString(),
        totalMembers: tontine.totalRounds.toString(),
        frequency: 'monthly',
        rules: ['Paiements obligatoires à date fixe', 'Ordre de réception déterminé par tirage au sort'],
      });
    }

    setShowModal(true);
  };

  const handleTabFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.description.trim() || !formData.montantCotisation || !formData.totalMembers) {
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
      montantCotisation: parseInt(formData.montantCotisation, 10),
      currentMonth: getCurrentMonth(),
      status: 'pending',
      startDate: new Date().toISOString().split('T')[0],
      totalRounds: parseInt(formData.totalMembers, 10),
    };

    setMyTontines((prev) => [...prev, newTontine]);
    notificationService.createTontineNotification(newTontine, 'created');

    setFormData({
      name: '',
      description: '',
      montantCotisation: '',
      totalMembers: '',
      frequency: 'monthly',
      rules: ['Paiements obligatoires à date fixe', 'Ordre de réception déterminé par tirage au sort'],
    });
    setFormError(null);
    setActiveTab('my-tontines');
  };

  const addMember = () => {
    if (!selectedTontine || !memberFormData.name.trim()) return;

    const newMember: TontineMember = {
      id: `member_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: memberFormData.name,
      amount: parseInt(memberFormData.amount, 10) || selectedTontine.montantCotisation,
      payments: [{ date: selectedTontine.currentMonth, paid: false }],
      createdAt: new Date().toISOString(),
    };

    setMyTontines((prev) =>
      prev.map((tontine) =>
        tontine.id === selectedTontine.id ? { ...tontine, members: [...tontine.members, newMember] } : tontine
      )
    );

    setSelectedTontine((prev) => {
      if (!prev) return prev;
      return { ...prev, members: [...prev.members, newMember] };
    });

    setMemberFormData({ name: '', amount: '' });

    notificationService.createSystemNotification(
      'Membre ajouté',
      `Membre "${newMember.name}" ajouté à la tontine`,
      'success'
    );
  };

  const togglePayment = (memberId: string, paymentDate: string) => {
    if (!selectedTontine) return;

    const member = selectedTontine.members.find((m) => m.id === memberId);
    const payment = member?.payments.find((p) => p.date === paymentDate);
    const newPaidStatus = !payment?.paid;

    setMyTontines((prev) =>
      prev.map((tontine) =>
        tontine.id === selectedTontine.id
          ? {
              ...tontine,
              members: tontine.members.map((m: TontineMember) =>
                m.id === memberId
                  ? {
                      ...m,
                      payments: m.payments.map((p: MemberPayment) =>
                        p.date === paymentDate ? { ...p, paid: !p.paid } : p
                      ),
                    }
                  : m
              ),
            }
          : tontine
      )
    );

    setSelectedTontine((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        members: prev.members.map((m) =>
          m.id === memberId
            ? {
                ...m,
                payments: m.payments.map((p) => (p.date === paymentDate ? { ...p, paid: !p.paid } : p)),
              }
            : m
        ),
      };
    });

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

    const memberToDelete = selectedTontine.members.find((m) => m.id === memberId);

    setMyTontines((prev) =>
      prev.map((tontine) =>
        tontine.id === selectedTontine.id
          ? { ...tontine, members: tontine.members.filter((m: TontineMember) => m.id !== memberId) }
          : tontine
      )
    );

    setSelectedTontine((prev) => {
      if (!prev) return prev;
      return { ...prev, members: prev.members.filter((m) => m.id !== memberId) };
    });

    if (memberToDelete) {
      notificationService.createSystemNotification(
        'Membre supprimé',
        `Membre "${memberToDelete.name}" supprimé de la tontine`,
        'warning'
      );
    }
  };

  const deleteTontine = (id: string) => {
    const tontineToDelete = myTontines.find((t) => t.id === id);
    setMyTontines((prev) => prev.filter((t) => t.id !== id));

    if (tontineToDelete) {
      notificationService.createSystemNotification(
        'Tontine supprimée',
        `Tontine "${tontineToDelete.name}" supprimée`,
        'warning'
      );
    }
  };

  const joinTontine = (tontineId: string) => {
    const tontine = availableTontines.find((t) => t.id === tontineId);
    if (tontine) {
      const updatedTontine = {
        ...tontine,
        members: [
          {
            id: Date.now().toString(),
            name: HIGHLIGHT_MEMBER_NAME,
            amount: tontine.montantCotisation,
            payments: [{ date: getCurrentMonth(), paid: false }],
            createdAt: new Date().toISOString(),
          },
        ],
        status: 'active' as const,
        currentMonth: getCurrentMonth(),
      };
      setMyTontines((prev) => [...prev, updatedTontine]);
      setAvailableTontines((prev) => prev.filter((t) => t.id !== tontineId));
    }
    setShowModal(false);
  };

  const passToNextMonth = () => {
    if (!selectedTontine) return;

    const [year, month] = selectedTontine.currentMonth.split('-').map(Number);
    const nextDate = new Date(year, month, 1);
    const nextMonth = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}`;

    setMyTontines((prev) =>
      prev.map((tontine) =>
        tontine.id === selectedTontine.id
          ? {
              ...tontine,
              currentMonth: nextMonth,
              cycle: Math.min(tontine.cycle + 1, tontine.totalRounds),
              members: tontine.members.map((member: TontineMember) => ({
                ...member,
                payments: [...member.payments, { date: nextMonth, paid: false }],
              })),
            }
          : tontine
      )
    );

    setSelectedTontine((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        currentMonth: nextMonth,
        cycle: Math.min(prev.cycle + 1, prev.totalRounds),
        members: prev.members.map((member) => ({
          ...member,
          payments: [...member.payments, { date: nextMonth, paid: false }],
        })),
      };
    });
  };

  return (
    <div className="p-4 sm:p-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 min-h-screen">
      <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Tontines
            </h1>
            <p className="text-gray-600 text-lg mt-2">Participez à des groupes d&apos;épargne collaborative</p>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-2xl font-medium hover:from-purple-700 hover:to-purple-800 transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl hover:-translate-y-1"
          >
            <Plus className="w-5 h-5" />
            <span>Créer une Tontine</span>
          </button>
        </div>
      </div>

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

      <div className="flex justify-center mb-6">
        <div className="flex bg-white rounded-2xl p-2 shadow-lg border border-gray-100">
          <button
            type="button"
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
            type="button"
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
            type="button"
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
            type="button"
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

      {activeTab === 'my-tontines' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myTontines.map((tontine, index) => (
            <TontineCard
              key={tontine.id}
              variant="owned"
              tontine={tontine}
              colorClass={groupCardColors[index % groupCardColors.length]}
              formatMonth={formatMonth}
              highlightMemberName={HIGHLIGHT_MEMBER_NAME}
              onDetails={() => openModal('details', tontine)}
              onManage={() => openModal('manage', tontine)}
              onDelete={() => deleteTontine(tontine.id)}
            />
          ))}
        </div>
      )}

      {activeTab === 'available' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableTontines.map((tontine, index) => (
            <TontineCard
              key={tontine.id}
              variant="available"
              tontine={tontine}
              colorClass={groupCardColors[index % groupCardColors.length]}
              onDetails={() => openModal('details', tontine)}
              onJoin={() => openModal('join', tontine)}
            />
          ))}
        </div>
      )}

      {activeTab === 'history' && (
        <TontineHistory
          myTontines={myTontines}
          filterTontine={filterTontine}
          setFilterTontine={setFilterTontine}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          filterPeriod={filterPeriod}
          setFilterPeriod={setFilterPeriod}
          availablePeriods={availablePeriods}
        />
      )}

      {activeTab === 'create' && (
        <TontineForm
          formData={formData}
          onChange={handleInputChange}
          onSubmit={handleTabFormSubmit}
          onCancel={() => {
            setFormError(null);
            setActiveTab('my-tontines');
          }}
          error={formError}
        />
      )}

      {showModal && (
        <TontineModal
          modalType={modalType}
          selectedTontine={selectedTontine}
          formError={formError}
          onClose={() => {
            setShowModal(false);
            setFormError(null);
          }}
          formatMonth={formatMonth}
          joinTontine={joinTontine}
          addMember={addMember}
          togglePayment={togglePayment}
          deleteMember={deleteMember}
          passToNextMonth={passToNextMonth}
          memberFormData={memberFormData}
          onMemberInputChange={handleMemberInputChange}
        />
      )}
    </div>
  );
};

export default Tontine;
