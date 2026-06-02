import { Suspense } from "react";
import OnboardingWizard from "../../components/onboarding/OnboardingWizard";
import AuthPageShell from "../../components/auth/AuthPageShell";

export const metadata = {
  title: "Ton profil — Révision facile",
  description: "Quelques questions pour personnaliser ta révision avant de générer tes fiches.",
};

export default function OnboardingPage() {
  return (
    <AuthPageShell>
      <Suspense fallback={<p className="text-center text-sm text-slate-500">Chargement…</p>}>
        <OnboardingWizard />
      </Suspense>
    </AuthPageShell>
  );
}
