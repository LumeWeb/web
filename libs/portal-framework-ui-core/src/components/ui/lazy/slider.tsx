import { named, lazyComponent } from "./_util";
import { Skeleton } from "@/components/ui/skeleton";

const fallback = <Skeleton className="h-5 w-full" />;

export const Slider = lazyComponent(
  () => named(() => import("../slider"), "Slider"),
  fallback,
);
