/**
 * Messages auth en français (Supabase renvoie souvent de l’anglais brut).
 * @param {string | undefined | null} message
 * @param {string} fallback
 */
export function mapAuthErrorMessage(message, fallback) {
  const raw = message?.trim() ?? "";
  const lower = raw.toLowerCase();

  if (!raw) {
    return fallback;
  }

  if (lower.includes("rate limit") || lower.includes("too many requests")) {
    return "Trop d’e-mails envoyés récemment. Attends 1 à 2 minutes avant de réessayer, ou vérifie ta boîte mail (et les spams).";
  }

  if (lower.includes("already registered") || lower.includes("user already")) {
    return "Un compte existe déjà avec cet e-mail.";
  }

  if (lower.includes("invalid login") || lower.includes("invalid credentials")) {
    return "E-mail ou mot de passe incorrect.";
  }

  if (lower.includes("email not confirmed")) {
    return "Confirme d’abord ton e-mail via le lien reçu par mail.";
  }

  if (lower.includes("signup is disabled")) {
    return "Les inscriptions sont temporairement désactivées.";
  }

  return raw;
}
