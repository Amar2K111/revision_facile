import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../lib/supabase/server";
import {
  POST_LOGIN_DEFAULT_PATH,
  resolvePostAuthPath,
  sanitizeNextPath,
} from "../../../lib/authRedirects";
import { fetchProfileForRouting } from "../../../lib/fetchProfileForRouting";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = sanitizeNextPath(searchParams.get("next") ?? "");

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const profile = user ? await fetchProfileForRouting(supabase, user.id) : null;
      const path = resolvePostAuthPath(profile, searchParams.get("next") ?? next);
      const dest = new URL(path, request.url);
      return NextResponse.redirect(dest);
    }
  }

  const fail = new URL("/auth/signin", request.url);
  fail.searchParams.set("error", "oauth");
  fail.searchParams.set("next", POST_LOGIN_DEFAULT_PATH);
  return NextResponse.redirect(fail);
}
