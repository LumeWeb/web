import {
  Button,
  lazyIcon,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@lumeweb/portal-framework-ui-core";
import React, { useState } from "react";

import { useWalletLogin } from "@/hooks/useWalletLogin";
import { type DetectedWallet, detectWallets } from "@/wallet/detect";

import { WalletLogo } from "./WalletLogo";

const WalletIcon = lazyIcon("Wallet");

const TRIGGER_LABEL = "Continue with wallet";
const NO_WALLET_MESSAGE =
  "No wallet detected in this browser — install a wallet, then try again.";

/**
 * "Continue with wallet" button + picker (key-identity login across EVM and
 * Solana). Rendered only when the `wallet_login` feature flag is on (gated
 * by the callers).
 *
 * Click behavior: wallets are detected on demand (EIP-6963 announcements +
 * Solana injection probes). One wallet across both networks keeps the
 * original one-click connect-and-sign UX; several open a grouped picker
 * Sheet (Ethereum / Solana rows, same Sheet pattern as "More login options"
 * in AuthProviders). Either way the connect/sign status and errors surface
 * on the trigger button.
 */
export default function WalletLogin() {
  const { isConnecting, isSigning, signInWith } = useWalletLogin();
  const [flowError, setFlowError] = useState<null | string>(null);
  const [wallets, setWallets] = useState<DetectedWallet[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const isLoading = isConnecting || isSigning;

  const connect = async (wallet: DetectedWallet) => {
    setIsSheetOpen(false);
    setFlowError(null);
    try {
      await signInWith(wallet);
    } catch (e) {
      setFlowError(e instanceof Error ? e.message : String(e));
    }
  };

  const handleClick = async () => {
    setFlowError(null);
    const detected = await detectWallets();

    if (detected.length === 0) {
      setFlowError(NO_WALLET_MESSAGE);
      return;
    }
    // A single wallet (either network): no picker, current UX.
    if (detected.length === 1) {
      await connect(detected[0]!);
      return;
    }

    setWallets(detected);
    setIsSheetOpen(true);
  };

  const evmWallets = wallets.filter((wallet) => wallet.network === "ethereum");
  const solanaWallets = wallets.filter(
    (wallet) => wallet.network === "solana",
  );

  return (
    <div className="w-full space-y-2">
      <Button
        aria-label={TRIGGER_LABEL}
        className="relative w-full"
        disabled={isLoading}
        onClick={handleClick}
        variant="outline">
        <span className="absolute left-3 flex h-7 w-7 items-center justify-center">
          <WalletIcon className="h-5 w-5" />
        </span>
        {isConnecting
          ? "Connecting wallet…"
          : isSigning
            ? "Check your wallet to sign in…"
            : TRIGGER_LABEL}
      </Button>
      {flowError && (
        <p className="text-center text-sm text-destructive" role="alert">
          {flowError}
        </p>
      )}

      <Sheet onOpenChange={setIsSheetOpen} open={isSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{TRIGGER_LABEL}</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 py-2">
            {evmWallets.length > 0 && (
              <WalletGroup label="Ethereum" onPick={connect} wallets={evmWallets} />
            )}
            {solanaWallets.length > 0 && (
              <WalletGroup label="Solana" onPick={connect} wallets={solanaWallets} />
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* The ToS/Privacy consent notice is not rendered here — AuthProviders
          (the social stack, rendered below this slot) renders the single
          shared AuthConsentNotice for the whole provider pile. Adding one
          here would duplicate it on every page that shows both wallets and
          social buttons. */}
    </div>
  );
}



/**
 * One labeled group of detected wallets (network header omitted when the
 * network has no detections — the caller handles that).
 */
function WalletGroup({
  label,
  onPick,
  wallets,
}: {
  label: string;
  onPick: (wallet: DetectedWallet) => void;
  wallets: DetectedWallet[];
}) {
  return (
    <div className="space-y-2">
      <p className="px-1 text-sm font-medium text-muted-foreground">{label}</p>
      {wallets.map((wallet) => (
        <Button
          aria-label={`Continue with ${wallet.name}`}
          className="relative w-full"
          key={`${wallet.network}:${wallet.id}`}
          onClick={() => onPick(wallet)}
          variant="outline">
          <WalletLogo wallet={wallet} />
          Continue with {wallet.name}
        </Button>
      ))}
    </div>
  );
}