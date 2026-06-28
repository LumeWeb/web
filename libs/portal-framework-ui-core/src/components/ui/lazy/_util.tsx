import { Suspense, lazy, type ComponentType } from "react";

import { Skeleton } from "@/components/ui/skeleton";

/**
 * Creates a drop-in lazy wrapper for a component that:
 * 1. Dynamically imports the real component (creates a separate chunk)
 * 2. Wraps it in <Suspense> with a Skeleton fallback
 * 3. Forwards all props — consumers use it identically to the original
 *
 * Uses ComponentType<any> to avoid DTS inference issues with
 * unexportable internal types from radix-ui and other third-party libs.
 */
export function lazyComponent(
  factory: () => Promise<{ default: ComponentType<any> }>,
  fallback: React.ReactNode = <Skeleton className="h-9 w-full" />,
): ComponentType<any> {
  const Lazy = lazy(factory);
  const Wrapper: ComponentType<any> = (props) => (
    <Suspense fallback={fallback}>
      <Lazy {...props} />
    </Suspense>
  );
  return Wrapper;
}

/**
 * Helper to import a named export from a module as a { default } object.
 * Combines with lazyComponent: lazyComponent(() => named(() => import("../chart"), "ChartContainer"))
 */
export function named<M extends Record<string, any>, K extends keyof M>(
  importer: () => Promise<M>,
  name: K,
): Promise<{ default: M[K] }> {
  return importer().then((m) => ({ default: m[name] }));
}
