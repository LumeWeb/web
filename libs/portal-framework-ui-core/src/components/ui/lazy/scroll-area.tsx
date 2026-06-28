import { named, lazyComponent } from "./_util";
import { Skeleton } from "@/components/ui/skeleton";

const fallback = <Skeleton className="h-full w-full" />;

export const ScrollArea = lazyComponent(
  () => named(() => import("../scroll-area"), "ScrollArea"),
  fallback,
);
export const ScrollBar = lazyComponent(
  () => named(() => import("../scroll-area"), "ScrollBar"),
  fallback,
);
