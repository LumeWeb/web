import { named, lazyComponent } from "./_util";
import { Skeleton } from "@/components/ui/skeleton";

export type { TagListProps } from "../tag-list";

const fallback = <Skeleton className="h-9 w-full" />;

export const TagList = lazyComponent(
  () => named(() => import("../tag-list"), "TagList"),
  fallback,
);
