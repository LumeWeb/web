import { cn } from "@lumeweb/portal-framework-ui-core";
import React, { ReactNode } from "react";

interface AuthPageTitleProps {
  children: ReactNode;
  className?: string;
  /**
   * Heading scale: "default" for the standalone auth pages,
   * "compact" for the app-login faces, whose longer
   * "…connect {app}" titles must fit on one line.
   */
  size?: "compact" | "default";
}

export function AuthPageTitle({
  children,
  className,
  size = "default",
}: AuthPageTitleProps) {
  return (
    <h2
      className={cn(
        "m-auto mb-5 font-bold",
        size === "compact" ? "text-2xl tracking-tighter" : "text-4xl sm:text-3xl",
        className,
      )}>
      {children}
    </h2>
  );
}
