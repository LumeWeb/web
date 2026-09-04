import { cn } from "@lumeweb/portal-framework-ui-core";
import React from "react";

import { type DetectedWallet } from "@/wallet/detect";
import { sanitizeWalletIcon, walletLogos } from "@/wallet/logos";

/**
 * Deterministic logo treatment for a detected wallet. Resolution order:
 *
 * 1. curated inline-SVG brand mark (`walletLogos[id].Icon`)
 * 2. the wallet's EIP-6963 `info.icon`, only once `sanitizeWalletIcon`
 *    accepts it (base64 raster data-URI, size-capped, no SVG/remote)
 * 3. the curated brand-colour monogram disc (`walletLogos[id].color`)
 * 4. a neutral grey disc with the wallet's initial
 *
 * The validated announced icon (2) beats the curated monogram (3): a known
 * wallet that announces its own icon still shows it. The curated colour only
 * steps in when no valid icon exists.
 *
 * Standalone component (sibling of `AuthProviders`) so the wallet and social
 * rows share the same look and this stays testable in isolation.
 */
export function WalletLogo({
  className,
  wallet,
}: {
  className?: string;
  wallet: Pick<DetectedWallet, "icon" | "id" | "name" | "network">;
}) {
  const entry = walletLogos[wallet.id];
  const Icon = entry?.Icon;
  const safeIcon = sanitizeWalletIcon(wallet.icon);
  const initial = wallet.name.charAt(0).toUpperCase();

  if (Icon) {
    return (
      <span
        aria-hidden="true"
        className={cn(
          "absolute left-3 flex h-7 w-7 -translate-y-1/2 items-center justify-center top-1/2",
          className,
        )}
        data-testid="wallet-logo-vector">
        <Icon className="h-7 w-7 rounded" />
      </span>
    );
  }

  if (safeIcon) {
    return (
      <img
        alt=""
        aria-hidden="true"
        className={cn(
          "absolute left-3 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded object-contain top-1/2",
          className,
        )}
        data-testid="wallet-logo-icon"
        src={safeIcon}
      />
    );
  }

  const discClass =
    entry?.color ??
    (wallet.network === "solana" ? "bg-purple-500" : "bg-gray-500");
  return (
    <span
      aria-hidden="true"
      className={cn(
        "absolute left-3 flex h-7 w-7 items-center justify-center rounded-full text-white",
        discClass,
        className,
      )}
      data-testid="wallet-logo-monogram">
      {initial}
    </span>
  );
}
