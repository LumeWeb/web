import { Button, cn } from "@lumeweb/portal-framework-ui-core";
import React from "react";

const NavigationButton = ({
  active,
  children,
}: React.PropsWithChildren<{ active?: boolean }>) => {
  return (
    <Button
      className={cn(
        "justify-start h-14 w-full text-foreground/70 hover:bg-secondary/80",
        active &&
          "border border-border/30 font-semibold  text-foreground hover:bg-transparent",
      )}
      variant="ghost">
      {children}
    </Button>
  );
};

export default NavigationButton;
