import { useBrand } from "@lumeweb/portal-framework-core";
import { cn } from "@lumeweb/portal-framework-ui-core";
import React from "react";

/**
 * Passive ToS/Privacy consent line for auth flows that bypass the register
 * form's consent checkbox (social SSO, wallet login). AuthProviders renders
 * it once per auth page, in the last provider slot; WalletLogin does not
 * render its own copy. Links follow the register form's checkbox scheme
 * (`brand.siteUrl` + fixed paths, relative fallback) — keep the two
 * consistent when either changes.
 */
export function AuthConsentNotice({ className }: { className?: string }) {
  const brand = useBrand();
  const siteUrl = brand?.siteUrl;

  return (
    <p
      className={cn(
        "text-center text-xs leading-relaxed text-muted-foreground",
        className,
      )}>
      By continuing, you agree to the{" "}
      <a
        className="underline hover:text-foreground"
        href={
          siteUrl ? `${siteUrl}/terms-of-service` : "/terms-of-service"
        }>
        Terms of Service
      </a>{" "}
      and{" "}
      <a
        className="underline hover:text-foreground"
        href={siteUrl ? `${siteUrl}/privacy-policy` : "/privacy-policy"}>
        Privacy Policy
      </a>
    </p>
  );
}
