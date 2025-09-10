/**
 * Determines animation classes for wizard step transitions using CSS Grid
 *
 * @param isEntering - Whether the step is currently entering
 * @param isExiting - Whether the step is currently exiting
 * @param isActive - Whether the step is currently active
 * @param direction - The direction of transition ("forward", "backward", or null)
 * @returns CSS classes for the transition animation
 */
export function getStepAnimationClasses(
  isEntering: boolean,
  isExiting: boolean,
  isActive: boolean,
  direction: "backward" | "forward" | null,
): string {
  // Handle entering state - animate in
  if (isEntering) {
    return "opacity-100 scale-100 pointer-events-auto z-10";
  }

  // Handle exiting state - animate out
  if (isExiting) {
    return "opacity-0 scale-95 pointer-events-none z-0";
  }

  // Handle active state - fully visible
  if (isActive) {
    return "opacity-100 scale-100 pointer-events-auto z-10";
  }

  // Handle inactive state - hidden
  return "opacity-0 scale-95 pointer-events-none z-0";
}
