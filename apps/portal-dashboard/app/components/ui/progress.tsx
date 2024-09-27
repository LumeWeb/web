import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, max, ...props }, ref) => {
  max = max || 100;
  let pVal = 100 - Math.floor(((value || 0) * 100) / max);

  if (pVal == 100) {
    pVal++;
  }
  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-3 w-full overflow-hidden rounded-full bg-ring",
        className,
      )}
      {...props}>
      <ProgressPrimitive.Indicator
        className={`h-full w-full flex-1 bg-foreground rounded-r-full transition-all`}
        style={{
          transform: `translateX(-${pVal}%)`,
        }}
      />
    </ProgressPrimitive.Root>
  );
});
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
