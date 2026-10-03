import Link from "next/link";

export const metadata = {
  title: "Confidentialité",
  description: "Politique de confidentialité du service Révision facile.",
  alternates: { canonical: "/confidentialite" },
};

export default function ConfidentialitePage() {
  return (
    <div className="min-h-dvh bg-gradient-to-b from-indigo-50/80 via-slate-50 to-slate-50">
      <div className="mx-auto max-w-2xl px-5 py-12 sm:px-8 sm:py-16">
        <p className="text-sm">
          <Link href="/" className="font-semibold text-indigo-700 hover:text-indigo-600">
            ← Accueil
          </Link>
        </p>
        <h1 className="mt-8 font-[family-name:var(--font-geist-sans)] text-2xl font-semibold text-slate-900">
          Politique de confidentialité
        </h1>
        <p className="mt-4 text-sm text-slate-500">
          Dernière mise à jour : octobre 2026.
        </p>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-slate-600">
          <section>
            <h2 className="font-semibold text-slate-900">Responsable du traitement</h2>
            <p className="mt-3">
              Le responsable du traitement des données personnelles est{" "}
              <strong className="font-medium text-slate-800">Amar</strong>, éditeur du site
              Révision facile.
            </p>
            <p className="mt-3">
              <strong className="font-medium text-slate-800">Contact :</strong>{" "}
              <a
                href="mailto:amarcontactpro40@gmail.com"
                className="font-medium text-indigo-700 underline decoration-indigo-700/30 underline-offset-2 hover:text-indigo-600"
              >
                amarcontactpro40@gmail.com
              </a>
            </p>
            <p className="mt-3 text-slate-500">
              Pour l’exercice de vos droits (voir ci-dessous), privilégiez ce contact en indiquant
              l’objet « Données personnelles / Révision facile ».
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-slate-900">Données traitées et finalités</h2>
            <p className="mt-3">
              Révision facile permet de demander la génération de fiches de révision à partir de
              paramètres pédagogiques que vous sélectionnez (niveau, matière, notion, etc.).
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>
                <strong className="font-medium text-slate-800">Données d’usage du service</strong>{" "}
                : les informations nécessaires à la demande de génération envoyées depuis votre
                navigateur au serveur (par exemple niveau/scolarité, matière, libellés de cours).
                Finalité : exécution du service demandé et fourniture du contenu généré.
              </li>
              <li>
                <strong className="font-medium text-slate-800">Données techniques</strong> : logs
                serveur ou équivalents (adresse IP, horodatage, type d’erreur) lorsque votre
                hébergeur ou la pile applicative les produit. Finalités : sécurité, diagnostic des
                incidents, mesures d’audience technique si activées par la configuration.
              </li>
              <li>
                <strong className="font-medium text-slate-800">
                  Stockage local dans le navigateur
                </strong>{" "}
                : la fiche générée peut être conservée temporairement dans votre navigateur (par
                exemple via <code className="rounded bg-slate-200/80 px-1 py-0.5 font-mono text-xs">sessionStorage</code>
                ) pour affichage sur la page suivante. Elle n’est pas stockée durablement par
                l’éditeur du seul fait de cette étape ; vous pouvez fermer l’onglet ou vider le
                stockage du site pour effacer ces données locales.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold text-slate-900">
              Traitement par un prestataire d’IA (Google Gemini)
            </h2>
            <p className="mt-3">
              La génération de contenu repose sur l’API{" "}
              <strong className="font-medium text-slate-800">Google Gemini</strong> (
              <a
                href="https://ai.google.dev/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-indigo-700 underline decoration-indigo-700/30 underline-offset-2 hover:text-indigo-600"
              >
                Google AI
              </a>
              ). Les paramètres de votre demande et le contexte nécessaire au prompt peuvent être
              transmis à Google pour produire la réponse. Google agit alors en qualité de
              sous-traitant ou de destinataire selon les cas, dans le cadre de sa politique et de ses
              engagements (y compris clauses contractuelles types pour les transferts hors Union
              européenne le cas échéant).
            </p>
            <p className="mt-3">
              Nous vous invitons à consulter la politique de confidentialité de Google :{" "}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-indigo-700 underline decoration-indigo-700/30 underline-offset-2 hover:text-indigo-600"
              >
                policies.google.com/privacy
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-slate-900">Base légale</h2>
            <p className="mt-3">
              Les traitements décrits reposent notamment sur l’
              <strong className="font-medium text-slate-800">
                exécution des mesures précontractuelles / du contrat
              </strong>{" "}
              (fourniture du service que vous sollicitez) et l’
              <strong className="font-medium text-slate-800">
                intérêt légitime
              </strong>{" "}
              (sécurité, maintenance, amélioration raisonnable du service). Lorsque des cookies ou
              traceurs non essentiels seraient utilisés, une base de consentement pourrait
              s’appliquer ; le site vise une configuration minimale.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-slate-900">Durée de conservation</h2>
            <p className="mt-3">
              Les durées dépendent de la configuration serveur et hébergeur (logs techniques,
              sauvegardes). En l’absence de compte utilisateur dédié sur Révision facile, les données de
              génération ne sont en principe pas conservées sous forme de profil nominatif par
              l’éditeur au-delà de ce qu’exigent les logs ou la réglementation. Les contenus locaux
              dans votre navigateur restent sous votre contrôle jusqu’à effacement.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-slate-900">Destinataires</h2>
            <p className="mt-3">
              Les données peuvent être traitées par l’éditeur, l’hébergeur du site/application, et Google
              (API Gemini) dans la stricte mesure nécessaire aux finalités décrites.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-slate-900">Vos droits (RGPD)</h2>
            <p className="mt-3">
              Conformément au règlement (UE) 2016/679 et à la loi « Informatique et Libertés », vous
              disposez d’un droit d’accès, de rectification, d’effacement, de limitation du
              traitement, d’opposition (dans les conditions légales) et de portabilité lorsque le
              traitement est fondé sur le consentement ou un contrat et automatisé.
            </p>
            <p className="mt-3">
              Vous pouvez exercer vos droits en écrivant à{" "}
              <a
                href="mailto:amarcontactpro40@gmail.com?subject=Donn%C3%A9es%20personnelles%20%2F%20R%C3%A9vision%20facile"
                className="font-medium text-indigo-700 underline decoration-indigo-700/30 underline-offset-2 hover:text-indigo-600"
              >
                amarcontactpro40@gmail.com
              </a>
              . Une pièce d’identité peut être demandée pour prévenir l’usurpation d’identité.
            </p>
            <p className="mt-3">
              Vous pouvez également introduire une réclamation auprès de la{" "}
              <a
                href="https://www.cnil.fr/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-indigo-700 underline decoration-indigo-700/30 underline-offset-2 hover:text-indigo-600"
              >
                CNIL
              </a>{" "}
              (Commission Nationale de l’Informatique et des Libertés).
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-slate-900">Cookies et traceurs</h2>
            <p className="mt-3">
              Le site vise à limiter les traceurs au strict nécessaire au fonctionnement. Si des
              cookies d’audience ou de publicité étaient ajoutés ultérieurement, une information
              complémentaire et, le cas échéant, un bandeau de consentement seraient mis à jour.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-slate-900">Modifications</h2>
            <p className="mt-3">
              La présente politique peut être mise à jour pour refléter l’évolution du service ou
              des obligations légales. La date en tête de page sera ajustée en conséquence.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
