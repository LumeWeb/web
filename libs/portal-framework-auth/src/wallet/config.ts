import { type Config, createConfig, http, injected } from "@wagmi/core";
import { mainnet } from "viem/chains";

/**
 * wagmi `Config` singleton powering key-identity wallet login (EVM only).
 *
 * Design notes (why there is no React provider here):
 *
 * - Wallet login drives wagmi imperatively (`connect`/`signMessage` core
 *   actions) from `useWalletLogin`; no React context is needed because the
 *   challenge/verify endpoints handle the SIWX flow server-side.
 * - `createConfig({ connectors: [injected()] })` covers EIP-6963 wallet
 *   discovery: internal `mipd` dispatches `eip6963:requestProvider`, so wallets
 *   (re-)announce even when the config is created after page load. The plain
 *   `injected()` fallback also connects `window.ethereum` environments.
 * - The chain list is intentionally minimal (mainnet only). The signed
 *   message's CAIP-2 chain id comes from the wallet's connected chain; the
 *   backend enforces its `allowedChainIds` allowlist.
 * - This module is only imported by the flag-gated wallet-login UI chunk
 *   (`WalletLogin` is dynamically imported by LoginIndex/RegisterIndex), so
 *   production bundles never pay for viem/wagmi while the `wallet_login`
 *   feature flag is off.
 */

let wagmiConfig: Config | null = null;

export function getWagmiConfig(): Config {
  if (!wagmiConfig) {
    wagmiConfig = createConfig({
      chains: [mainnet],
      connectors: [injected({ shimDisconnect: true })],
      transports: {
        [mainnet.id]: http(),
      },
    });
  }
  return wagmiConfig;
}
