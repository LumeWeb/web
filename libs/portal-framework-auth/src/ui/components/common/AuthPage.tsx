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
          <div className="sm:mt-20 p-5 w-full">
            {showBanner && (
              <div className="flex flex-col gap-2 mb-10">
                {beforeLink}
                <InlineAuthLinkBanner
                  className={"m-auto md:m-0"}
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
