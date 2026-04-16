# Checklist sécurité — mise en production (Supabase)

- [ ] **Clés** : uniquement `anon` / `publishable` dans le frontend ; `service_role` réservée au serveur et aux Edge Functions.
- [ ] **RLS** : activé sur toutes les tables applicatives ; aucune policy `USING (true)` / `WITH CHECK (true)`.
- [ ] **Auth** : confirmation e-mail activée si requis ; politique mots de passe forte ; MFA recommandé pour comptes sensibles.
- [ ] **Stockage** : buckets privés ; politiques par dossier `user_id` ; limites MIME et taille (cf. migration `005_storage.sql`).
- [ ] **CORS / redirect URLs** : URLs autorisées dans Supabase Auth alignées avec les domaines de prod.
- [ ] **Secrets** : variables Edge Functions configurées dans le dashboard ; rotation planifiée.
- [ ] **Audit** : logs des actions sensibles (Edge Functions, erreurs critiques) ; surveillance des quotas.
- [ ] **Sauvegardes** : plan de backup / PITR selon l’offre Supabase.
- [ ] **RGPD** : procédure d’export / suppression compte documentée (souvent via Edge Function `service_role` + cascade SQL).
