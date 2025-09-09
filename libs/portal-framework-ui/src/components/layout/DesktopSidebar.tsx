import { FlexWidgetArea } from "@lumeweb/portal-framework-core";
import { Button, cn } from "@lumeweb/portal-framework-ui-core";
import React from "react";

import { LumeLogo } from "../LumeLogo";
import { MainNavigation } from "../MainNavigation";
import { useSidebarContext } from "./SidebarContext";
import { SidebarToggle } from "./SidebarToggle";

function DesktopSidebar() {
  const { isCollapsed, toggleCollapsed } = useSidebarContext();

  return (
    <aside
      className={cn(
        "hidden md:flex",
        "fixed left-0 top-0 z-20 flex h-screen -translate-x-full flex-col transition-[width] duration-300 ease-in-out lg:translate-x-0",
        {
          "md:w-32": isCollapsed,
          "md:w-72": !isCollapsed,
        },
      )}>
      <SidebarToggle isOpen={!isCollapsed} setIsOpen={toggleCollapsed} />
      <div className="relative flex h-full flex-col justify-between px-3 py-4">
        <div>
          <Button
            asChild
            className={cn(
              "mb-1 transition-transform duration-300 ease-in-out",
              !isCollapsed ? "translate-x-1" : "translate-x-0",
            )}
            variant="link">
            <LumeLogo
              imageClassName={cn("transition transition-all", {
                "h-5": isCollapsed,
              })}
            />
          </Button>
          <MainNavigation isOpen={!isCollapsed} />
        </div>
        <FlexWidgetArea id={"core:desktop-sidebar"} />
        <span
          className={cn(
            "text-foreground/60 mb-4 space-y-1 transition-opacity duration-300",
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
