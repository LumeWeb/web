import { named, lazyComponent } from "./_util";
import { Skeleton } from "@/components/ui/skeleton";

const fallback = <Skeleton className="h-9 w-full" />;

export const Accordion = lazyComponent(
  () => named(() => import("../accordion"), "Accordion"),
  fallback,
);
export const AccordionContent = lazyComponent(
  () => named(() => import("../accordion"), "AccordionContent"),
  fallback,
);
export const AccordionItem = lazyComponent(
  () => named(() => import("../accordion"), "AccordionItem"),
  fallback,
);
export const AccordionTrigger = lazyComponent(
  () => named(() => import("../accordion"), "AccordionTrigger"),
  fallback,
);
