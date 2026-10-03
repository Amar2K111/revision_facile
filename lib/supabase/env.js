/** @returns {{ url: string, anonKey: string }} */
export function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    "";
  if (!url || !anonKey) {
    throw new Error(
      "Variables Supabase manquantes : définis NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY (ou NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) dans .env.local",
    );
  }
  return { url, anonKey };
}

/** Same as getSupabaseConfig but never throws (for proxy when env not set yet). */
export function getSupabaseConfigSafe() {
  try {
    return getSupabaseConfig();
  } catch {
    return null;
  }
}
