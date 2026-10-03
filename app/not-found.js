import Link from "next/link";

export const metadata = {
  title: "Page introuvable",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-slate-50 px-5 text-center">
      <h1 className="font-[family-name:var(--font-geist-sans)] text-2xl font-semibold text-slate-900">
        Page introuvable
      </h1>
      <p className="mt-3 max-w-md text-sm text-slate-600">
        Cette page n&apos;existe pas ou a été déplacée.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
      >
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
