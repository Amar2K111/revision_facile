/** Chemin par défaut après connexion réussie (génération de fiches). */
export const POST_LOGIN_DEFAULT_PATH = "/reviser";

/** Évite de renvoyer vers l’accueil ou les écrans auth après login. */
function isUnwantedPostLoginPath(pathname) {
  if (pathname === "/") return true;
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
