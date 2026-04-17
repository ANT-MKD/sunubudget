import React from 'react';
import { Link } from 'react-router-dom';

const TermsPage: React.FC = () => {
  return (
    <main className="min-h-screen bg-white px-4 py-10 dark:bg-gray-950 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Conditions d’utilisation</h1>
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
          En utilisant SunuBudget, vous acceptez les conditions ci-dessous.
        </p>

        <section className="mt-8 space-y-5 text-sm leading-6 text-gray-700 dark:text-gray-300">
          <p>
            Vous etes responsable de l’exactitude des donnees saisies. L’application fournit une aide a la gestion
            budgetaire mais ne constitue pas un conseil financier personnalise.
          </p>
          <p>
            Vous vous engagez a proteger vos identifiants de connexion et a ne pas partager un acces non autorise a votre
            compte.
          </p>
          <p>
            Nous pouvons faire evoluer le service, corriger des bugs ou suspendre temporairement certaines fonctionnalites
            pour maintenance.
          </p>
          <p>
            Vous pouvez cesser d’utiliser l’application a tout moment et demander la suppression de vos donnees depuis la
            zone dediee dans Parametres.
          </p>
        </section>

        <div className="mt-10">
          <Link to="/" className="text-sm font-medium text-emerald-600 hover:underline">
            Retour a l’accueil
          </Link>
        </div>
      </div>
    </main>
  );
};

export default TermsPage;
