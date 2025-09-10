/**
 * Generic size system for UI components
 * Provides consistent sizing across dialogs, wizards, and other components
 */

/**
 * Standard size options using Tailwind CSS conventions
 */
export type ComponentSize =
  | "2xl" // max-w-2xl (42rem / 672px)
  | "3xl" // max-w-3xl (48rem / 768px)
  | "4xl" // max-w-4xl (56rem / 896px)
  | "5xl" // max-w-5xl (64rem / 1024px)
  | "6xl" // max-w-6xl (72rem / 1152px)
  | "7xl" // max-w-7xl (80rem / 1280px);
  | "auto" // Responsive auto width
  | "full" // 100%
  | "lg" // max-w-lg (32rem / 512px)
  | "md" // max-w-xl (36rem / 576px)
  | "sm" // max-w-md (28rem / 448px)
  | "xl" // max-w-xl (36rem / 576px)
  | "xs"; // max-w-sm (24rem / 384px)

/**
 * Generic size classes mapping that can be used by different components
 * Each component can use the sizes that make sense for its context
 */
export const COMPONENT_SIZE_CLASSES = {
  "2xl": "max-w-2xl", // 42rem (672px)
  "3xl": "max-w-3xl", // 48rem (768px)
  "4xl": "max-w-4xl", // 56rem (896px)
  "5xl": "max-w-5xl", // 64rem (1024px)
  "6xl": "max-w-6xl", // 72rem (1152px)
  "7xl": "max-w-7xl", // 80rem (1280px)
  "auto": "max-w-[calc(100vw - 2rem)] sm:max-w-md", // Responsive auto
  "full": "max-w-full", // 100%
  "lg": "max-w-lg", // 32rem (512px)
  "md": "max-w-xl", // 36rem (576px)
  "sm": "max-w-md", // 28rem (448px)
  "xl": "max-w-xl", // 36rem (576px)
  "xs": "max-w-sm", // 24rem (384px)
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
  return size in COMPONENT_SIZE_CLASSES;
}
