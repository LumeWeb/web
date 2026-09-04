import type {
  SocialLoginProvider,
} from "@/ui/generated/social-providers.generated";
import {
  socialLoginProviders as generatedSocialLoginProviders,
} from "@/ui/generated/social-providers.generated";

import {
  type IconComponent,
  providerOverrides,
} from "@/ui/components/common/providerOverrides";

/**
 * Merged social-provider map: the build-time generated map
 * (src/ui/generated/social-providers.generated.ts, produced by
 * scripts/sync-social-providers.ts on every build from the dashboard
 * plugin's /api/meta) combined with the hand-authored per-provider
 * overrides in src/ui/components/common/providerOverrides.ts.
 *
 * Kept as this file's default export so existing consumers keep resolving
 * `@/ui/components/common/SocialProviders` with the same shape.
 *
 * Entries are keyed by provider id and shaped
 * `{ name, bgColor, icon?, className? }` — providers that simple-icons /
 * Font Awesome have no icon for are emitted without `icon` (consumers
 * render a lettered-avatar fallback). Where a `providerOverrides` entry
 * exists:
 *  - `icon`     replaces the generated icon component (e.g. the vendored
 *               four-color GoogleG for `google`);
 *  - `className` replaces `bgColor` and the consumer's default
 *               text/hover treatment; render the tile from it verbatim.
 */
export interface SocialLoginProviderEntry {
  bgColor: string;
  className?: string;
  icon?: IconComponent;
  name: string;
}

/**
 * Single merge location: generated data + overrides applied with override
 * precedence. Consumers never see (or need) the raw generated map.
 */
export function applyProviderOverrides(
  providers: Map<string, SocialLoginProvider>,
): Map<string, SocialLoginProviderEntry> {
  const merged = new Map<string, SocialLoginProviderEntry>();
  for (const [id, provider] of providers) {
    const override = providerOverrides[id];
    const entry: SocialLoginProviderEntry = { ...provider };
    if (override?.className !== undefined) {
      entry.className = override.className;
    }
    if (override?.icon !== undefined) {
      entry.icon = override.icon;
    }
    merged.set(id, entry);
  }
  return merged;
}

export const socialLoginProviders: Map<string, SocialLoginProviderEntry> =
  applyProviderOverrides(generatedSocialLoginProviders);

export default socialLoginProviders;
