import React from 'react';
import { Users, Calendar } from 'lucide-react';
import type { TontineGroup, TontineMember, MemberPayment } from '../../types';
import { groupCardColors } from './constants';

type TontineHistoryProps = {
  myTontines: TontineGroup[];
  filterTontine: string;
  setFilterTontine: (v: string) => void;
  filterStatus: string;
  setFilterStatus: (v: string) => void;
  filterPeriod: string;
  setFilterPeriod: (v: string) => void;
  availablePeriods: { value: string; label: string }[];
};

const TontineHistory: React.FC<TontineHistoryProps> = ({
  myTontines,
  filterTontine,
  setFilterTontine,
  filterStatus,
  setFilterStatus,
  filterPeriod,
  setFilterPeriod,
  availablePeriods,
}) => (
  <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 border-b border-gray-100">
      <h3 className="text-2xl font-bold text-gray-900 mb-2">Historique des Paiements</h3>
      <p className="text-gray-600">Suivi complet de tous les paiements effectués dans vos tontines</p>
    </div>

    <div className="p-6">
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
              myTontines.map((tontine) => (
                <option key={tontine.id} value={tontine.id}>
                  {tontine.name}
                </option>
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
            {availablePeriods.map((period) => (
              <option key={period.value} value={period.value}>
                {period.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {(() => {
        if (!filterTontine || filterTontine === '') {
          return (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune tontine sélectionnée</h3>
              <p className="text-gray-600">Veuillez sélectionner une tontine pour voir l&apos;historique des paiements</p>
            </div>
          );
        }

        if (availablePeriods.length === 0) {
          return (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune période disponible</h3>
              <p className="text-gray-600">Aucune période n&apos;est disponible pour cette tontine</p>
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
              tontineColor: groupCardColors[myTontines.indexOf(tontine) % groupCardColors.length],
            }))
          )
        );

        const filteredPayments = allPayments.filter((payment) => {
          const matchesTontine = payment.tontineId === filterTontine;
          const matchesStatus =
            !filterStatus ||
            (filterStatus === 'paid' && payment.paid) ||
            (filterStatus === 'unpaid' && !payment.paid);
          const matchesPeriod = payment.date === filterPeriod;

          return matchesTontine && matchesStatus && matchesPeriod;
        });

        return (
          <>
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
                              {payment.memberName
                                .split(' ')
                                .map((n: string) => n[0])
                                .join('')}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{payment.memberName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div
                            className={`w-3 h-3 rounded-full mr-2 ${payment.tontineColor
                              .replace('bg-gradient-to-r from-', 'bg-')
                              .replace(' to-pink-200', '')
                              .replace(' to-blue-200', '')
                              .replace(' to-green-200', '')
                              .replace(' to-yellow-200', '')
                              .replace(' to-purple-200', '')
                              .replace(' to-orange-200', '')
                              .replace(' to-teal-200', '')}`}
                          />
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
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                            payment.paid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {payment.paid ? '✅ Payé' : '❌ Non payé'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredPayments.length === 0 && (
              <div className="text-center py-8">
                <div className="text-gray-500 text-lg mb-2">Aucun paiement trouvé</div>
                <div className="text-gray-400 text-sm">Essayez de modifier vos filtres</div>
              </div>
            )}

            {filteredPayments.length !== allPayments.length && (
              <div className="mt-4 text-sm text-gray-600">
                Affichage de {filteredPayments.length} paiement{filteredPayments.length > 1 ? 's' : ''} sur{' '}
                {allPayments.length}
              </div>
            )}

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium text-green-800">Paiements Effectués</h4>
                  <div className="w-8 h-8 bg-green-200 rounded-lg flex items-center justify-center">
                    <span className="text-green-700 font-bold">✓</span>
                  </div>
                </div>
                <div className="text-2xl font-bold text-green-700">{filteredPayments.filter((p) => p.paid).length}</div>
                <div className="text-sm text-green-600">Paiements validés</div>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6 border border-red-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium text-red-800">Paiements en Attente</h4>
                  <div className="w-8 h-8 bg-red-200 rounded-lg flex items-center justify-center">
                    <span className="text-red-700 font-bold">⏳</span>
                  </div>
                </div>
                <div className="text-2xl font-bold text-red-700">{filteredPayments.filter((p) => !p.paid).length}</div>
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
                  {filteredPayments.filter((p) => p.paid).reduce((sum, p) => sum + p.amount, 0).toLocaleString()} F CFA
                </div>
                <div className="text-sm text-blue-600">Cotisations payées</div>
              </div>
            </div>
          </>
        );
      })()}
    </div>
  </div>
);

export default TontineHistory;
