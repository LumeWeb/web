import { Button, cn, lazyIcon } from "@lumeweb/portal-framework-ui-core";

import React from "react";
const ChevronLeft = lazyIcon("ChevronLeft");


interface SidebarToggleProps {
  isOpen: boolean | undefined;
  setIsOpen?: () => void;
}

export function SidebarToggle({ isOpen, setIsOpen }: SidebarToggleProps) {
  return (
    <div className="invisible absolute -right-[20px] top-[12px] z-20 lg:visible">
      <Button
        aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
        className="h-8 w-8 rounded-md"
        onClick={() => setIsOpen?.()}
        size="icon"
        variant="outline">
        <ChevronLeft
          className={cn(
            "h-4 w-4 transition-transform duration-700 ease-in-out",
            isOpen === false ? "rotate-180" : "rotate-0",
          )}
        />
      </Button>
    </div>
  );
}
