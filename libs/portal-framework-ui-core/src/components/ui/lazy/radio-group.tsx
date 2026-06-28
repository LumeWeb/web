import { named, lazyComponent } from "./_util";
import { Skeleton } from "@/components/ui/skeleton";

const fallback = <Skeleton className="h-5 w-full" />;

export const RadioGroup = lazyComponent(
  () => named(() => import("../radio-group"), "RadioGroup"),
  fallback,
);
export const RadioGroupItem = lazyComponent(
  () => named(() => import("../radio-group"), "RadioGroupItem"),
  fallback,
);
