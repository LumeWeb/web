import {
  Navigation,
  NavigationItem,
  NavigationItemContent,
  NavigationSubItem,
} from "@/components/ui/navigation-menu";
import useIsBillingEnabled from "@/hooks/useIsBillingEnabled";
import useMenuItems from "@/hooks/useMenuItems";
import type { MenuItem } from "@/types";
import { useMatches } from "@remix-run/react";
import type React from "react";
import { createElement } from "react";

const NavItem: React.FC<{ item: MenuItem; active: boolean }> = ({
  item,
  active,
}) => {
  const billingEnable = useIsBillingEnabled();
  const matches = useMatches();
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
      {item.children
        ?.filter((item) => {
          if (item.key === "subscription" && !billingEnable) {
            return false;
          }

          return true;
        })
        ?.map((child) => {
          const isActive = child.path ? matches.some((match) => match.pathname.startsWith(child.path)) : false;
          return (
          <NavigationSubItem key={child.key} href={child.path} active={isActive}>
            {child.label}
          </NavigationSubItem>
        )})}
    </NavigationItem>
  );
};

export const MainNavigation: React.FC = () => {
  const matches = useMatches();
  const menu = useMenuItems();

  const renderMenuItem = (item: MenuItem) => {
    const paths = item.path === "/" ? ["/dashboard"] : [item.path, ...(item.children?.map(child => child.path) ?? [])];
    const isActive = matches.some((match) => paths.some(path => match.pathname.startsWith(path)));
    return <NavItem key={item.key} item={item} active={isActive} />;
  };

  return <Navigation>{menu.getMenuItems().map(renderMenuItem)}</Navigation>;
};
