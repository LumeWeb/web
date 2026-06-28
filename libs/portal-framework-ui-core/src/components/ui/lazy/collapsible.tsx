import { named, lazyComponent } from "./_util";
import { Skeleton } from "@/components/ui/skeleton";

const fallback = <Skeleton className="h-9 w-full" />;

export const Collapsible = lazyComponent(
  () => named(() => import("../collapsible"), "Collapsible"),
  fallback,
);
export const CollapsibleTrigger = lazyComponent(
  () => named(() => import("../collapsible"), "CollapsibleTrigger"),
  fallback,
);
export const CollapsibleContent = lazyComponent(
  () => named(() => import("../collapsible"), "CollapsibleContent"),
  fallback,
);
