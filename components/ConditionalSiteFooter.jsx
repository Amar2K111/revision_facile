"use client";

import { usePathname } from "next/navigation";
import { SiteFooter } from "./SiteFooter";

/** Pas de footer sur les écrans app — évite le chevauchement avec les CTA fixes (quiz, etc.). */
const HIDE_FOOTER_PATHS = ["/reviser", "/fiche", "/onboarding", "/paywall", "/auth"];

export function ConditionalSiteFooter() {
  const pathname = usePathname();
  const hide = HIDE_FOOTER_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
  if (hide) {
    return null;
  }
  return <SiteFooter />;
}
