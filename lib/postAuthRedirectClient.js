import { resolvePostAuthPath } from "./authRedirects";
import { fetchProfileForRouting } from "./fetchProfileForRouting";

/**
 * Après connexion côté client : lit le profil et renvoie la route (onboarding ou `next`).
 * @param {import("@supabase/supabase-js").SupabaseClient} supabase
 * @param {string} userId
 * @param {string} [rawNext]
 * @param {{ profileRetries?: number }} [options]
 */
export async function resolvePostAuthPathClient(supabase, userId, rawNext, options = {}) {
  const { profileRetries = 0 } = options;
  let profile = await fetchProfileForRouting(supabase, userId);
  let attempts = 0;
  while (profile === null && attempts < profileRetries) {
    await new Promise((resolve) => {
      setTimeout(resolve, 250);
    });
    profile = await fetchProfileForRouting(supabase, userId);
    attempts += 1;
  }
  return resolvePostAuthPath(profile, rawNext);
}
