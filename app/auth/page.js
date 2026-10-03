import { redirect } from "next/navigation";
import { sanitizeNextPath } from "../../lib/authRedirects";

export default async function AuthPage({ searchParams }) {
  const sp = (await Promise.resolve(searchParams)) ?? {};
  const next = sanitizeNextPath(typeof sp.next === "string" ? sp.next : "");
  redirect(`/auth/signin?next=${encodeURIComponent(next)}`);
}
