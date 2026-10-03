import { redirect } from "next/navigation";
import { HomeCtaAuth, HomeHeaderAuth, HomeHeroAuth } from "../components/HomeAuthButtons";
import { LoggedInHomeRedirect } from "../components/LoggedInHomeRedirect";
import { SiteLogo } from "../components/SiteLogo";
import { POST_LOGIN_DEFAULT_PATH, resolvePostAuthPath } from "../lib/authRedirects";
import { fetchProfileForRouting } from "../lib/fetchProfileForRouting";
import { createSupabaseServerClient } from "../lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata = {
  title: {
    absolute: "Fiches de révision Bac 2027 — Terminale | Révision facile",
  },
  description:
    "Tu passes le Bac en 2027 ? Fiche claire + quiz sur la notion que tu choisis. Révision ciblée, alignée sur le programme — sans promesse miracle.",
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    const profile = await fetchProfileForRouting(supabase, user.id);
    redirect(resolvePostAuthPath(profile, POST_LOGIN_DEFAULT_PATH));
  }

  return (
    <div className="min-h-dvh bg-gradient-to-b from-indigo-50/80 via-slate-50 to-slate-50">
      <LoggedInHomeRedirect />
      <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-slate-50/85 pt-safe backdrop-blur-md">
        <div className="mx-auto flex min-h-14 w-full max-w-6xl items-center justify-between px-4 sm:min-h-16 sm:px-8">
          <SiteLogo />
          <HomeHeaderAuth />
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-4 pb-12 pt-10 sm:px-8 sm:pb-20 sm:pt-16">
          <div className="mx-auto max-w-3xl text-center">
            <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center sm:gap-3">
              <p className="inline-flex rounded-full border border-indigo-300/90 bg-indigo-600 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white shadow-sm shadow-indigo-600/25 sm:text-xs">
                Bac 2027
              </p>
              <p className="text-[11px] font-medium text-slate-500 sm:text-xs">
                aussi Brevet · BTS
              </p>
            </div>
            <h1 className="mt-5 font-[family-name:var(--font-geist-sans)] text-[1.75rem] font-semibold leading-tight tracking-tight text-slate-900 sm:mt-6 sm:text-4xl sm:leading-[1.12] md:text-[2.75rem]">
              Tu procrastines{" "}
              <span className="text-indigo-700">pour le Bac ?</span>
            </h1>
            <p className="mx-auto mt-5 max-w-lg text-pretty text-base leading-relaxed text-slate-700 sm:mt-6 sm:text-lg">
              Tu choisis ta spé et ton chapitre — on te génère la fiche + le quiz. Tu révises
              l’essentiel, sans te noyer dans le cours.
            </p>
            <div className="mt-8 sm:mt-10">
              <HomeHeroAuth />
            </div>
          </div>
        </section>

        <section className="border-t border-slate-200/80 bg-indigo-600 py-14 sm:py-16">
          <div className="mx-auto max-w-3xl px-5 text-center sm:px-8">
            <h2 className="font-[family-name:var(--font-geist-sans)] text-xl font-semibold text-white sm:text-2xl">
              Prêt à réviser pour le Bac ?
            </h2>
            <p className="mt-3 text-sm text-indigo-100 sm:text-base">
              Spé, matière, chapitre — chaque notion compte.
            </p>
            <HomeCtaAuth />
          </div>
        </section>
      </main>
    </div>
  );
}
