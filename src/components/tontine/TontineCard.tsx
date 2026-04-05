import React from 'react';
import { Users, Calendar, Clock, Check, Eye, Edit, Trash2 } from 'lucide-react';
import type { TontineGroup, TontineMember, MemberPayment } from '../../types';

type OwnedProps = {
  variant: 'owned';
  tontine: TontineGroup;
  colorClass: string;
  formatMonth: (s: string) => string;
  highlightMemberName: string;
  onDetails: () => void;
  onManage: () => void;
  onDelete: () => void;
};

type AvailableProps = {
  variant: 'available';
  tontine: TontineGroup;
  colorClass: string;
  onDetails: () => void;
  onJoin: () => void;
};

export type TontineCardProps = OwnedProps | AvailableProps;

const TontineCard: React.FC<TontineCardProps> = (props) => {
  if (props.variant === 'available') {
    const { tontine, colorClass, onDetails, onJoin } = props;
    return (
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
        <div className={`h-2 bg-gradient-to-r ${colorClass}`} />
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
                <span className="font-medium text-green-600">
                  {(tontine.montantCotisation * tontine.totalRounds).toLocaleString()} F CFA
                </span>
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                type="button"
                onClick={onDetails}
                className="flex-1 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 py-2 px-3 rounded-xl font-medium hover:from-blue-100 hover:to-blue-200 transition-all duration-300 text-sm"
              >
                👁️ Détails
              </button>
              <button
                type="button"
                onClick={onJoin}
                className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white py-2 px-3 rounded-xl font-medium hover:from-purple-700 hover:to-purple-800 transition-all duration-300 shadow-lg hover:shadow-xl text-sm"
              >
                🤝 Rejoindre
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { tontine, colorClass, formatMonth, highlightMemberName, onDetails, onManage, onDelete } = props;
  const currentPayment = tontine.members
    .find((m: TontineMember) => m.name === highlightMemberName)
    ?.payments.find((p: MemberPayment) => p.date === tontine.currentMonth);
  const allPaid = tontine.members.every(
    (m: TontineMember) => m.payments.find((p: MemberPayment) => p.date === tontine.currentMonth)?.paid
  );
  const progression =
    tontine.totalRounds > 0
      ? Math.min(100, Math.max(0, Math.round(((tontine.cycle - 1) / tontine.totalRounds) * 100)))
      : 0;

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
      <div className={`h-2 bg-gradient-to-r ${colorClass}`} />
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
              type="button"
              onClick={onDetails}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onManage}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onDelete}
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
              />
            </div>
          </div>

          {currentPayment && (
            <div
              className={`flex items-center justify-between p-3 rounded-2xl border ${
                currentPayment.paid ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
              }`}
            >
              <div className="flex items-center space-x-2">
                {currentPayment.paid ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <Clock className="w-5 h-5 text-yellow-600" />
                )}
                <span className={`text-sm font-medium ${currentPayment.paid ? 'text-green-800' : 'text-yellow-800'}`}>
                  {currentPayment.paid ? 'Payé ce mois' : 'Paiement en attente'}
                </span>
              </div>
              {allPaid && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">Tous payés</span>
              )}
            </div>
          )}

          <div className="flex space-x-2">
            <button
              type="button"
              onClick={onDetails}
              className="flex-1 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 py-2 px-3 rounded-xl font-medium hover:from-blue-100 hover:to-blue-200 transition-all duration-300 text-sm"
            >
              👁️ Détails
            </button>
            <button
              type="button"
              onClick={onManage}
              className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white py-2 px-3 rounded-xl font-medium hover:from-purple-700 hover:to-purple-800 transition-all duration-300 shadow-lg hover:shadow-xl text-sm"
            >
              ⚙️ Gérer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TontineCard;
