import React from 'react';

export type TontineFormData = {
  name: string;
  description: string;
  montantCotisation: string;
  totalMembers: string;
  frequency: string;
  rules: string[];
};

type TontineFormProps = {
  formData: TontineFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  error?: string | null;
};

const TontineForm: React.FC<TontineFormProps> = ({ formData, onChange, onSubmit, onCancel, error }) => (
  <div className="max-w-3xl mx-auto">
    <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Créer une Nouvelle Tontine</h3>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</div>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nom de la tontine</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={onChange}
              placeholder="Ex: Tontine du quartier"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Montant mensuel (F CFA)</label>
            <input
              type="number"
              name="montantCotisation"
              inputMode="numeric"
              value={formData.montantCotisation}
              onChange={onChange}
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
            onChange={onChange}
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
              inputMode="numeric"
              value={formData.totalMembers}
              onChange={onChange}
              placeholder="12"
              min={3}
              max={50}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fréquence</label>
            <select
              name="frequency"
              value={formData.frequency}
              onChange={onChange}
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
            onClick={onCancel}
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
);

export default TontineForm;
