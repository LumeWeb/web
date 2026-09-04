import {
  type Config,
  connect,
  getAccount,
  getConnectors,
  signMessage,
} from "@wagmi/core";
import { useSdk } from "@lumeweb/portal-framework-ui";
import {
  KEY_TYPE_ETHEREUM,
  KEY_TYPE_SOLANA,
  type KeyVerifyOutcome,
} from "@lumeweb/portal-sdk";
import { useCallback, useState } from "react";
import { useSearchParams } from "react-router";

import {
  emitAuthCheckSuccess,
  sanitizeRedirectUrl,
  storeAuthToken,
} from "@/dataProviders/auth";
import { useNavigateToRedirect } from "@/hooks/useNavigateToRedirect";
import { getWagmiConfig } from "@/wallet/config";
import type { DetectedWallet } from "@/wallet/detect";
import { signSolanaMessage, type SolanaProvider } from "@/wallet/solana";

export interface UseWalletLoginReturn {
  /** True while a connect round-trip (wagmi or wallet prompt) is in flight. */
  isConnecting: boolean;
  /** True while the wallet signature round-trip / verify is in flight. */
  isSigning: boolean;
  /**
   * Runs the key-identity login flow for a detected wallet against the
   * served endpoints: challenge (server authors the message) → wallet
   * signature of that message verbatim → verify → token store +
   * authCheckSuccess → redirect. Throws `KeyIdentityError` on failure
   * (bad signature/proof, 409 already linked — unknown keys are not
   * failures: verify auto-provisions an anonymous account for them).
   */
  signInWith: (wallet: DetectedWallet) => Promise<void>;
}

const DASHBOARD_PATH = "/dashboard";


/**
 * Key-identity wallet login against the served endpoints `POST
 * /api/auth/key/challenge` + `POST /api/auth/key/verify`: the server authors
 * the message (never assembled client-side), the wallet signs it verbatim,
 * and verify resolves to one of three outcomes — `{token}` (success),
 * `{token, otp:true}` (route through /otp), or the 302 "auth complete"
 * browser redirect (fetch follows it; the session is recovered via the
 * existing ping/check plumbing). The fetches run through
 * `sdk.account().keyIdentity.*` (transport lives in @lumeweb/portal-sdk;
 * the dashboard host does not serve `/api/auth/key/*`) — the login token
 * arrives via response body / followed auth-complete URL query only,
 * never via dashboard cookies. All
 * outcomes share the email-login success
 * plumbing: `storeAuthToken` + `emitAuthCheckSuccess` + the sanitized
 * `?to=`-aware redirect.
 *
 * First-run routing: verify auto-provisions an anonymous account for an
 * unknown key and flags the outcome with `newAccount` — when the user did
 * not sit down with a usable `?to=`, the post-auth landing is the dashboard
 * (there is no dedicated /onboarding route). An explicit `?to=` always
 * wins: the existing redirect chain is honored untouched.
 *
 * Multi-network: EVM wallets connect/sign through wagmi (`key_type`
 * "ethereum"); Solana wallets sign through their injected provider
 * (`key_type` "solana", base58-encoded signature).
 */
export function useWalletLogin(): UseWalletLoginReturn {
  const sdk = useSdk();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [searchParams] = useSearchParams();
  const navigateToRedirect = useNavigateToRedirect();

  /**
   * Post-auth landing for a new (auto-provisioned anonymous) account:
   * the dashboard — unless the user arrived with an explicit usable `?to=`
   * chain, which always wins so app-login callbacks keep working. Rejected
   * `?to` values sanitize to the dashboard fallback, which counts as no
   * usable destination.
   */
  const newAccountTarget = useCallback(() => {
    const to = searchParams.get("to");
    const sanitized = to ? sanitizeRedirectUrl(to) : null;
    return sanitized ?? DASHBOARD_PATH;
  }, [searchParams]);

  /**
   * Shared token resolution for every verify outcome — the email-login
   * success path (store + authCheckSuccess + sanitized `?to=` redirect).
   */
  const resolveSession = useCallback(
    async (outcome: KeyVerifyOutcome) => {
      if (outcome.kind === "otp") {
        const to = searchParams.get("to");
        // The /otp flow completes the session, then lands on `to` — keep
        // the chain encoded for it; new accounts without one land on the
        // dashboard after OTP validation.
        const afterOtp =
          outcome.newAccount && !to
            ? DASHBOARD_PATH
            : (sanitizeRedirectUrl(to ?? undefined) ?? DASHBOARD_PATH);
        navigateToRedirect(`/otp?to=${encodeURIComponent(afterOtp)}`);
        return;
      }

      let token: string;
      if (outcome.kind === "token") {
        token = outcome.token;
      } else {
        // 302 "auth complete" was followed: its Set-Cookie is recorded by
        // the credentialed (credentials: "include") key-identity fetch,
        // exactly like the password-login chain. Recover the JWT through
        // the existing check/ping mechanics.
        const ping = await sdk.account().ping();
        if (!ping.success || !ping.data?.token) {
          throw new Error(
            "Wallet sign-in completed but the session could not be established — please retry.",
          );
        }
        token = ping.data.token;
      }

      storeAuthToken(sdk, token);
      emitAuthCheckSuccess({ token });

      navigateToRedirect(
        outcome.newAccount
          ? newAccountTarget()
          : (searchParams.get("to") ?? DASHBOARD_PATH),
      );
    },
    [sdk, searchParams, newAccountTarget, navigateToRedirect],
  );

  const signInWith = useCallback(
    async (wallet: DetectedWallet) => {
      if (!sdk) {
        throw new Error("Login is still initializing — please retry.");
      }

      const config = getWagmiConfig();
      setIsConnecting(true);
      try {
        if (wallet.network === "ethereum") {
          await connectEvmWallet(config, wallet);

          const address = getAccount(config).address;
          if (!address) {
            throw new Error("Wallet did not expose an account.");
          }

          const keyIdentity = sdk.account().keyIdentity;

          // Challenge: server authors the SIWE message (includes the nonce).
          const challenge = await keyIdentity.challenge(address, KEY_TYPE_ETHEREUM);

          // Sign the server's message verbatim.
          setIsSigning(true);
          const signature = await signMessage(config, {
            message: challenge.message,
          });

          const outcome = await keyIdentity.verify({
            key: address,
            keyType: KEY_TYPE_ETHEREUM,
            message: challenge.message,
            signature,
          });
          await resolveSession(outcome);
        } else {
          const provider = wallet.provider as SolanaProvider;
          if (!provider || typeof provider.signMessage !== "function") {
            throw new Error("Solana wallet could not be opened.");
          }

          const account = wallet.address ?? provider.publicKey?.toString();
          if (!account) {
            throw new Error("Wallet did not expose an account.");
          }

          const keyIdentity = sdk.account().keyIdentity;

          const challenge = await keyIdentity.challenge(account, KEY_TYPE_SOLANA);

          setIsConnecting(false);
          setIsSigning(true);
          const signature = await signSolanaMessage(
            provider,
            challenge.message,
          );

          const outcome = await keyIdentity.verify({
            key: account,
            keyType: KEY_TYPE_SOLANA,
            message: challenge.message,
            signature,
          });
          await resolveSession(outcome);
        }
      } finally {
        setIsConnecting(false);
        setIsSigning(false);
      }
    },
    [resolveSession, sdk],
  );

  return { isConnecting, isSigning, signInWith };
}

/**
 * Connects an EVM wallet through the existing wagmi config. The detected
 * EIP-6963 `rdns` matches wagmi's injected-connector ids. Connector pick
 * order: exact rdns match, then any non-generic injected connector, then the
 * generic `window.ethereum` "injected" fallback.
 */
async function connectEvmWallet(config: Config, wallet: DetectedWallet) {
  if (getAccount(config).address) {
    return;
  }

  const connectors = getConnectors(config).filter((c) => c.type === "injected");
  const connector =
    connectors.find((c) => c.id === wallet.id) ??
    connectors.find((c) => c.id !== "injected") ??
    connectors.find((c) => c.id === "injected");

  if (!connector) {
    throw new Error("No injected wallet detected in this browser.");
  }
  await connect(config, { connector });
}
