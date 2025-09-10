import { cn } from "@lumeweb/portal-framework-ui-core";
import React, { ReactNode } from "react";

interface AuthPageTitleProps {
  children: ReactNode;
  className?: string;
}

export function AuthPageTitle({ children, className }: AuthPageTitleProps) {
  return (
    <h2 className={cn("m-auto mb-5 text-4xl font-bold sm:text-3xl", className)}>
      {children}
    </h2>
  );
}
