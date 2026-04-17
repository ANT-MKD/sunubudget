import React, { useRef, useState } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Edit, Camera, Shield, CreditCard, X } from 'lucide-react';
import { useTransactions, useSavingsGoals, useChallenges, useUserProfile } from '../hooks/useStorage';
import { fileToAvatarDataUrl } from '../lib/profilePhoto';

const Profile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Utiliser les hooks pour récupérer les vraies données
  const { transactions } = useTransactions();
  const { savingsGoals } = useSavingsGoals();
  const { challenges } = useChallenges();
  const { profileData, setProfileData, saveProfile } = useUserProfile();

  // Calculer les statistiques basées sur les vraies données
  const totalTransactions = transactions.length;
  const completedGoals = savingsGoals.filter(goal => goal.percentage >= 100).length;
  const activeChallenges = challenges.filter(challenge => challenge.status === 'active').length;
  const completedChallenges = challenges.filter(challenge => challenge.status === 'completed').length;

  // Calculer le niveau basé sur les réalisations
  const getLevel = () => {
    const totalAchievements = completedGoals + completedChallenges + Math.floor(totalTransactions / 10);
    if (totalAchievements >= 50) return 'Expert';
    if (totalAchievements >= 30) return 'Avancé';
    if (totalAchievements >= 15) return 'Intermédiaire';
    return 'Débutant';
  };

  // Calculer la durée d'adhésion
  const getMemberSince = () => {
    const memberSince = new Date(profileData.memberSince);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - memberSince.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffYears = Math.floor(diffDays / 365);
    const diffMonths = Math.floor((diffDays % 365) / 30);
    
    if (diffYears > 0) {
      return `${diffYears} an${diffYears > 1 ? 's' : ''}`;
    } else if (diffMonths > 0) {
      return `${diffMonths} mois`;
    } else {
      return `${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSave = () => {
    void (async () => {
      setSaveError(null);
      try {
        await saveProfile(profileData);
        setIsEditing(false);
      } catch (e) {
        setSaveError(e instanceof Error ? e.message : 'Enregistrement impossible.');
      }
    })();
  };

  const initials = `${profileData.firstName?.trim()?.[0] || '?'}${
    profileData.lastName?.trim()?.[0] || '?'
  }`.toUpperCase();

  const handleAvatarPick = () => {
    setAvatarError(null);
    fileInputRef.current?.click();
  };

  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setAvatarError(null);
    try {
      const dataUrl = await fileToAvatarDataUrl(file);
      setProfileData((prev) => ({ ...prev, avatarUrl: dataUrl }));
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : 'Impossible de charger l’image.');
    }
  };

  const clearAvatar = () => {
    setAvatarError(null);
    setProfileData((prev) => ({ ...prev, avatarUrl: '' }));
  };

  const accountStats = [
    { label: 'Membre depuis', value: getMemberSince(), icon: Calendar },
    { label: 'Transactions totales', value: totalTransactions.toString(), icon: CreditCard },
    { label: 'Objectifs atteints', value: completedGoals.toString(), icon: Shield },
    { label: 'Niveau actuel', value: getLevel(), icon: User },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-white to-gray-50 p-4 pb-24 dark:from-gray-900 dark:to-gray-800 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 mb-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">Mon Profil</h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">Gérez vos informations personnelles et préférences</p>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-3 rounded-2xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg"
          >
            <Edit className="w-5 h-5" />
            <span>{isEditing ? 'Annuler' : 'Modifier'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 mb-6">
            <div className="text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleAvatarFile}
              />
              <div className="relative inline-block mb-4">
                <div className="w-24 h-24 overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold ring-2 ring-white dark:ring-gray-800 shadow-lg">
                  {profileData.avatarUrl ? (
                    <img
                      src={profileData.avatarUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span>{initials}</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleAvatarPick}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center border-2 border-gray-100 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  title="Changer la photo"
                  aria-label="Changer la photo de profil"
                >
                  <Camera className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>
                {profileData.avatarUrl && (
                  <button
                    type="button"
                    onClick={clearAvatar}
                    className="absolute -top-1 -left-1 w-7 h-7 bg-red-500 text-white rounded-full shadow flex items-center justify-center hover:bg-red-600 transition-colors"
                    title="Supprimer la photo"
                    aria-label="Supprimer la photo de profil"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              {avatarError && (
                <p className="mb-2 text-xs text-red-600 dark:text-red-400 px-2">{avatarError}</p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Jusqu’à ~850&nbsp;Ko · JPEG, PNG, WebP…</p>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{profileData.firstName} {profileData.lastName}</h2>
              <p className="text-gray-600 dark:text-gray-400">{profileData.occupation}</p>
              <div className="mt-4 flex items-center justify-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {profileData.address}
                </div>
              </div>
            </div>
          </div>

          {/* Account Stats */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Statistiques du Compte</h3>
            <div className="space-y-4">
              {accountStats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                        <Icon className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="text-gray-700">{stat.label}</span>
                    </div>
                    <span className="font-bold text-gray-900">{stat.value}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Informations Personnelles</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Prénom</label>
                <input
                  type="text"
                  name="firstName"
                  value={profileData.firstName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-gray-900 disabled:text-gray-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nom</label>
                <input
                  type="text"
                  name="lastName"
                  value={profileData.lastName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-gray-900 disabled:text-gray-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-gray-900 disabled:text-gray-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Téléphone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="tel"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-gray-900 disabled:text-gray-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Adresse</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    name="address"
                    value={profileData.address}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-gray-900 disabled:text-gray-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date de naissance</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="date"
                    name="birthDate"
                    value={profileData.birthDate}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-gray-900 disabled:text-gray-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Profession</label>
                <input
                  type="text"
                  name="occupation"
                  value={profileData.occupation}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-gray-900 disabled:text-gray-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Revenu mensuel (F CFA)</label>
                <input
                  type="number"
                  name="monthlyIncome"
                  inputMode="numeric"
                  value={profileData.monthlyIncome}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-gray-900 disabled:text-gray-500 transition-all"
                />
              </div>
            </div>

            {isEditing && (
              <div className="mt-6 space-y-4">
                {saveError && (
                  <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-500/40 dark:bg-red-950/50 dark:text-red-200" role="alert">
                    {saveError}
                  </p>
                )}
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    Sauvegarder
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;