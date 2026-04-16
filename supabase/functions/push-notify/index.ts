/**
 * Edge Function (Deno) — exemple de notification push sécurisée.
 * Déployer avec : supabase functions deploy push-notify --no-verify-jwt (ou avec JWT selon votre config).
 *
 * Variables secrètes (Dashboard > Edge Functions) : SERVICE_ROLE, VAPID keys — jamais dans le client.
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const admin = createClient(supabaseUrl, serviceKey);

    const jwt = authHeader.replace('Bearer ', '');
    const {
      data: { user },
      error: userErr,
    } = await admin.auth.getUser(jwt);
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = (await req.json()) as { title?: string; message?: string; kind?: string };
    const title = typeof body.title === 'string' ? body.title.slice(0, 120) : 'Notification';
    const message = typeof body.message === 'string' ? body.message.slice(0, 500) : '';

    // Ici : envoi Web Push réel (web-push + clés VAPID) ou enqueue vers une file.
    // On journalise côté serveur uniquement.
    console.log('[push-notify]', { userId: user.id, kind: body.kind, title });

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
