import React from "react";
import { LumeLogo } from "../LumeLogo";
import { MainNavigation } from "../MainNavigation";
import { useSidebarContext } from "./SidebarContext";
import { Button, cn } from "@lumeweb/portal-framework-ui-core";
import { SidebarToggle } from "./SidebarToggle";

function DesktopSidebar() {
  const { isCollapsed, toggleCollapsed } = useSidebarContext();

  return (
    <aside
      className={cn(
        "hidden md:flex",
        "flex flex-col fixed top-0 left-0 z-20 h-screen -translate-x-full lg:translate-x-0 transition-[width] ease-in-out duration-300",
        {
          "sm:w-[20%]": !isCollapsed,
          "sm:w-[10%]": isCollapsed,
        },
      )}>
      <SidebarToggle setIsOpen={toggleCollapsed} isOpen={!isCollapsed} />
      <div className="relative h-full flex flex-col px-3 py-4 overflow-y-auto  justify-between">
        <div>
          <Button
            className={cn(
              "transition-transform ease-in-out duration-300 mb-1",
              !isCollapsed ? "translate-x-1" : "translate-x-0",
            )}
            variant="link"
            asChild>
            <LumeLogo
              imageClassName={cn("transition transition-all", {
                "h-5": isCollapsed,
              })}
            />
          </Button>
          <MainNavigation isOpen={!isCollapsed} />
        </div>
        <span
          className={cn(
            "text-foreground/60 mb-3 space-y-1 transition-opacity duration-300 mb-4",
            {
              "opacity-0": isCollapsed,
              "opacity-100": !isCollapsed,
              "text-sm": isCollapsed,
            },
          )}>
          <p>Freedom</p>
          <p>Privacy</p>
          <p>Ownership</p>
        </span>
      </div>
    </aside>
  );
}

export default DesktopSidebar;

const Spacer: React.FC = () => {
  return <div className="flex-grow" />;
};
