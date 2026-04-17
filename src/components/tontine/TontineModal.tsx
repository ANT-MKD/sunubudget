import React from 'react';
import { X } from 'lucide-react';
import type { TontineGroup } from '../../types';

type MemberFormData = { name: string; amount: string };

type TontineModalProps = {
  modalType: 'create' | 'edit' | 'details' | 'join' | 'payment' | 'manage';
  selectedTontine: TontineGroup | null;
  formError: string | null;
  onClose: () => void;
  formatMonth: (monthStr: string) => string;
  joinTontine: (tontineId: string) => void;
  addMember: () => void;
  togglePayment: (memberId: string, paymentDate: string) => void;
  deleteMember: (memberId: string) => void;
  passToNextMonth: () => void;
  memberFormData: MemberFormData;
  onMemberInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const TontineModal: React.FC<TontineModalProps> = ({
  modalType,
  selectedTontine,
  formError,
  onClose,
  formatMonth,
  joinTontine,
  addMember,
  togglePayment,
  deleteMember,
  passToNextMonth,
  memberFormData,
  onMemberInputChange,
}) => (
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
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {formError && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{formError}</div>
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
                  <div className="font-bold text-blue-600">
                    {selectedTontine.cycle}/{selectedTontine.totalRounds}
                  </div>
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
                  const currentPayment = member.payments.find((p) => p.date === selectedTontine.currentMonth);
                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {member.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </div>
                        <span className="font-medium text-gray-900">{member.name}</span>
                      </div>
                      {currentPayment && (
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            currentPayment.paid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
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
                <div className="text-2xl font-bold text-green-700">
                  {selectedTontine.montantCotisation.toLocaleString()} F CFA
                </div>
              </div>
              <div className="bg-blue-50 rounded-2xl p-6">
                <div className="text-sm text-blue-600 font-medium mb-1">Pot total</div>
                <div className="text-2xl font-bold text-blue-700">
                  {(selectedTontine.montantCotisation * selectedTontine.totalRounds).toLocaleString()} F CFA
                </div>
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
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => joinTontine(selectedTontine.id)}
                className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-8 py-3 rounded-xl font-medium hover:from-purple-700 hover:to-purple-800 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Confirmer l&apos;adhésion
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

            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h4 className="font-bold text-gray-900 mb-4">Ajouter un membre</h4>
              <div className="flex space-x-4">
                <input
                  type="text"
                  name="name"
                  value={memberFormData.name}
                  onChange={onMemberInputChange}
                  placeholder="Nom du membre"
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
                <input
                  type="number"
                  name="amount"
                  inputMode="numeric"
                  value={memberFormData.amount}
                  onChange={onMemberInputChange}
                  placeholder={selectedTontine.montantCotisation.toString()}
                  className="w-32 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={addMember}
                  className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-xl font-medium hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Ajouter
                </button>
              </div>
            </div>

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
                      const currentPayment = member.payments.find((p) => p.date === selectedTontine.currentMonth);
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
                                type="button"
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
                                type="button"
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

            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
              <h4 className="font-bold text-blue-900 mb-4">Gestion des Tours</h4>
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-blue-700 mb-1">Mois actuel: {formatMonth(selectedTontine.currentMonth)}</div>
                  <div className="text-sm text-blue-700">
                    Membres payés:{' '}
                    {
                      selectedTontine.members.filter((m) => m.payments.find((p) => p.date === selectedTontine.currentMonth)?.paid)
                        .length
                    }
                    /{selectedTontine.members.length}
                  </div>
                </div>
                <button
                  type="button"
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
);

export default TontineModal;
