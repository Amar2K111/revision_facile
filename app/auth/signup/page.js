import { Suspense } from "react";
import SignUpView from "../../../components/auth/SignUpView";

function SignUpFallback() {
  return (
    <div
      className="mx-auto h-[32rem] w-full max-w-md animate-pulse rounded-[2rem] bg-slate-100/90"
      aria-hidden
    />
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<SignUpFallback />}>
      <SignUpView />
    </Suspense>
  );
}
