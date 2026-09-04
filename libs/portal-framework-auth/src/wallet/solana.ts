import { encodeBase58 } from "@/wallet/base58";

/**
 * Minimal shape of an injected Solana wallet provider (Phantom / Solflare /
 * Backpack / generic `window.solana`). Only the pieces the login flow uses
 * are modeled.
 */
export interface SolanaProvider {
  isBackpack?: boolean;
  isPhantom?: boolean;
  isSolflare?: boolean;
  /** Base58 pubkey of the connected account (may only appear after connect). */
  publicKey?: { toString(): string };
  /**
   * Phantom-style message signing: `signMessage(message, encoding)`.
   * Legacy/alternative wallets may wrap the bytes in `{signature}`.
   */
  signMessage(
    message: Uint8Array,
    encoding?: "utf8",
  ): Promise<Uint8Array | { signature: Uint8Array }>;
}

/**
 * Signs a challenge message (the server-authored string) with an injected
 * Solana wallet.
 *
 * Phantom's convention is utf8 text passed to `signMessage(bytes, "utf8")`,
 * so the challenge is encoded with the standard TextEncoder. The signature
 * comes back as raw 64 ed25519 bytes and is sent to verify base58-encoded —
 * Solana's canonical binary-string form for on-chain data (the served spec
 * documents keys as "base58/hex"); no web3 dependencies are required.
 */
export async function signSolanaMessage(
  provider: SolanaProvider,
  message: string,
): Promise<string> {
  const result = await provider.signMessage(
    new TextEncoder().encode(message),
    "utf8",
  );
  const signature =
    result instanceof Uint8Array
      ? result
      : result?.signature instanceof Uint8Array
        ? result.signature
        : undefined;

  if (!signature) {
    throw new Error("Wallet returned an empty signature.");
  }
  return encodeBase58(signature);
}
