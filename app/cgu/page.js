import Link from "next/link";
import { SITE_EMAIL } from "@/lib/site";

export const metadata = {
  title: "Conditions générales d'utilisation",
  description: "Conditions générales d'utilisation du service Révision facile.",
  alternates: { canonical: "/cgu" },
};

export default function CguPage() {
  return (
    <div className="min-h-dvh bg-gradient-to-b from-indigo-50/80 via-slate-50 to-slate-50">
      <div className="mx-auto max-w-2xl px-5 py-12 sm:px-8 sm:py-16">
        <p className="text-sm">
          <Link href="/" className="font-semibold text-indigo-700 hover:text-indigo-600">
            ← Accueil
          </Link>
        </p>
        <h1 className="mt-8 font-[family-name:var(--font-geist-sans)] text-2xl font-semibold text-slate-900">
          Conditions générales d&apos;utilisation
        </h1>
        <p className="mt-4 text-sm text-slate-500">Dernière mise à jour : octobre 2026.</p>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-slate-600">
          <section>
            <h2 className="font-semibold text-slate-900">Objet</h2>
            <p className="mt-3">
              Les présentes conditions régissent l&apos;accès et l&apos;utilisation du site et du
              service « Révision facile », édité par Amar. En créant un compte ou en utilisant le
              service, tu acceptes ces conditions.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-slate-900">Description du service</h2>
            <p className="mt-3">
              Révision facile permet de générer des fiches de révision à partir de paramètres
              pédagogiques (niveau, matière, chapitre ou notion), conformément au programme
              national. Les contenus sont produits avec l&apos;aide de l&apos;intelligence
              artificielle et doivent faire l&apos;objet d&apos;une relecture critique de ta part.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-slate-900">Compte utilisateur</h2>
            <p className="mt-3">
              Tu es responsable de la confidentialité de tes identifiants et de l&apos;activité
              réalisée depuis ton compte. Tu t&apos;engages à fournir des informations exactes lors
              de l&apos;inscription.
            </p>
            <p className="mt-3">
              Si tu es mineur, l&apos;utilisation du service peut nécessiter l&apos;accord d&apos;un
              représentant légal selon la réglementation applicable. Consulte la{" "}
              <Link href="/confidentialite" className="font-medium text-indigo-700 hover:text-indigo-600">
                politique de confidentialité
              </Link>{" "}
              pour en savoir plus sur le traitement des données.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-slate-900">Usage autorisé</h2>
            <p className="mt-3">
              Le service est destiné à un usage personnel aux fins d&apos;étude et de révision. Il
              est interdit d&apos;utiliser le service à des fins illicites, de tenter d&apos;accéder
              à des systèmes non autorisés, ou de reproduire massivement les contenus générés à des
              fins commerciales sans autorisation.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-slate-900">Limitation de responsabilité</h2>
            <p className="mt-3">
              Les fiches générées sont une aide à la révision et peuvent contenir des erreurs ou
              imprécisions. L&apos;éditeur ne garantit pas l&apos;adéquation des contenus à un
              examen ou à un établissement particulier. Le service est fourni « en l&apos;état »,
              sous réserve des dispositions légales impératives.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-slate-900">Propriété intellectuelle</h2>
            <p className="mt-3">
              La marque, l&apos;interface et les éléments du site restent la propriété de
              l&apos;éditeur. Les contenus générés pour ton usage personnel t&apos;appartiennent
              dans le cadre d&apos;un usage privé ; l&apos;éditeur conserve les droits sur la
              structure du service et les modèles utilisés.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-slate-900">Modification et résiliation</h2>
            <p className="mt-3">
              L&apos;éditeur peut faire évoluer le service ou les présentes conditions. En cas de
              modification substantielle, la date de mise à jour sera actualisée. Tu peux cesser
              d&apos;utiliser le service à tout moment et demander la suppression de ton compte en
              écrivant à{" "}
              <a
                href={`mailto:${SITE_EMAIL}`}
                className="font-medium text-indigo-700 underline decoration-indigo-700/30 underline-offset-2 hover:text-indigo-600"
              >
                {SITE_EMAIL}
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-slate-900">Droit applicable</h2>
            <p className="mt-3">
              Les présentes conditions sont soumises au droit français. En cas de litige, une
              solution amiable sera recherchée avant toute action judiciaire.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
