/**
 * Valide les variables d'environnement requises au démarrage.
 * Seules les clés préfixées VITE_ sont injectées par Vite dans le bundle client.
 */
function assertValidSupabaseUrl(raw: string): void {
  const url = raw.trim();
  let hostname: string;
  try {
    hostname = new URL(url).hostname.toLowerCase();
  } catch {
    // eslint-disable-next-line no-console
    console.error('[SunuBudget] VITE_SUPABASE_URL doit être une URL valide, ex. https://abcdefgh.supabase.co');
    throw new Error('Configuration Supabase : VITE_SUPABASE_URL invalide');
  }

  if (hostname === 'placeholder.supabase.co') {
    // eslint-disable-next-line no-console
    console.error(
      '[SunuBudget] VITE_SUPABASE_URL utilise encore l’URL factice « placeholder.supabase.co ». ' +
        'Remplacez-la par l’URL de VOTRE projet : Supabase → Project Settings → API → Project URL.'
    );
    throw new Error(
      'Remplacez placeholder.supabase.co par l’URL réelle du projet (Settings → API → Project URL).'
    );
  }
}

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

  assertValidSupabaseUrl(url);

  if (typeof anon !== 'string' || anon.trim() === '') {
    // eslint-disable-next-line no-console
    console.error(
      '[SunuBudget] Variable manquante ou vide : VITE_SUPABASE_ANON_KEY. Utilisez uniquement la clé anon (jamais la service_role côté client).'
    );
    throw new Error('Configuration Supabase incomplète : VITE_SUPABASE_ANON_KEY');
  }
}
