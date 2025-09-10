import { Button, cn } from "@lumeweb/portal-framework-ui-core";
import React from "react";

const NavigationButton = ({
  active,
  children,
}: React.PropsWithChildren<{ active?: boolean }>) => {
  return (
    <Button
      className={cn(
        "text-foreground/70 hover:bg-secondary/80 h-14 w-full justify-start",
        active &&
          "border-border/30 text-foreground border font-semibold hover:bg-transparent",
      )}
      variant="ghost">
      {children}
    </Button>
  );
};

export default NavigationButton;
