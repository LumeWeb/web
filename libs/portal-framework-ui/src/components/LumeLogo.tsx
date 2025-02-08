// @ts-ignore
import { logoPng } from "@/images";
import React from "react";
import { Link } from "react-router";
import { cn } from "@lumeweb/portal-framework-ui-core";

interface LumeLogoProps {
  className?: string;
  imageClassName?: string;
}

export function LumeLogo({ className, imageClassName }: LumeLogoProps) {
  return (
    <Link className={cn("flex items-center space-x-2", className)} to="/">
      <img
        alt="Lume logo"
        className={cn("h-10", imageClassName)}
        src={logoPng}
      />
    </Link>
  );
}
