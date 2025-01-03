import React from "react";
import { Button } from "portal-shared/components/ui/button";
import { cn } from "portal-shared/util/cn.js";

const NavigationButton = ({
  children,
  active,
}: React.PropsWithChildren<{ active?: boolean }>) => {
  return (
    <Button
      variant="ghost"
      className={cn(
        "justify-start h-14 w-full text-foreground/70 hover:bg-secondary/80",
        active &&
          "border border-border/30 font-semibold  text-foreground hover:bg-transparent",
      )}>
      {children}
    </Button>
  );
};

export default NavigationButton;
