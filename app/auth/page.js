import { redirect } from "next/navigation";
import { POST_LOGIN_DEFAULT_PATH, sanitizeNextPath } from "../../lib/authRedirects";

export default async function AuthPage({ searchParams }) {
  const sp = (await Promise.resolve(searchParams)) ?? {};
  const raw = typeof sp.next === "string" && sp.next.trim() ? sp.next : POST_LOGIN_DEFAULT_PATH;
  const next = sanitizeNextPath(raw);
  redirect(`/auth/signin?next=${encodeURIComponent(next)}`);
}
