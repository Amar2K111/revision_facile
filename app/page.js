import Link from "next/link";
import { redirect } from "next/navigation";
import AuthUserAvatar from "../components/AuthUserAvatar";
import { POST_LOGIN_DEFAULT_PATH } from "../lib/authRedirects";
import { createSupabaseServerClient } from "../lib/supabase/server";

const AUTH_REVISER = "/auth/signin?next=/reviser";

export const metadata = {
  title: "Révision facile — Accueil",
  description:
    "Fiches de révision intelligentes pour le Brevet, le Bac et le BTS : essentiel, programme dense et astuces — générées à partir du programme.",
};

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    redirect(POST_LOGIN_DEFAULT_PATH);
  }

  return (
    <div className="min-h-dvh bg-gradient-to-b from-indigo-50/80 via-slate-50 to-slate-50">
      <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-slate-50/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-5 sm:h-16 sm:px-8">
          <span className="text-sm font-semibold tracking-tight text-slate-900">Révision facile</span>
          <div className="flex items-center gap-2 sm:gap-3">
            <AuthUserAvatar />
            <Link
              href={AUTH_REVISER}
              className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-indigo-600/20 transition hover:bg-indigo-500"
            >
              Commencer
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero — même schéma que StudyAI : badge, titre en deux temps, sous-titre, double CTA */}
        <section className="mx-auto max-w-6xl px-5 pb-14 pt-12 sm:px-8 sm:pb-20 sm:pt-16">
          <div className="mx-auto max-w-3xl text-center">
            <p className="inline-flex rounded-full border border-indigo-200/80 bg-indigo-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-700">
              Révision facile
            </p>
            <h1 className="mt-6 font-[family-name:var(--font-geist-sans)] text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl sm:leading-[1.12] md:text-[2.75rem]">
              Révise plus vite,
              <span className="mt-1 block text-indigo-700 sm:mt-2">réussis mieux</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-pretty text-base leading-relaxed text-slate-600 sm:text-[17px]">
              Transforme ton choix de niveau, matière et notion en fiche de révision structurée en
              quelques secondes — essentiel, programme dense et astuces, aligné sur le programme
              national.
            </p>
            <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:gap-4">
              <Link
                href={AUTH_REVISER}
                className="inline-flex w-full items-center justify-center rounded-full bg-indigo-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-500 sm:w-auto"
              >
                Commencer
              </Link>
              <Link
                href={AUTH_REVISER}
                className="inline-flex w-full items-center justify-center rounded-full border border-slate-300/90 bg-white px-8 py-3.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 sm:w-auto"
              >
                Accès direct aux fiches
              </Link>
            </div>
          </div>
        </section>

        {/* CTA final */}
        <section className="border-t border-slate-200/80 bg-indigo-600 py-14 sm:py-16">
          <div className="mx-auto max-w-3xl px-5 text-center sm:px-8">
            <h2 className="font-[family-name:var(--font-geist-sans)] text-xl font-semibold text-white sm:text-2xl">
              Prêt à générer ta première fiche ?
            </h2>
            <p className="mt-3 text-sm text-indigo-100 sm:text-base">
              Choisis ta classe, ta matière et une notion — la fiche est prête en quelques
              instants.
            </p>
            <Link
              href={AUTH_REVISER}
              className="mt-8 inline-flex items-center justify-center rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-indigo-700 shadow-lg transition hover:bg-indigo-50"
            >
              Commencer
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
