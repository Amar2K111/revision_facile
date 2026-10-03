import { Suspense } from "react";
import OnboardingWizard from "../../components/onboarding/OnboardingWizard";

export const metadata = {
  title: "Ton profil — Révision facile",
  description: "Quelques questions pour personnaliser ta révision avant de générer tes fiches.",
};

export default function OnboardingPage() {
  return (
    <Suspense fallback={<p className="text-center text-sm text-slate-500">Chargement…</p>}>
      <OnboardingWizard />
    </Suspense>
  );
}
