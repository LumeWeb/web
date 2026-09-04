import type { SolanaProvider } from "@/wallet/solana";

/**
 * Multi-network wallet detection for the login picker.
 *
 * - EVM: collects live EIP-6963 wallet announcements during a short window
 *   after dispatching `eip6963:requestProvider`. The detected `id` is the
 *   announcement's `rdns`, which matches wagmi's injected-connector ids, so
 *   `useWalletLogin` connects through the existing wagmi config unchanged.
 * - Solana: synchronous window-injection probes for the common wallets.
 *   `window.solana` is frequently an alias of a named wallet's provider
 *   (e.g. Phantom), so probes are deduped by provider identity and id.
 */

export interface DetectedWallet {
  /** Base58 pubkey (Solana). EVM addresses are resolved after wagmi connects. */
  address?: string;
  /** Wallet-provided icon URI (EIP-6963 `info.icon`). */
  icon?: string;
  /** EVM: EIP-6963 rdns (= wagmi connector id). Solana: injection probe key. */
  id: string;
  name: string;
  network: WalletNetwork;
  /** Raw provider object: EIP-1193 (EVM) or `SolanaProvider` (Solana). */
  provider: unknown;
}

type SolanaInjectionWindow = typeof window & {
  backpack?: SolanaProvider;
  phantom?: { solana?: SolanaProvider };
  solana?: SolanaProvider;
  solflare?: SolanaProvider;
};

interface Eip6963ProviderDetail {
  info?: { icon?: string; name: string; rdns: string; uuid: string };
  provider?: unknown;
}

export type WalletNetwork = "ethereum" | "solana";

/** Collection window for EIP-6963 announcements after a request broadcast. */
const EIP6963_COLLECTION_WINDOW_MS = 250;

/**
 * Detects installable wallets across both networks: Solana probes resolve
 * immediately, EVM announcements are collected over a short window.
 */
export async function detectWallets(
  windowMs: number = EIP6963_COLLECTION_WINDOW_MS,
): Promise<DetectedWallet[]> {
  const [evm, solana] = await Promise.all([
    detectEvmWallets(windowMs),
    detectSolanaWallets(),
  ]);
  return [...evm, ...solana];
}

/**
 * One broadcast/collect cycle in the spirit of the EIP-6963 spec: wallets
 * (re-)announce their EIP-1193 provider on `eip6963:announceProvider` after
 * `eip6963:requestProvider` is dispatched, even long after page load.
 */
export function detectEvmWallets(windowMs: number): Promise<DetectedWallet[]> {
  return new Promise((resolve) => {
    const byRdns = new Map<string, DetectedWallet>();

    const onAnnounce = (event: Event) => {
      const detail = (event as CustomEvent<Eip6963ProviderDetail>).detail;
      const rdns = detail?.info?.rdns;
      if (!rdns || !detail.provider || byRdns.has(rdns)) {
        return;
      }
      byRdns.set(rdns, {
        icon: detail.info?.icon || undefined,
        id: rdns,
        name: detail.info?.name ?? rdns,
        network: "ethereum",
        provider: detail.provider,
      });
    };

    window.addEventListener("eip6963:announceProvider", onAnnounce);
    window.dispatchEvent(new Event("eip6963:requestProvider"));
    window.setTimeout(() => {
      window.removeEventListener("eip6963:announceProvider", onAnnounce);
      resolve([...byRdns.values()]);
    }, windowMs);
  });
}

/** Probe targets in preference order; `window.solana` is the generic fallback. */
const SOLANA_PROBES: [id: string, name: string][] = [
  ["phantom", "Phantom"],
  ["solflare", "Solflare"],
  ["backpack", "Backpack"],
];

export function detectSolanaWallets(): DetectedWallet[] {
  const w = window as SolanaInjectionWindow;
  const probes: DetectedWallet[] = [];
  const push = (id: string, name: string, provider: SolanaProvider) => {
    probes.push({
      address: provider.publicKey?.toString(),
      id,
      name,
      network: "solana",
      provider,
    });
  };

  if (w.phantom?.solana) {
    push("phantom", "Phantom", w.phantom.solana);
  }
  if (w.solflare) {
    push("solflare", "Solflare", w.solflare);
  }
  if (w.backpack) {
    push("backpack", "Backpack", w.backpack);
  }

  // Generic `window.solana` injection. Skip it when it is a same-provider
  // alias of a named probe; otherwise map well-known `is*` flags to the
  // proper name and fall back to a neutral label.
  if (w.solana) {
    const aliasOf = probes.some((wallet) => wallet.provider === w.solana);
    if (!aliasOf) {
      const flags = w.solana as unknown as Partial<Record<string, boolean>>;
      const named = SOLANA_PROBES.find(
        ([id]) =>
          flags[`is${id.charAt(0).toUpperCase()}${id.slice(1)}`] === true,
      );
      push(named?.[0] ?? "solana", named?.[1] ?? "Solana Wallet", w.solana);
    }
  }

  // Drop duplicate ids (e.g. injected alias resolved above an explicit probe).
  const byId = new Map<string, DetectedWallet>();
  for (const wallet of probes) {
    if (!byId.has(wallet.id)) {
      byId.set(wallet.id, wallet);
    }
  }
  return [...byId.values()];
}
