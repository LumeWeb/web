/**
 * Generic size system for UI components
 * Provides consistent sizing across dialogs, wizards, and other components
 */

/**
 * Standard size options using Tailwind CSS conventions
 */
export enum ComponentSize {
  TWO_XL = "2xl", // max-w-2xl (42rem / 672px)
  THREE_XL = "3xl", // max-w-3xl (48rem / 768px)
  FOUR_XL = "4xl", // max-w-4xl (56rem / 896px)
  FIVE_XL = "5xl", // max-w-5xl (64rem / 1024px)
  SIX_XL = "6xl", // max-w-6xl (72rem / 1152px)
  SEVEN_XL = "7xl", // max-w-7xl (80rem / 1280px)
  AUTO = "auto", // Responsive auto width
  FULL = "full", // 100%
  LG = "lg", // max-w-lg (32rem / 512px)
  MD = "md", // max-w-xl (36rem / 576px)
  SM = "sm", // max-w-md (28rem / 448px)
  XL = "xl", // max-w-xl (36rem / 576px)
  XS = "xs", // max-w-sm (24rem / 384px)
}

/**
 * Width categories for components
 */
export enum WidthCategory {
  EXTRA_NARROW = "extra-narrow", // xs, sm
  NARROW = "narrow", // md, lg
  MEDIUM = "medium", // xl
  WIDE = "wide", // 2xl, 3xl
  EXTRA_WIDE = "extra-wide", // 4xl, 5xl, 6xl, 7xl
  RESPONSIVE = "responsive", // auto, full
}

/**
 * Generic size classes mapping that can be used by different components
 * Each component can use the sizes that make sense for its context
 */
export const COMPONENT_SIZE_CLASSES = {
  [ComponentSize.TWO_XL]: "max-w-2xl", // 42rem (672px)
  [ComponentSize.THREE_XL]: "max-w-3xl", // 48rem (768px)
  [ComponentSize.FOUR_XL]: "max-w-4xl", // 56rem (896px)
  [ComponentSize.FIVE_XL]: "max-w-5xl", // 64rem (1024px)
  [ComponentSize.SIX_XL]: "max-w-6xl", // 72rem (1152px)
  [ComponentSize.SEVEN_XL]: "max-w-7xl", // 80rem (1280px)
  [ComponentSize.AUTO]: "max-w-[calc(100vw - 2rem)] sm:max-w-md", // Responsive auto
  [ComponentSize.FULL]: "max-w-full", // 100%
  [ComponentSize.LG]: "max-w-lg", // 32rem (512px)
  [ComponentSize.MD]: "max-w-xl", // 36rem (576px)
  [ComponentSize.SM]: "max-w-md", // 28rem (448px)
  [ComponentSize.XL]: "max-w-xl", // 36rem (576px)
  [ComponentSize.XS]: "max-w-sm", // 24rem (384px)
} as const;

/**
 * Helper function to create size-specific props for components
 */
export interface SizeConfig {
  /**
   * Custom size class that overrides the size prop
   * Useful when you need a specific size not covered by the standard sizes
   */
  customSizeClass?: string;
  size?: ComponentSize;
}

/**
 * Get the CSS class for a given component size
 * Returns undefined if the size is not valid
 */
export function getComponentSizeClass(size: ComponentSize): string {
  return COMPONENT_SIZE_CLASSES[size];
}

/**
 * Get the final size class considering both size prop and customSizeClass
 */
export function getSizeClass(config: SizeConfig): string | undefined {
  if (config.customSizeClass) {
    return config.customSizeClass;
  }
  if (config.size) {
    return getComponentSizeClass(config.size);
  }
  return undefined;
}

/**
 * Type guard to check if a string is a valid ComponentSize
 */
export function isComponentSize(size: string): size is ComponentSize {
  return Object.values(ComponentSize).includes(size as ComponentSize);
}
