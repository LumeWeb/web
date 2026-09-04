import { cn } from "@lumeweb/portal-framework-ui-core";
import React from "react";
import { Link } from "react-router";

// @ts-ignore
import { logoPng } from "@/images";

interface LumeLogoProps {
  className?: string;
  imageClassName?: string;
  src?: string;
}

// The anchor is fit-content on purpose: as a stretched flex-column child
// (e.g. the auth-page aside) it used to span the full container width,
// making half the page clickable.
export function LumeLogo({ className, imageClassName, src }: LumeLogoProps) {
  return (
    <Link
      className={cn("flex w-fit items-center space-x-2", className)}
      to="/"
    >
      <img
        alt="Logo"
        className={cn("h-10 object-contain", imageClassName)}
        src={src || logoPng}
        style={{ maxWidth: "none" }}
      />
    </Link>
  );
}
