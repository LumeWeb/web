import {
  CORE_NS,
  createNamespacedId,
  FlexWidgetArea,
  useBrand,
} from "@lumeweb/portal-framework-core";
import { Button, cn } from "@lumeweb/portal-framework-ui-core";
import React from "react";

import { LumeLogo } from "@/components";
import { MainNavigation } from "@/components";
import { useSidebarContext } from "./SidebarContext";
import { SidebarToggle } from "./SidebarToggle";

function DesktopSidebar() {
  const { isCollapsed, toggleCollapsed } = useSidebarContext();
  const brand = useBrand();

  return (
    <aside
      className={cn(
        "hidden md:flex",
        "fixed left-0 top-0 z-20 h-screen -translate-x-full flex-col transition-[width] duration-300 ease-in-out lg:translate-x-0",
      )}
      style={{
        width: isCollapsed
          ? "var(--sidebar-width-collapsed)"
          : "var(--sidebar-width)",
      }}
    >
      <SidebarToggle isOpen={!isCollapsed} setIsOpen={toggleCollapsed} />
      <div className="flex h-full flex-col justify-between overflow-hidden px-3 py-4">
        <div className="min-w-0 flex-1">
          <Button
            asChild
            className={cn(
              "mb-1 transition-transform duration-300 ease-in-out",
              !isCollapsed ? "translate-x-1" : "translate-x-0",
            )}
            variant="link"
          >
            <LumeLogo
              src={brand.logoUrl}
              imageClassName={cn("transition-all", {
                "h-8 w-8 shrink-0": isCollapsed,
              })}
            />
          </Button>
          <MainNavigation isOpen={!isCollapsed} />
        </div>
        <FlexWidgetArea id={createNamespacedId(CORE_NS, "desktop-sidebar")} />
        <span
          className={cn(
            "text-foreground/60 mt-4 mb-4 block space-y-1 transition-opacity duration-300",
            {
              "opacity-0": isCollapsed,
              "opacity-100": !isCollapsed,
              "text-sm": isCollapsed,
            },
          )}
          dangerouslySetInnerHTML={
            brand.values
              ? { __html: brand.values }
              : undefined
          }
        />
      </div>
    </aside>
  );
}

export default DesktopSidebar;

const Spacer: React.FC = () => {
  return <div className="flex-grow" />;
};
