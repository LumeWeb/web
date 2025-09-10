import { InlineAuthLinkBanner, LumeLogo } from "@lumeweb/portal-framework-ui";
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
    <div className="relative h-screen sm:overflow-hidden">
      <div className="flex h-full w-full flex-col items-center justify-center sm:flex-row-reverse">
        <header className="absolute left-4 top-4 sm:left-8">
          <LumeLogo />
        </header>
        <BackgroundImage variant={variant} />
        <div
          className={
            "bg-background relative z-10 flex w-full flex-col items-start justify-start sm:max-w-md"
          }
          role="main">
          <div className="w-full p-5 sm:mt-20">
            {showBanner && (
              <div className="mb-10 flex flex-col gap-2">
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
