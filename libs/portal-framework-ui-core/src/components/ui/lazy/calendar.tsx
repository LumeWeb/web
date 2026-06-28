import { named, lazyComponent } from "./_util";
import { Skeleton } from "@/components/ui/skeleton";

const fallback = <Skeleton className="h-9 w-full" />;

export const Calendar = lazyComponent(
  () => named(() => import("../calendar"), "Calendar"),
  fallback,
);
