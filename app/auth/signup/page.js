import { redirect } from "next/navigation";
import { Suspense } from "react";
import SignUpView from "../../../components/auth/SignUpView";
import {
  POST_LOGIN_DEFAULT_PATH,
  resolvePostAuthPath,
} from "../../../lib/authRedirects";
import { fetchProfileForRouting } from "../../../lib/fetchProfileForRouting";
import { createSupabaseServerClient } from "../../../lib/supabase/server";

function SignUpFallback() {
  return (
    <div
      className="mx-auto h-[32rem] w-full max-w-md animate-pulse rounded-[2rem] bg-slate-100/90"
      aria-hidden
    />
  );
}

export default async function SignUpPage({ searchParams }) {
  const sp = (await Promise.resolve(searchParams)) ?? {};
  const rawNext = typeof sp.next === "string" ? sp.next : "";

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    const profile = await fetchProfileForRouting(supabase, user.id);
    redirect(resolvePostAuthPath(profile, rawNext || POST_LOGIN_DEFAULT_PATH));
  }

  return (
    <Suspense fallback={<SignUpFallback />}>
      <SignUpView />
    </Suspense>
  );
}
