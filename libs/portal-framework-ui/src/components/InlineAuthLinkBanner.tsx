import React from "react";
import { Link } from "react-router";

interface InlineAuthLinkBannerProps {
  label: string;
  linkLabel?: string;
  to: string;
}

function InlineAuthLinkBanner({
  label,
  linkLabel,
  to,
}: InlineAuthLinkBannerProps) {
  return (
    <p className="text-foreground text-sm w-fit flex items-center  gap-2 text-left bg-secondary p-3 rounded-lg">
      <span className="text-foreground/80 whitespace-nowrap">{label}</span>
      <Link
        className="text-foreground mx-auto whitespace-nowrap hover:underline hover:underline-offset-4"
        to={to}>
        {linkLabel ?? "Login here →"}
      </Link>
    </p>
  );
}

export { InlineAuthLinkBanner };
