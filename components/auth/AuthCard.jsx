import { SiteLogo } from "../SiteLogo";
import { authCardBodyClass, authCardClass, authSubtitleClass, authTitleClass } from "./authFormStyles";

export function AuthCard({ title, subtitle, children, hideSubtitleOnMobile = true }) {
  return (
    <div className={authCardClass}>
      <div className="h-1 bg-gradient-to-r from-indigo-500 to-violet-600" aria-hidden />
      <div className={authCardBodyClass}>
        <div className="mb-4 flex flex-col items-center text-center">
          <SiteLogo variant="domain" size="sm" href="/" linked={false} className="justify-center" />
          <h1 className={`${authTitleClass} mt-3`}>{title}</h1>
          {subtitle ? (
            <p className={`${authSubtitleClass} ${hideSubtitleOnMobile ? "max-[380px]:hidden" : ""}`}>
              {subtitle}
            </p>
          ) : null}
        </div>
        {children}
      </div>
    </div>
  );
}
