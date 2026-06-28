import React from "react";

import { ROOT_PATH } from "./Breadcrumbs";
import { cn, lazyIcon } from "@lumeweb/portal-framework-ui-core";
const Home = lazyIcon("Home");
const ChevronRight = lazyIcon("ChevronRight");


export interface HomeButtonProps {
  currentPath: string;
  navigateToPath: (path: string) => void;
  isMobile?: boolean;
}

export const HomeButton: React.FC<HomeButtonProps> = ({
  currentPath,
  navigateToPath,
  isMobile = false,
}) => {
  return (
    <div className="flex items-center flex-shrink-0">
      <button
        onClick={() => {
          if (ROOT_PATH !== currentPath) {
            navigateToPath(ROOT_PATH);
          }
        }}
        aria-label="Navigate to Home"
        className={cn(
          "hover:bg-muted flex items-center rounded transition-colors min-h-[2.75em] min-w-[2.75em]",
          {
            "px-2 py-2 text-sm font-medium": isMobile,
            "px-3 py-3 text-base font-semibold": !isMobile,
          }
        )}>
        <Home
          aria-hidden="true"
          className={cn("text-muted-foreground", {
            "mr-1 h-4 w-4": isMobile,
            "mr-2 h-5 w-5": !isMobile,
          })}
        />
        <span className={isMobile ? "hidden" : "hidden sm:inline"}>Home</span>
      </button>
      {currentPath !== ROOT_PATH && (
        <ChevronRight
          aria-hidden="true"
          className={cn("text-muted-foreground", {
            "mx-0.5 h-3 w-3": isMobile,
            "mx-1 h-4 w-4": !isMobile,
          })}
        />
      )}
    </div>
  );
};
