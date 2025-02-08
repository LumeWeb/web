import * as ProgressPrimitive from "@radix-ui/react-progress";
import * as React from "react";

import { cn } from "../../lib/utils";
import { Progress } from "./progress";

const IndeterminateProgress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, ...props }, ref) => (
  <Progress className={cn("indeterminate", className)} ref={ref} {...props}>
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-primary bg-striped-indeterminate"
      style={{ transform: "translateX(-75%)" }}
    />
  </Progress>
));

IndeterminateProgress.displayName = "IndeterminateProgress";

export { IndeterminateProgress };
