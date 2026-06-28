import { iconRegistry, type IconName, type IconProps } from "./registry";

/**
 * Lazy-loaded icon component.
 *
 * Usage:
 *   <Icon name="ChevronDown" className="h-4 w-4" />
 *
 * Each icon is a separate dynamic import, so Vite creates separate
 * chunks and tree-shakes unused icons from lucide-react entirely.
 * Each icon is wrapped in its own Suspense boundary.
 */
export function Icon({ name, ...props }: { name: IconName } & IconProps) {
  const LazyIcon = iconRegistry[name];
  return <LazyIcon {...props} />;
}
