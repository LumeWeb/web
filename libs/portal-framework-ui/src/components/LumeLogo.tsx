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

export function LumeLogo({ className, imageClassName, src }: LumeLogoProps) {
  return (
    <Link className={cn("flex items-center space-x-2", className)} to="/">
      <img
        alt="Logo"
        className={cn("h-10", imageClassName)}
        src={src || logoPng}
      />
    </Link>
  );
}
