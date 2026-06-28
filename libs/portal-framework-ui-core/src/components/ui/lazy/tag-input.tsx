import { named, lazyComponent } from "./_util";
import { Skeleton } from "@/components/ui/skeleton";

const fallback = <Skeleton className="h-9 w-full" />;

export const TagInput = lazyComponent(
  () => named(() => import("../tag-input"), "TagInput"),
  fallback,
);
