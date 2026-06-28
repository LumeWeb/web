import { named, lazyComponent } from "./_util";
import { Skeleton } from "@/components/ui/skeleton";

const fallback = <Skeleton className="h-9 w-full" />;

export const Command = lazyComponent(
  () => named(() => import("../command"), "Command"),
  fallback,
);
export const CommandDialog = lazyComponent(
  () => named(() => import("../command"), "CommandDialog"),
  fallback,
);
export const CommandEmpty = lazyComponent(
  () => named(() => import("../command"), "CommandEmpty"),
  fallback,
);
export const CommandGroup = lazyComponent(
  () => named(() => import("../command"), "CommandGroup"),
  fallback,
);
export const CommandInput = lazyComponent(
  () => named(() => import("../command"), "CommandInput"),
  fallback,
);
export const CommandItem = lazyComponent(
  () => named(() => import("../command"), "CommandItem"),
  fallback,
);
export const CommandList = lazyComponent(
  () => named(() => import("../command"), "CommandList"),
  fallback,
);
export const CommandSeparator = lazyComponent(
  () => named(() => import("../command"), "CommandSeparator"),
  fallback,
);
export const CommandShortcut = lazyComponent(
  () => named(() => import("../command"), "CommandShortcut"),
  fallback,
);
