import { cn } from "@lumeweb/portal-framework-ui-core";
import React from "react";
import { Link } from "react-router";

interface InlineAuthLinkBannerProps {
  className?: string;
  label: string;
  linkClassName?: string;
  linkLabel?: string;
  to: string;
}

function InlineAuthLinkBanner({
  className,
  label,
  linkClassName,
  linkLabel,
  to,
}: InlineAuthLinkBannerProps) {
  return (
    <p
      className={cn(
        "text-foreground text-sm w-fit flex items-center gap-2 text-left bg-secondary p-3 rounded-lg",
        className,
      )}>
      <span className="text-foreground/80 whitespace-nowrap">{label}</span>
      <Link
        className={cn(
          "text-foreground mx-auto whitespace-nowrap hover:underline hover:underline-offset-4",
          linkClassName,
        )}
        to={to}>
        {linkLabel ?? "Login here →"}
      </Link>
    </p>
  );
}

export { InlineAuthLinkBanner };
