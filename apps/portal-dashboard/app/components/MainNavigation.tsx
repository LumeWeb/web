import React, { createElement } from "react";
import { useLocation } from "@remix-run/react";
import {
  Navigation,
  NavigationItem,
  NavigationItemContent,
  NavigationSubItem,
} from "./ui/navigation-menu";
import { MenuItem } from "@/types.js";
import useMenuItems from "@/hooks/useMenuItems.js";

const NavItem: React.FC<{ item: MenuItem; active: boolean }> = ({
  item,
  active,
}) => {
  return (
    <NavigationItem active={active} key={item.key} href={item.path}>
      <NavigationItemContent>
        <div className="flex items-center">
          {item.icon &&
            createElement(item.icon, {
              // @ts-ignore
              className: "w-5 h-5 mr-2",
            })}
          {item.label}
        </div>
      </NavigationItemContent>
      {item.children?.map((child) => (
        <NavigationSubItem key={child.key} href={child.path}>
          {child.label}
        </NavigationSubItem>
      ))}
    </NavigationItem>
  );
};

export const MainNavigation: React.FC = () => {
  const location = useLocation();
  const menu = useMenuItems();

  const renderMenuItem = (item: MenuItem) => {
    const isActive = location.pathname.startsWith(item.path);
    return <NavItem key={item.key} item={item} active={isActive} />;
  };

  return <Navigation>{menu.getMenuItems().map(renderMenuItem)}</Navigation>;
};
