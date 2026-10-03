import { Suspense } from "react";
import AuthContinueClient from "../../../components/auth/AuthContinueClient";
import { AppLoadingScreen } from "../../../components/AppLoadingScreen";

export const metadata = {
  title: "Connexion — Révision facile",
  robots: { index: false, follow: false },
};

export default function AuthContinuePage() {
  return (
    <Suspense fallback={<AppLoadingScreen message="Préparation de ton espace…" />}>
      <AuthContinueClient />
    </Suspense>
  );
}
