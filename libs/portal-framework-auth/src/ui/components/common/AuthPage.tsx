import { InlineAuthLinkBanner, LumeLogo } from "@lumeweb/portal-framework-ui";
import { cn } from "@lumeweb/portal-framework-ui-core";
import React, { ReactNode } from "react";

import type { BrandConfig } from "@lumeweb/portal-framework-core";

import { type AppIdentity, AppIdentityCard } from "./AppIdentityCard";
import { AuthFooter } from "./AuthFooter";
import { BackgroundImage } from "./BackgroundImage";
import { BackgroundVariant } from "./types";

interface AuthPageProps {
  /** App-identity card (3rd-party app asking to connect) rendered at the
   * very top of the content column, above `beforeLink`. Used by app-login. */
  appIdentity?: AppIdentity;
  beforeLink?: ReactNode;
  brand?: BrandConfig;
  children: ReactNode;
  /**
   * Embedding mode: renders only the borderless content column (no branded
   * aside panel, no mobile logo header) for future 3rd-party embedding of
   * the auth flows inside their own chrome. Centered, single-column.
   */
  embedded?: boolean;
  linkLabel?: string;
  linkText?: string;
  linkUrl?: string;
  /** First-class notice slot rendered below the page content (e.g. the
   * app-login password-privacy shield notice). */
  securityNotice?: ReactNode;
  variant?: BackgroundVariant;
}

export function AuthPage({
  appIdentity,
  beforeLink,
  brand,
  children,
  embedded = false,
  linkLabel,
  linkText,
  linkUrl,
  securityNotice,
  variant = "default",
}: AuthPageProps) {
  const showBanner = linkLabel && linkUrl && linkText;

  return (
    <div
      className={cn(
        "flex min-h-dvh w-full flex-col",
        embedded ? "items-center justify-center" : "sm:flex-row-reverse",
      )}>
      {!embedded && (
        <aside
          aria-hidden="true"
          className="relative hidden flex-col justify-between overflow-hidden sm:flex sm:w-[45%] lg:w-1/2">
          <BackgroundImage className="absolute inset-0" variant={variant} />
          <div className="relative z-10 flex h-full flex-col justify-between p-8 lg:p-12">
            <div>
              <LumeLogo src={brand?.logoUrl} />
            </div>
            {brand?.tagline && (
              <h2 className="max-w-xl text-2xl font-semibold leading-tight text-white lg:text-3xl">
                {brand.tagline}
              </h2>
            )}
          </div>
        </aside>
      )}
      <div
        className={cn(
          "relative z-10 flex w-full flex-col bg-background",
          !embedded && "sm:w-[55%] lg:w-1/2",
        )}
        role="main">
        {!embedded && (
          <header className="flex items-center p-5 sm:hidden">
            <LumeLogo src={brand?.logoUrl} />
          </header>
        )}
        <div
          className={cn(
            "mx-auto flex w-full max-w-md flex-1 flex-col p-5",
            embedded && "my-auto justify-center py-10",
          )}>
          {(beforeLink || appIdentity) && (
            <div
              className={
                showBanner
                  ? "mb-10 flex flex-col gap-2 sm:mt-20"
                  : "mb-8 flex flex-col gap-2"
              }>
              {appIdentity && <AppIdentityCard {...appIdentity} />}
              {beforeLink}
              {showBanner && (
                <InlineAuthLinkBanner
                  className={"m-auto md:m-0"}
                  label={linkLabel}
                  linkLabel={linkText}
                  to={linkUrl}
                />
              )}
            </div>
          )}
          {children}
          {securityNotice && <div className="mt-6">{securityNotice}</div>}
          <div className="mt-auto">
            <AuthFooter brand={brand} />
          </div>
        </div>
      </div>
    </div>
  );
}
