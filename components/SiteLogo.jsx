import Image from "next/image";
import Link from "next/link";
import { SITE_BRAND_NAME, SITE_NAME } from "../lib/site";

const SIZES = {
  xs: {
    img: "h-5 w-5",
    width: 20,
    height: 20,
    rounded: "rounded-[6px]",
    text: "text-[11px]",
    gap: "gap-1.5",
    minH: "min-h-0",
  },
  sm: {
    img: "h-7 w-7",
    width: 28,
    height: 28,
    rounded: "rounded-[8px]",
    text: "text-xs sm:text-sm",
    gap: "gap-2",
    minH: "min-h-9",
  },
  md: {
    img: "h-9 w-9",
    width: 36,
    height: 36,
    rounded: "rounded-[10px]",
    text: "text-sm",
    gap: "gap-2.5",
    minH: "min-h-11",
  },
};

export function SiteLogo({
  href = "/",
  showLabel = true,
  label,
  variant = "name",
  size = "md",
  linked = true,
  className = "",
  labelClassName = "",
}) {
  const displayLabel = label ?? (variant === "domain" ? SITE_BRAND_NAME : SITE_NAME);
  const s = SIZES[size] ?? SIZES.md;

  const content = (
    <>
      <Image
        src="/icon.png"
        alt=""
        width={s.width}
        height={s.height}
        className={`${s.img} shrink-0 ${s.rounded} shadow-sm shadow-indigo-900/10`}
        priority={size === "md"}
      />
      {showLabel ? (
        <span
          className={`${s.text} font-semibold tracking-tight text-slate-900 ${labelClassName}`.trim()}
        >
          {displayLabel}
        </span>
      ) : null}
    </>
  );

  const classes =
    `inline-flex ${s.minH} items-center ${s.gap} ${linked ? "transition-opacity hover:opacity-90 active:opacity-80" : ""} ${className}`.trim();

  if (linked) {
    return (
      <Link href={href} className={classes} aria-label={displayLabel}>
        {content}
      </Link>
    );
  }

  return (
    <span className={classes} role="img" aria-label={displayLabel}>
      {content}
    </span>
  );
}
