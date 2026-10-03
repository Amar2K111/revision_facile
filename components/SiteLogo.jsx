import Image from "next/image";
import Link from "next/link";

export function SiteLogo({ href = "/", showLabel = true, className = "" }) {
  return (
    <Link
      href={href}
      className={`inline-flex min-h-11 items-center gap-2.5 transition-opacity hover:opacity-90 active:opacity-80 ${className}`.trim()}
    >
      <Image
        src="/icon.png"
        alt=""
        width={36}
        height={36}
        className="h-9 w-9 shrink-0 rounded-[10px] shadow-sm shadow-indigo-900/10"
        priority
      />
      {showLabel ? (
        <span className="text-sm font-semibold tracking-tight text-slate-900">Révision facile</span>
      ) : null}
    </Link>
  );
}
