import { PROFILE_ROUTING_SELECT } from "./profileOnboarding";

/**
 * @param {import("@supabase/supabase-js").SupabaseClient} supabase
 * @param {string} userId
 */
export async function fetchProfileForRouting(supabase, userId) {
  const { data } = await supabase
    .from("profiles")
    .select(PROFILE_ROUTING_SELECT)
    .eq("id", userId)
    .maybeSingle();
  return data ?? null;
}
