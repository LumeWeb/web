import type { ComponentType, SVGAttributes } from "react";

import { CoinbaseC } from "@/ui/components/common/walletLogos/CoinbaseC";

export type WalletIconComponent = ComponentType<SVGAttributes<SVGSVGElement>>;

/**
 * Curated branding for known wallets, keyed by the id the detector emits.
 *
 * EVM ids are the wallet's EIP-6963 `rdns` (also the wagmi injected-connector
 * id, so the key is stable across the connect path). Solana ids are the probe
 * keys in `detectSolanaWallets` ("phantom", "solflare", "backpack"). This map
 * is the primary source for a wallet row's look; the wallet's self-reported
 * `info.icon` is a secondary, validated fallback (see `sanitizeWalletIcon`),
 * and a neutral monogram is last.
 *
 * Unlike the social provider map there's no generated source: wallets live in
 * the user's browser, not in backend meta, so entries are hand-written. A
 * known wallet carries an `Icon` when an accurate inline-SVG mark exists,
 * otherwise a brand-colour monogram disc with its initial.
 */
export interface WalletLogoEntry {
  /** Tailwind background class for the monogram disc when `Icon` is absent. */
  color: string;
  /** Accurate inline-SVG brand mark; when present it replaces the monogram. */
  Icon?: WalletIconComponent;
}

const META_AMBER = "bg-[#F6851B]";
const COINBASE_BLUE = "bg-[#0052FF]";
const TRUST_BLUE = "bg-[#3375BB]";
const RAINBOW_VIOLET = "bg-[#6B5BEA]";
const PHANTOM_PURPLE = "bg-[#AB9FF2]";
const OKX_BLACK = "bg-neutral-900";
const ZERION_CYAN = "bg-[#12a5fd]";
const BRAVE_ORANGE = "bg-[#FB542B]";
const EXODUS_SLATE = "bg-slate-600";
const SOLFLARE_ORANGE = "bg-[#FE6600]";
const BACKPACK_RED = "bg-[#E91E63]";

/**
 * Known-wallet branding keyed by EIP-6963 rdns (EVM) or Solana probe id.
 * Ids not listed here still resolve correctly via the announced-icon →
 * neutral-monogram fallbacks.
 *
 * Colour audit (2026-09): a value is an official brand primary only where
 * confirmed against public brand sources (MetaMask, Coinbase, Phantom, OKX).
 * Entries marked "approx" are single-hue stand-ins for a multi-colour or
 * rebranded mark — fine on a monogram disc + initial, a placeholder until
 * the official SVG gets archived as an `Icon`. `io.rabby` is absent because
 * its brand colour could not be confirmed, so it uses the neutral disc.
 * `rdns` is self-attested (EIP-6963) and used for display only, never auth.
 */
export const walletLogos: Record<string, WalletLogoEntry> = {
  "app.phantom": { color: PHANTOM_PURPLE },
  backpack: { color: BACKPACK_RED }, // approx: multi-colour mark
  "com.brave.wallet": { color: BRAVE_ORANGE },
  "com.coinbase.wallet": { color: COINBASE_BLUE, Icon: CoinbaseC },
  "com.exodus": { color: EXODUS_SLATE }, // approx: dark-blue/black "X" mark
  "com.okex.wallet": { color: OKX_BLACK },
  "com.trustwallet.app": { color: TRUST_BLUE }, // approx: 2023 rebrand is two-tone blue/green
  // EVM (EIP-6963 rdns)
  "io.metamask": { color: META_AMBER },
  "io.zerion.wallet": { color: ZERION_CYAN }, // approx
  "me.rainbow": { color: RAINBOW_VIOLET }, // approx: rainbow-gradient mark
  // Solana (probe ids)
  phantom: { color: PHANTOM_PURPLE },
  solflare: { color: SOLFLARE_ORANGE },
};

/**
 * Validates a wallet-provided icon URI (EIP-6963 `info.icon`) before it is
 * rendered as an `<img>`.
 *
 * Rejects anything that is not a small base64 raster data URI:
 * - remote http(s) URLs — never render an unvetted network fetch target
 *   (privacy leak / SSRF-adjacent surface);
 * - `image/svg+xml` — SVG can carry embedded scripts (XSS);
 * - oversized blobs — a 32 KiB cap keeps the picker cheap and the row sane.
 *
 * Returns the icon URI when acceptable, otherwise `null` (callers fall back
 * to the curated monogram).
 */
const MAX_ICON_BYTES = 32 * 1024;
const ALLOWED_DATA_URI =
  /^data:image\/(?:png|jpeg|webp|gif|avif);base64,[A-Za-z0-9+/=\s]+$/;

export function sanitizeWalletIcon(icon: string | undefined): null | string {
  if (!icon || !icon.startsWith("data:image/") || !ALLOWED_DATA_URI.test(icon)) {
    return null;
  }
  const comma = icon.indexOf(",");
  const bodyLen = icon.length - comma - 1;
  const approxBytes = Math.floor((bodyLen * 3) / 4);
  return approxBytes > MAX_ICON_BYTES ? null : icon;
}
