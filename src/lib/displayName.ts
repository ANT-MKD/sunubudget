/** Dérive un prénom lisible depuis l’email (démo sans profil serveur). */
export function displayNameFromEmail(email: string): string {
  const local = email.split('@')[0]?.trim() || '';
  if (!local) return 'Utilisateur';
  const words = local.replace(/[._+-]+/g, ' ').split(/\s+/).filter(Boolean);
  return words
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}
