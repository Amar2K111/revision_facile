import { Suspense } from "react";
import CheckEmailView from "../../../components/auth/CheckEmailView";
import { AppLoadingScreen } from "../../../components/AppLoadingScreen";

export const metadata = {
  title: "Confirme ton e-mail",
  description: "Vérifie ta boîte mail pour activer ton compte Révision facile.",
  robots: { index: false, follow: false },
};

export default function CheckEmailPage() {
  return (
    <Suspense fallback={<AppLoadingScreen message="Chargement…" />}>
      <CheckEmailView />
    </Suspense>
  );
}
