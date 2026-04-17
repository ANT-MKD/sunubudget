import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPage: React.FC = () => {
  return (
    <main className="min-h-screen bg-white px-4 py-10 dark:bg-gray-950 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Politique de confidentialite</h1>
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
          Cette page explique les donnees collectees, leur usage et les droits de l’utilisateur.
        </p>

        <section className="mt-8 space-y-5 text-sm leading-6 text-gray-700 dark:text-gray-300">
          <p>
            Nous collectons les informations de compte (e-mail, profil), les donnees financieres saisies volontairement
            (transactions, epargne, tontines) et des metadonnees techniques necessaires au fonctionnement de l’application.
          </p>
          <p>
            Les donnees sont utilisees pour fournir les fonctionnalites de suivi budgetaire, les notifications et la
            synchronisation de votre compte. Elles ne sont pas revendues.
          </p>
          <p>
            La conservation suit les besoins operationnels et vos obligations legales. Vous pouvez demander la suppression
            de votre compte depuis la page Parametres.
          </p>
          <p>
            Vous pouvez exercer vos droits d’acces, de rectification et de suppression en nous contactant via le formulaire
            d’aide integre a l’application.
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

export default PrivacyPage;
