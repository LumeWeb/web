import { named, lazyComponent } from "./_util";
import { Skeleton } from "@/components/ui/skeleton";

const fallback = <Skeleton className="h-9 w-full" />;

export const Drawer = lazyComponent(
  () => named(() => import("../drawer"), "Drawer"),
  fallback,
);
export const DrawerClose = lazyComponent(
  () => named(() => import("../drawer"), "DrawerClose"),
  fallback,
);
export const DrawerContent = lazyComponent(
  () => named(() => import("../drawer"), "DrawerContent"),
  fallback,
);
export const DrawerDescription = lazyComponent(
  () => named(() => import("../drawer"), "DrawerDescription"),
  fallback,
);
export const DrawerFooter = lazyComponent(
  () => named(() => import("../drawer"), "DrawerFooter"),
  fallback,
);
export const DrawerHeader = lazyComponent(
  () => named(() => import("../drawer"), "DrawerHeader"),
  fallback,
);
export const DrawerOverlay = lazyComponent(
  () => named(() => import("../drawer"), "DrawerOverlay"),
  fallback,
);
export const DrawerPortal = lazyComponent(
  () => named(() => import("../drawer"), "DrawerPortal"),
  fallback,
);
export const DrawerTitle = lazyComponent(
  () => named(() => import("../drawer"), "DrawerTitle"),
  fallback,
);
export const DrawerTrigger = lazyComponent(
  () => named(() => import("../drawer"), "DrawerTrigger"),
  fallback,
);
