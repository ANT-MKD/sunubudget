/**
 * Valide les variables d'environnement requises au démarrage.
 * Seules les clés préfixées VITE_ sont injectées par Vite dans le bundle client.
 */
export function validateEnv(): void {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (typeof url !== 'string' || url.trim() === '') {
    // eslint-disable-next-line no-console
    console.error(
      '[SunuBudget] Variable manquante ou vide : VITE_SUPABASE_URL. Créez un fichier .env à la racine du projet.'
    );
    throw new Error('Configuration Supabase incomplète : VITE_SUPABASE_URL');
  }

  if (typeof anon !== 'string' || anon.trim() === '') {
    // eslint-disable-next-line no-console
    console.error(
      '[SunuBudget] Variable manquante ou vide : VITE_SUPABASE_ANON_KEY. Utilisez uniquement la clé anon (jamais la service_role côté client).'
    );
    throw new Error('Configuration Supabase incomplète : VITE_SUPABASE_ANON_KEY');
  }
}
