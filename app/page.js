import { redirect } from "next/navigation";
import { HomeCtaAuth, HomeHeaderAuth, HomeHeroAuth } from "../components/HomeAuthButtons";
import { SiteLogo } from "../components/SiteLogo";
import { POST_LOGIN_DEFAULT_PATH, resolvePostAuthPath } from "../lib/authRedirects";
import { fetchProfileForRouting } from "../lib/fetchProfileForRouting";
import { createSupabaseServerClient } from "../lib/supabase/server";

export const metadata = {
  title: {
    absolute: "Fiches de révision Brevet 2027, Bac et BTS | Révision facile",
  },
  description:
    "Choisis ta classe, ta matière et ton chapitre : ta fiche de révision conforme au programme 2026-2027 est prête en quelques secondes. Brevet, Bac et BTS 2027.",
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
      <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-slate-50/85 pt-safe backdrop-blur-md">
        <div className="mx-auto flex min-h-14 w-full max-w-6xl items-center justify-between px-4 sm:min-h-16 sm:px-8">
          <SiteLogo />
          <HomeHeaderAuth />
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-4 pb-12 pt-10 sm:px-8 sm:pb-20 sm:pt-16">
          <div className="mx-auto max-w-3xl text-center">
            <p className="inline-flex rounded-full border border-indigo-200/80 bg-indigo-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-indigo-700 sm:text-[11px] sm:tracking-[0.18em]">
              3ᵉ · Bac · BTS — 2027
            </p>
            <h1 className="mt-5 font-[family-name:var(--font-geist-sans)] text-[1.75rem] font-semibold leading-tight tracking-tight text-slate-900 sm:mt-6 sm:text-4xl sm:leading-[1.12] md:text-[2.75rem]">
              Révise plus vite,{" "}
              <span className="mt-1 block text-indigo-700 sm:mt-2">réussis mieux</span>
            </h1>
            <p className="mx-auto mt-6 max-w-md text-pretty text-base leading-relaxed text-slate-700 sm:mt-7 sm:text-lg">
              Pour les collégiens, lycéens et étudiants BTS.
            </p>
            <p className="mx-auto mt-2 max-w-md text-pretty text-[15px] leading-relaxed text-slate-500 sm:text-base">
              Tu choisis une notion. On te génère la fiche + le quiz.
            </p>
            <div className="mt-8 sm:mt-10">
              <HomeHeroAuth />
            </div>
          </div>
        </section>

        <section className="border-t border-slate-200/80 bg-indigo-600 py-14 sm:py-16">
          <div className="mx-auto max-w-3xl px-5 text-center sm:px-8">
            <h2 className="font-[family-name:var(--font-geist-sans)] text-xl font-semibold text-white sm:text-2xl">
              Ta première fiche t’attend
            </h2>
            <p className="mt-3 text-sm text-indigo-100 sm:text-base">
              Classe, matière, notion — c’est tout.
            </p>
            <HomeCtaAuth />
          </div>
        </section>
      </main>
    </div>
  );
}
