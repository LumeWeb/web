import { named, lazyComponent } from "./_util";
import { Skeleton } from "@/components/ui/skeleton";

const fallback = <Skeleton className="h-9 w-full" />;

export const Select = lazyComponent(
  () => named(() => import("../select"), "Select"),
  fallback,
);
export const SelectContent = lazyComponent(
  () => named(() => import("../select"), "SelectContent"),
  fallback,
);
export const SelectGroup = lazyComponent(
  () => named(() => import("../select"), "SelectGroup"),
  fallback,
);
export const SelectItem = lazyComponent(
  () => named(() => import("../select"), "SelectItem"),
  fallback,
);
export const SelectLabel = lazyComponent(
  () => named(() => import("../select"), "SelectLabel"),
  fallback,
);
export const SelectScrollDownButton = lazyComponent(
  () => named(() => import("../select"), "SelectScrollDownButton"),
  fallback,
);
export const SelectScrollUpButton = lazyComponent(
  () => named(() => import("../select"), "SelectScrollUpButton"),
  fallback,
);
export const SelectSeparator = lazyComponent(
  () => named(() => import("../select"), "SelectSeparator"),
  fallback,
);
export const SelectTrigger = lazyComponent(
  () => named(() => import("../select"), "SelectTrigger"),
  fallback,
);
export const SelectValue = lazyComponent(
  () => named(() => import("../select"), "SelectValue"),
  fallback,
);
