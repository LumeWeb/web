import type { ComponentType, SVGAttributes } from "react";

import { GoogleG } from "./providerIcons/GoogleG";
import { MicrosoftLogo } from "./providerIcons/MicrosoftLogo";

export type IconComponent = ComponentType<SVGAttributes<SVGSVGElement>>;

/**
 * Per-provider visual override layered onto the build-time generated
 * social-provider map (see src/ui/generated/social-providers.generated.ts).
 * Keyed by the backend provider id (e.g. "google", "microsoftonline").
 */
export interface ProviderOverride {
  /**
   * Final Tailwind tile classes. When present they replace the generated
   * `bgColor` and the consumer's default `text-white`/hover treatment —
   * for brands whose guidelines mandate a specific tile (border,
   * background, icon color).
   */
  className?: string;
  /** Replaces the generated (react-icons) icon component entirely. */
  icon?: IconComponent;
}

/**
 * Overrides are for brand-guideline compliance: add an entry when the
 * provider's official sign-in guidelines forbid the default tile treatment
 * (colored disc + mono glyph), e.g. Google, which requires the four-color G
 * on a white tile with a #747775 border. The generated map is the source
 * of truth for everything else.
 */
export const providerOverrides: Record<string, ProviderOverride> = {
  google: {
    className:
      "bg-white text-[#1F1F1F] border border-[#747775] hover:bg-[#F2F2F2]",
    icon: GoogleG,
  },
  microsoft: {
    className:
      "bg-white text-[#1F1F1F] border border-[#747775] hover:bg-[#F2F2F2]",
    icon: MicrosoftLogo,
  },
  microsoftonline: {
    className:
      "bg-white text-[#1F1F1F] border border-[#747775] hover:bg-[#F2F2F2]",
    icon: MicrosoftLogo,
  },
};
