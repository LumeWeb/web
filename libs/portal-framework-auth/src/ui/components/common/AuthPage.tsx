import { LumeLogo } from "@lumeweb/portal-framework-ui";
import { InlineAuthLinkBanner } from "@lumeweb/portal-framework-ui";
import React, { ReactNode } from "react";

import { AuthFooter } from "./AuthFooter";
import { BackgroundImage } from "./BackgroundImage";
import { BackgroundVariant } from "./types";

interface AuthPageProps {
  beforeLink?: ReactNode;
  children: ReactNode;
  linkLabel?: string;
  linkText?: string;
  linkUrl?: string;
  variant?: BackgroundVariant;
}

export function AuthPage({
  beforeLink,
  children,
  linkLabel,
  linkText,
  linkUrl,
  variant = "default",
}: AuthPageProps) {
  const showBanner = linkLabel && linkUrl && linkText;

  return (
    <div className="h-screen relative sm:overflow-hidden">
      <div className="flex flex-col sm:flex-row-reverse items-center justify-center w-full h-full">
        <header className="absolute top-4 left-4 sm:left-8">
          <LumeLogo />
        </header>
        <BackgroundImage variant={variant} />
        <div
          className={
            "flex flex-col items-start justify-start bg-background w-full sm:max-w-md z-10 relative"
          }
          role="main">
          <div className="sm:mt-20 p-5">
            {showBanner && (
              <div className="absolute inset-0 flex sm:hidden flex-col items-start justify-center gap-2 text-left p-4 mt-60 sm:mt-10">
                {beforeLink}
                <InlineAuthLinkBanner
                  label={linkLabel}
                  linkLabel={linkText}
                  to={linkUrl}
                />
              </div>
            )}
            {showBanner && (
              <div className="hidden sm:flex flex-col items-start justify-center gap-2 text-left mb-10">
                {beforeLink}
                <InlineAuthLinkBanner
                  label={linkLabel}
                  linkLabel={linkText}
                  to={linkUrl}
                />
              </div>
            )}
            {children}
            <AuthFooter />
          </div>
        </div>
      </div>
    </div>
  );
}
