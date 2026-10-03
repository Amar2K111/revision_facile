import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { onboardingPathWithNext } from "./lib/authRedirects";
import { fetchProfileForRouting } from "./lib/fetchProfileForRouting";
import { profileNeedsOnboarding } from "./lib/profileOnboarding";
import { getSupabaseConfigSafe } from "./lib/supabase/env";

const PROTECTED_PREFIXES = ["/reviser", "/fiche", "/paywall"];
const ONBOARDING_PATH = "/onboarding";
const API_ONBOARDING_PATH = "/api/onboarding";

function isProtectedPath(pathname) {
  return PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function isOnboardingExempt(pathname) {
  return (
    pathname === ONBOARDING_PATH ||
    pathname.startsWith(`${ONBOARDING_PATH}/`) ||
    pathname === API_ONBOARDING_PATH
  );
}

export async function proxy(request) {
  const config = getSupabaseConfigSafe();
  if (!config) {
    return NextResponse.next({ request });
  }

  const { url, anonKey } = config;
  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
        if (headers && typeof headers === "object") {
          Object.entries(headers).forEach(([key, value]) => {
            response.headers.set(key, value);
          });
        }
      },
    },
  });

  await supabase.auth.getClaims();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  if (!user && isProtectedPath(pathname)) {
    const redirectUrl = new URL("/auth/signin", request.url);
    const nextPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;
    redirectUrl.searchParams.set("next", nextPath || "/reviser");
    return NextResponse.redirect(redirectUrl);
  }

  if (user && !isOnboardingExempt(pathname)) {
    const needsGate = isProtectedPath(pathname) || pathname === "/";
    if (needsGate) {
      const profile = await fetchProfileForRouting(supabase, user.id);
      if (profileNeedsOnboarding(profile)) {
        const nextPath = `${pathname}${request.nextUrl.search}`;
        const dest = new URL(onboardingPathWithNext(nextPath), request.url);
        return NextResponse.redirect(dest);
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
