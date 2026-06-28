import { named, lazyComponent } from "./_util";
import { Skeleton } from "@/components/ui/skeleton";

const fallback = <Skeleton className="h-9 w-full" />;

export const AlertDialog = lazyComponent(
  () => named(() => import("../alert-dialog"), "AlertDialog"),
  fallback,
);
export const AlertDialogAction = lazyComponent(
  () => named(() => import("../alert-dialog"), "AlertDialogAction"),
  fallback,
);
export const AlertDialogCancel = lazyComponent(
  () => named(() => import("../alert-dialog"), "AlertDialogCancel"),
  fallback,
);
export const AlertDialogContent = lazyComponent(
  () => named(() => import("../alert-dialog"), "AlertDialogContent"),
  fallback,
);
export const AlertDialogDescription = lazyComponent(
  () => named(() => import("../alert-dialog"), "AlertDialogDescription"),
  fallback,
);
export const AlertDialogFooter = lazyComponent(
  () => named(() => import("../alert-dialog"), "AlertDialogFooter"),
  fallback,
);
export const AlertDialogHeader = lazyComponent(
  () => named(() => import("../alert-dialog"), "AlertDialogHeader"),
  fallback,
);
export const AlertDialogOverlay = lazyComponent(
  () => named(() => import("../alert-dialog"), "AlertDialogOverlay"),
  fallback,
);
export const AlertDialogPortal = lazyComponent(
  () => named(() => import("../alert-dialog"), "AlertDialogPortal"),
  fallback,
);
export const AlertDialogTitle = lazyComponent(
  () => named(() => import("../alert-dialog"), "AlertDialogTitle"),
  fallback,
);
export const AlertDialogTrigger = lazyComponent(
  () => named(() => import("../alert-dialog"), "AlertDialogTrigger"),
  fallback,
);
