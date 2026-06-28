import { named, lazyComponent } from "./_util";
import { Skeleton } from "@/components/ui/skeleton";

export type { SheetContentProps } from "../sheet";

const fallback = <Skeleton className="h-9 w-full" />;

export const Sheet = lazyComponent(
  () => named(() => import("../sheet"), "Sheet"),
  fallback,
);
export const SheetClose = lazyComponent(
  () => named(() => import("../sheet"), "SheetClose"),
  fallback,
);
export const SheetContent = lazyComponent(
  () => named(() => import("../sheet"), "SheetContent"),
  fallback,
);
export const SheetDescription = lazyComponent(
  () => named(() => import("../sheet"), "SheetDescription"),
  fallback,
);
export const SheetFooter = lazyComponent(
  () => named(() => import("../sheet"), "SheetFooter"),
  fallback,
);
export const SheetHeader = lazyComponent(
  () => named(() => import("../sheet"), "SheetHeader"),
  fallback,
);
export const SheetOverlay = lazyComponent(
  () => named(() => import("../sheet"), "SheetOverlay"),
  fallback,
);
export const SheetPortal = lazyComponent(
  () => named(() => import("../sheet"), "SheetPortal"),
  fallback,
);
export const SheetTitle = lazyComponent(
  () => named(() => import("../sheet"), "SheetTitle"),
  fallback,
);
export const SheetTrigger = lazyComponent(
  () => named(() => import("../sheet"), "SheetTrigger"),
  fallback,
);
