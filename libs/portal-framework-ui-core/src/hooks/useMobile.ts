import { useMobileDetection } from "./useMobileDetection";

/**
 * Simple hook to detect mobile viewport
 * @deprecated Use useMobileDetection instead for more features and better performance
 */
export function useMobile(breakpoint?: number) {
  const { isMobile } = useMobileDetection({ breakpoint });
  return isMobile;
}
