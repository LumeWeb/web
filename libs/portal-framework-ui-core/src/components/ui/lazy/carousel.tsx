import { named, lazyComponent } from "./_util";
import { Skeleton } from "@/components/ui/skeleton";

export type CarouselApi = import("../carousel").CarouselApi;

const fallback = <Skeleton className="h-[200px] w-full" />;

export const Carousel = lazyComponent(
  () => named(() => import("../carousel"), "Carousel"),
  fallback,
);
export const CarouselContent = lazyComponent(
  () => named(() => import("../carousel"), "CarouselContent"),
  fallback,
);
export const CarouselItem = lazyComponent(
  () => named(() => import("../carousel"), "CarouselItem"),
  fallback,
);
export const CarouselNext = lazyComponent(
  () => named(() => import("../carousel"), "CarouselNext"),
  fallback,
);
export const CarouselPrevious = lazyComponent(
  () => named(() => import("../carousel"), "CarouselPrevious"),
  fallback,
);
