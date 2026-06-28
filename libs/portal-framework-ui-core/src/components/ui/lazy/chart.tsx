import { named, lazyComponent } from "./_util";
import { Skeleton } from "@/components/ui/skeleton";

export type ChartConfig = import("../chart").ChartConfig;

const fallback = <Skeleton className="h-[200px] w-full" />;

export const ChartContainer = lazyComponent(
  () => named(() => import("../chart"), "ChartContainer"),
  fallback,
);
export const ChartLegend = lazyComponent(
  () => named(() => import("../chart"), "ChartLegend"),
  fallback,
);
export const ChartLegendContent = lazyComponent(
  () => named(() => import("../chart"), "ChartLegendContent"),
  fallback,
);
export const ChartStyle = lazyComponent(
  () => named(() => import("../chart"), "ChartStyle"),
  fallback,
);
export const ChartTooltip = lazyComponent(
  () => named(() => import("../chart"), "ChartTooltip"),
  fallback,
);
export const ChartTooltipContent = lazyComponent(
  () => named(() => import("../chart"), "ChartTooltipContent"),
  fallback,
);
