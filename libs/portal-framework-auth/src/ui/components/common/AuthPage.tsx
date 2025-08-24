import { LumeLogo } from "@lumeweb/portal-framework-ui";
import React, { ReactNode } from "react";

import { AuthFooter } from "./AuthFooter";
import { BackgroundImage } from "./BackgroundImage";
import { BackgroundVariant } from "./types";

interface AuthPageProps {
  children: ReactNode;
  variant?: BackgroundVariant;
}

export function AuthPage({ children, variant = "default" }: AuthPageProps) {
  return (
    <div className="h-screen relative sm:overflow-hidden">
      <div className="flex flex-col sm:flex-row-reverse items-center justify-center w-full h-full">
        <header className="absolute top-4 left-4 sm:left-8">
          <LumeLogo />
        </header>
        <BackgroundImage variant={variant} />
        <div
          role="main"
          className={
            "flex flex-col items-start justify-start bg-background w-full sm:max-w-md z-10 relative"
          }>
          <div className="sm:mt-20 p-5">
            {children}
            <AuthFooter />
          </div>
        </div>
      </div>
    </div>
  );
}
