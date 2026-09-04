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
    // No dedicated art shipped yet for the app-login family: the app-login
    // variants deliberately reuse the closest visual kin — `applogin` (the
    // consent/login face of the app-login card) reuses the login art, and
    // `appregister` (the create-account face) reuses the register art. When
    // dedicated art lands, both are one-line swaps in this map.
    "applogin": lumeBgLoginPng,
    "appregister": lumeBgRegisterPng,
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
