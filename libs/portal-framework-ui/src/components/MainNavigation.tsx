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
    if (group.section === null) {
      return (
        <NavigationTreeRenderer
          indent={false}
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
            {group.section}
          </h5>
          <div className="ml-2 flex-1 border-t border-border" />
        </div>
        <NavigationTreeRenderer
          indent={false}
          isOpen={isOpen}
          onItemClick={onItemClick}
          resetKey={resetKey}
          tree={group.items}
        />
      </li>
    );
  };

  return (
    <ScrollArea className="mt-8 flex-1" type="auto">
      <nav className="flex flex-col">
        <ul className="flex flex-col px-2">
          {Object.entries(sections).map(([key, group], index) =>
            renderSection(group, index),
          )}
        </ul>
      </nav>
    </ScrollArea>
  );
};
