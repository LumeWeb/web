import { useMobileDetection as useCoreMobileDetection, type UseMobileDetectionReturn } from "@lumeweb/portal-framework-ui-core";
import { ComponentSize } from "@/components";

interface UseMobileDetectionProps {
  mobileBreakpoint?: ComponentSize | string;
}

// Map ComponentSize breakpoints to Tailwind CSS breakpoint names
const breakpointSizeMap: Record<ComponentSize, string> = {
  [ComponentSize.TWO_XL]: "2xl",
  [ComponentSize.THREE_XL]: "3xl",
  [ComponentSize.FOUR_XL]: "4xl",
  [ComponentSize.FIVE_XL]: "5xl",
  [ComponentSize.SIX_XL]: "6xl",
  [ComponentSize.SEVEN_XL]: "7xl",
  [ComponentSize.AUTO]: "auto",
  [ComponentSize.FULL]: "full",
  [ComponentSize.LG]: "lg",
  [ComponentSize.MD]: "md",
  [ComponentSize.SM]: "sm",
  [ComponentSize.XL]: "xl",
  [ComponentSize.XS]: "xs",
};

/**
 * Hook to detect mobile viewport based on Tailwind CSS breakpoints
 * @param props.mobileBreakpoint - The breakpoint at which to consider the viewport mobile
 * @returns isMobile state and current breakpoint
 */
function useMobileDetection({
  mobileBreakpoint = ComponentSize.SM,
}: UseMobileDetectionProps = {}): UseMobileDetectionReturn {
  // Convert ComponentSize to Tailwind breakpoint name if needed
  const breakpointName = Object.values(ComponentSize).includes(
    mobileBreakpoint as ComponentSize,
  )
    ? breakpointSizeMap[mobileBreakpoint as ComponentSize]
    : mobileBreakpoint;

  return useCoreMobileDetection({ breakpoint: breakpointName });
}

export { useMobileDetection };
