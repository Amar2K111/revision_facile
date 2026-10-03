import { profileNeedsOnboarding } from "./profileOnboarding";

/** Chemin par défaut après connexion réussie (génération de fiches). */
export const POST_LOGIN_DEFAULT_PATH = "/reviser";

/** Landing marketing : réservée aux visiteurs non connectés. */
export const GUEST_ONLY_HOME_PATH = "/";

export const ONBOARDING_PATH = "/onboarding";

/** @param {string} pathname */
export function isGuestOnlyHomePath(pathname) {
  return pathname === GUEST_ONLY_HOME_PATH;
}

/**
 * Où envoyer un utilisateur connecté qui tente d’ouvrir l’accueil ou finit sa connexion.
 * @param {{ onboarding_completed_at?: string | null, is_premium?: boolean | null, premium_until?: string | null } | null | undefined} profile
 */
export function loggedInAppEntryPath(profile) {
  return resolvePostAuthPath(profile, POST_LOGIN_DEFAULT_PATH);
}

/** Évite de renvoyer vers l’accueil ou les écrans auth après login. */
function isUnwantedPostLoginPath(pathname) {
  if (isGuestOnlyHomePath(pathname)) return true;
  return pathname === "/auth" || pathname.startsWith("/auth/");
}

/** Cible après connexion / OAuth : chemin relatif interne uniquement. */
export function sanitizeNextPath(raw) {
  if (typeof raw !== "string") {
    return POST_LOGIN_DEFAULT_PATH;
  }
  let path = raw.trim();
  if (path.length === 0) {
    return POST_LOGIN_DEFAULT_PATH;
  }
  try {
    path = decodeURIComponent(path);
  } catch {
    return POST_LOGIN_DEFAULT_PATH;
  }
  if (!path.startsWith("/") || path.startsWith("//")) {
    return POST_LOGIN_DEFAULT_PATH;
  }
  const pathnameOnly = path.split("?")[0] ?? path;
  if (isUnwantedPostLoginPath(pathnameOnly)) {
    return POST_LOGIN_DEFAULT_PATH;
  }
  return path;
}

/** Évite de boucler sur l’onboarding dans `next`. */
function isOnboardingPath(pathname) {
  return pathname === ONBOARDING_PATH || pathname.startsWith(`${ONBOARDING_PATH}/`);
}

/**
 * URL d’onboarding avec `next` préservé pour après complétion.
 * @param {string} [rawNext]
 */
export function onboardingPathWithNext(rawNext) {
  const next = sanitizeNextPath(rawNext ?? "");
  const params = new URLSearchParams();
  if (next && next !== POST_LOGIN_DEFAULT_PATH) {
    params.set("next", next);
  } else if (typeof rawNext === "string" && rawNext.trim().length > 0) {
    const sanitized = sanitizeNextPath(rawNext);
    if (sanitized !== ONBOARDING_PATH && !isOnboardingPath(sanitized.split("?")[0] ?? sanitized)) {
      params.set("next", sanitized);
    }
  }
  const q = params.toString();
  return q ? `${ONBOARDING_PATH}?${q}` : ONBOARDING_PATH;
}

/**
 * Cible après login / OAuth / complétion onboarding.
 * Profil incomplet → onboarding (puis `next`, par défaut `/reviser`).
 * @param {{ onboarding_completed_at?: string | null, is_premium?: boolean | null, premium_until?: string | null } | null | undefined} profile
 * @param {string} [rawNext]
 */
export function resolvePostAuthPath(profile, rawNext) {
  const next = rawNext?.trim() ? rawNext : POST_LOGIN_DEFAULT_PATH;
  if (profileNeedsOnboarding(profile)) {
    return onboardingPathWithNext(next);
  }
  return sanitizeNextPath(next);
}

/** Alias explicite après création de compte (même règle : onboarding d’abord si besoin). */
export const resolvePostSignupPath = resolvePostAuthPath;
