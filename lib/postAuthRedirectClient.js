import { resolvePostAuthPath } from "./authRedirects";
import { fetchProfileForRouting } from "./fetchProfileForRouting";

/**
 * Après connexion côté client : lit le profil et renvoie la route (onboarding ou `next`).
 * @param {import("@supabase/supabase-js").SupabaseClient} supabase
 * @param {string} userId
 * @param {string} [rawNext]
 */
export async function resolvePostAuthPathClient(supabase, userId, rawNext) {
  const profile = await fetchProfileForRouting(supabase, userId);
  return resolvePostAuthPath(profile, rawNext);
}
