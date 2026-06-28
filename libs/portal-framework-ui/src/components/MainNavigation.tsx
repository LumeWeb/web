import { ScrollArea } from "@lumeweb/portal-framework-ui-core";
import React from "react";
import { useLocation } from "react-router";

import { useMenuItems } from "@/hooks/useMenuItems";
import {
  type NavigationGroup,
  useNavigationTree,
} from "@/hooks/useNavigationTree";

import { NavigationTreeRenderer } from "./NavigationTreeRenderer";

interface MenuProps {
  isOpen: boolean;
  onItemClick?: () => void;
}

export const MainNavigation: React.FC<MenuProps> = ({
  isOpen,
  onItemClick,
}) => {
  const menu = useMenuItems();
  const location = useLocation();
  const pathname = location.pathname;

  const { sections } = useNavigationTree(menu.menuItems);

  const resetKey = typeof onItemClick === "function" ? pathname : undefined;

  const renderSection = (group: NavigationGroup, sectionIndex: number) => {
    const sectionHeader = group.section ?? "Default";

    // For the default section (null), render items without a header
    if (group.section === null) {
      return (
        <NavigationTreeRenderer
          isOpen={isOpen}
          key={`section-${sectionIndex}`}
          onItemClick={onItemClick}
          resetKey={resetKey}
          tree={group.items}
        />
      );
    }

    return (
      <li key={`section-${sectionIndex}`}>
        <div className="mb-2 mt-4 flex items-center px-2">
          <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {sectionHeader}
          </h5>
          <div className="ml-2 flex-1 border-t border-border" />
        </div>
        <NavigationTreeRenderer
          isOpen={isOpen}
          onItemClick={onItemClick}
          resetKey={resetKey}
          tree={group.items}
        />
      </li>
    );
  };

  return (
    <ScrollArea className="[&>div>div[style]]:!block">
      <nav className="mt-8 flex h-full w-full flex-col">
        <ul className="flex flex-1 flex-col items-start overflow-y-auto overflow-x-hidden px-2">
          {Object.entries(sections).map(([key, group], index) =>
            renderSection(group, index),
          )}
        </ul>
      </nav>
    </ScrollArea>
  );
};
