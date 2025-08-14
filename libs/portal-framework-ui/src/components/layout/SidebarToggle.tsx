import { Button, cn } from "@lumeweb/portal-framework-ui-core";
import { ChevronLeft } from "lucide-react";
import React from "react";

interface SidebarToggleProps {
  isOpen: boolean | undefined;
  setIsOpen?: () => void;
}

export function SidebarToggle({ isOpen, setIsOpen }: SidebarToggleProps) {
  return (
    <div className="invisible lg:visible absolute top-[12px] -right-[16px] z-20">
      <Button
        className="rounded-md w-8 h-8"
        onClick={() => setIsOpen?.()}
        size="icon"
        variant="outline">
        <ChevronLeft
          className={cn(
            "h-4 w-4 transition-transform ease-in-out duration-700",
            isOpen === false ? "rotate-180" : "rotate-0",
          )}
        />
      </Button>
    </div>
  );
}
