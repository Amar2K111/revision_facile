import { Suspense } from "react";
import SignInView from "../../../components/auth/SignInView";

function SignInFallback() {
  return (
    <div
      className="mx-auto h-[28rem] w-full max-w-md animate-pulse rounded-[2rem] bg-slate-100/90"
      aria-hidden
    />
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<SignInFallback />}>
      <SignInView />
    </Suspense>
  );
}
