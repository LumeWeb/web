import { named, lazyComponent } from "./_util";
import { Skeleton } from "@/components/ui/skeleton";

const fallback = <Skeleton className="h-9 w-full" />;

export const DropdownMenu = lazyComponent(
  () => named(() => import("../dropdown-menu"), "DropdownMenu"),
  fallback,
);
export const DropdownMenuCheckboxItem = lazyComponent(
  () => named(() => import("../dropdown-menu"), "DropdownMenuCheckboxItem"),
  fallback,
);
export const DropdownMenuContent = lazyComponent(
  () => named(() => import("../dropdown-menu"), "DropdownMenuContent"),
  fallback,
);
export const DropdownMenuGroup = lazyComponent(
  () => named(() => import("../dropdown-menu"), "DropdownMenuGroup"),
  fallback,
);
export const DropdownMenuItem = lazyComponent(
  () => named(() => import("../dropdown-menu"), "DropdownMenuItem"),
  fallback,
);
export const DropdownMenuLabel = lazyComponent(
  () => named(() => import("../dropdown-menu"), "DropdownMenuLabel"),
  fallback,
);
export const DropdownMenuPortal = lazyComponent(
  () => named(() => import("../dropdown-menu"), "DropdownMenuPortal"),
  fallback,
);
export const DropdownMenuRadioGroup = lazyComponent(
  () => named(() => import("../dropdown-menu"), "DropdownMenuRadioGroup"),
  fallback,
);
export const DropdownMenuRadioItem = lazyComponent(
  () => named(() => import("../dropdown-menu"), "DropdownMenuRadioItem"),
  fallback,
);
export const DropdownMenuSeparator = lazyComponent(
  () => named(() => import("../dropdown-menu"), "DropdownMenuSeparator"),
  fallback,
);
export const DropdownMenuShortcut = lazyComponent(
  () => named(() => import("../dropdown-menu"), "DropdownMenuShortcut"),
  fallback,
);
export const DropdownMenuSub = lazyComponent(
  () => named(() => import("../dropdown-menu"), "DropdownMenuSub"),
  fallback,
);
export const DropdownMenuSubContent = lazyComponent(
  () => named(() => import("../dropdown-menu"), "DropdownMenuSubContent"),
  fallback,
);
export const DropdownMenuSubTrigger = lazyComponent(
  () => named(() => import("../dropdown-menu"), "DropdownMenuSubTrigger"),
  fallback,
);
export const DropdownMenuTrigger = lazyComponent(
  () => named(() => import("../dropdown-menu"), "DropdownMenuTrigger"),
  fallback,
);
