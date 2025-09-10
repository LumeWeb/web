import { cn } from "@lumeweb/portal-framework-ui-core";
import {
  lumeBgLoginPng,
  lumeBgPng,
  lumeBgRegisterPng,
} from "@lumeweb/portal-framework-ui/images";
import React from "react";

import { BackgroundVariant } from "./types";

interface BackgroundImageProps {
  className?: string;
  variant?: BackgroundVariant;
}

export function BackgroundImage({
  className = "",
  variant = "default",
}: BackgroundImageProps) {
  const images = {
    "default": lumeBgPng,
    "login": lumeBgLoginPng,
    "register": lumeBgRegisterPng,
    "reset-password": lumeBgPng,
  };

  return (
    <div className={cn("relative h-full w-full", className)}>
      <img
        alt="Lume background"
        className="w-full object-cover sm:h-full"
        src={images[variant]}
      />
    </div>
  );
}
