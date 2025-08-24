import { cn } from "@lumeweb/portal-framework-ui-core";
import React, { ReactNode } from "react";

interface AuthPageTitleProps {
  children: ReactNode;
  className?: string;
}

export function AuthPageTitle({ children, className }: AuthPageTitleProps) {
  return (
    <h2 className={cn("text-4xl sm:text-3xl font-bold mb-5 m-auto", className)}>
      {children}
    </h2>
  );
}
