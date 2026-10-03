import { createClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "./env";

/**
 * Client Supabase avec la clé service_role (serveur uniquement, jamais NEXT_PUBLIC_).
 * Contourne RLS — à utiliser seulement pour webhooks / tâches admin.
 */
export function createSupabaseAdminClient() {
  const { url } = getSupabaseConfig();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!serviceKey) {
    return null;
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
