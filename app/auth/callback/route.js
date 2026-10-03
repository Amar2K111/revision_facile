import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../lib/supabase/server";
import { POST_LOGIN_DEFAULT_PATH, resolvePostAuthPath } from "../../../lib/authRedirects";
import { fetchProfileForRouting } from "../../../lib/fetchProfileForRouting";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next") ?? POST_LOGIN_DEFAULT_PATH;

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const profile = user ? await fetchProfileForRouting(supabase, user.id) : null;
      const path = resolvePostAuthPath(profile, rawNext);
      const dest = new URL("/auth/continue", request.url);
      dest.searchParams.set("next", path);
      return NextResponse.redirect(dest);
    }
  }

  const fail = new URL("/auth/signin", request.url);
  fail.searchParams.set("error", "oauth");
  fail.searchParams.set("next", POST_LOGIN_DEFAULT_PATH);
  return NextResponse.redirect(fail);
}
