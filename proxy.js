import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import {
  isGuestOnlyHomePath,
  loggedInAppEntryPath,
  onboardingPathWithNext,
  POST_LOGIN_DEFAULT_PATH,
  resolvePostAuthPath,
} from "./lib/authRedirects";
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

function isAuthEntryPath(pathname) {
  return pathname === "/auth" || pathname === "/auth/signin" || pathname === "/auth/signup";
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

  if (user) {
    const profile = await fetchProfileForRouting(supabase, user.id);
    const needsOnboarding = profileNeedsOnboarding(profile);

    if (isGuestOnlyHomePath(pathname)) {
      return NextResponse.redirect(new URL(loggedInAppEntryPath(profile), request.url));
    }

    if (isAuthEntryPath(pathname)) {
      const rawNext = request.nextUrl.searchParams.get("next") ?? "";
      const dest = resolvePostAuthPath(profile, rawNext || POST_LOGIN_DEFAULT_PATH);
      return NextResponse.redirect(new URL(dest, request.url));
    }

    if (needsOnboarding && isProtectedPath(pathname) && !isOnboardingExempt(pathname)) {
      const nextPath = `${pathname}${request.nextUrl.search}`;
      return NextResponse.redirect(new URL(onboardingPathWithNext(nextPath), request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
