import { POST_LOGIN_DEFAULT_PATH } from "../authRedirects";
import { createSupabaseBrowserClient } from "../supabase/client";

/**
 * Démarre le flux OAuth Google (PKCE). Redirige le navigateur vers Google puis revient sur /auth/callback.
 * @param {string} nextPath chemin relatif après succès (ex. /reviser)
 * @returns {Promise<{ ok: true } | { ok: false, message: string }>}
 */
export async function signInWithGoogleClient(nextPath) {
  try {
    const supabase = createSupabaseBrowserClient();
    const next =
      typeof nextPath === "string" && nextPath.startsWith("/") ? nextPath : POST_LOGIN_DEFAULT_PATH;
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        // Interface Google (sélection de compte, consentement) en français par défaut.
        queryParams: { hl: "fr" },
      },
    });

    if (error) {
      return { ok: false, message: error.message };
    }
    if (data?.url) {
      window.location.assign(data.url);
      return { ok: true };
    }
    return { ok: false, message: "Réponse OAuth invalide." };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Connexion Google impossible.";
    return { ok: false, message };
  }
}
