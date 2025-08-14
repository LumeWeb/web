import type {
  NavigationItemIconProps,
  NavigationItem as NavigationItemType,
} from "@lumeweb/portal-framework-core";

import {
  Button,
  cn,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  ScrollArea,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@lumeweb/portal-framework-ui-core";
import { Link } from "@refinedev/core";
import { ChevronDown, Dot } from "lucide-react";
import React from "react";
import { useLocation } from "react-router";

import { useMenuItems } from "@/hooks/useMenuItems";

import { useSidebarContext } from "./layout/SidebarContext";

interface CollapseMenuButtonProps {
  active: boolean;
  icon?: React.FC<NavigationItemIconProps>;
  isOpen: boolean;
  label: string;
  submenus: Submenu[];
}

interface Submenu {
  active?: boolean;
  href: string;
  label: string;
}

const CollapseMenuButton: React.FC<CollapseMenuButtonProps> = ({
  active,
  icon: Icon,
  isOpen,
  label,
  submenus,
}) => {
  const location = useLocation();
  const pathname = location.pathname; // Get current path
  const isSubmenuActive = submenus.some((submenu) =>
    submenu.active === undefined ? submenu.href === pathname : submenu.active,
  );
  const [isCollapsed, setIsCollapsed] =
    React.useState<boolean>(isSubmenuActive);

  return (
    <Collapsible
      className="w-full"
      onOpenChange={setIsCollapsed}
      open={isCollapsed}>
      <CollapsibleTrigger
        asChild
        className="[&[data-state=open]>div>div>svg]:rotate-180 mb-1">
        <Button
          className="w-full justify-start h-10"
          variant={isSubmenuActive ? "secondary" : "ghost"}>
          <div className="w-full items-center flex justify-between">
            <div className="flex items-center">
              {Icon && (
                <span className="mr-4">
                  <Icon size={18} />
                </span>
              )}
              <Link to={submenus[0]?.href || "#"}>
                {/* Link only wraps the text */}
                <p
                  className={cn({
                    "-translate-x-96 opacity-0": !isOpen,
                    "translate-x-0 opacity-100": isOpen,
                  })}>
                  {label}
                </p>
              </Link>
            </div>
            <div
              className={cn(
                "whitespace-nowrap",
                isOpen
                  ? "translate-x-0 opacity-100"
                  : "-translate-x-96 opacity-0",
              )}>
              <ChevronDown
                className="transition-transform duration-200"
                size={18}
              />
            </div>
          </div>
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
        {submenus.map(({ active, href, label }, index) => (
          <Button
            asChild
            className="w-full justify-start h-10 mb-1"
            key={index}
            variant={
              (active === undefined && pathname === href) || active
                ? "secondary"
                : "ghost"
            }>
            <Link to={href}>
              <span className="mr-4 ml-2">
                <Dot size={18} />
              </span>
              <p
                className={cn({
                  "-translate-x-96 opacity-0": !isOpen,
                  "translate-x-0 opacity-100": isOpen,
                })}>
                {label}
              </p>
            </Link>
          </Button>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
};

interface MenuProps {
  isOpen: boolean;
}

const NavItem: React.FC<{ active: boolean; item: NavigationItemType }> =
  React.forwardRef<
    HTMLLIElement,
    { active: boolean; item: NavigationItemType }
  >(({ active, item }, ref) => {
    const { isCollapsed } = useSidebarContext();

    let IconComponent: React.FC<NavigationItemIconProps> | undefined =
      undefined;

    if (item.icon) {
      IconComponent = item.icon;
    }

    return (
      <li ref={ref}>
        <Button
          asChild
          className="w-full justify-start h-10 mb-1"
          variant={active ? "secondary" : "ghost"}>
          <Link to={item.path || ""}>
            <div className="flex items-center">
              {IconComponent && (
                <span className="w-5 h-5 mr-2">
                  <IconComponent />
                </span>
              )}
              <span className={cn({ hidden: isCollapsed })}>{item.label}</span>
            </div>
          </Link>
        </Button>
      </li>
    );
  });
NavItem.displayName = "NavItem";

export const MainNavigation: React.FC<MenuProps> = ({ isOpen }) => {
  const menu = useMenuItems(); // Get menu data
  const location = useLocation();
  const pathname = location.pathname;

  const renderMenuItem = (item: NavigationItemType) => {
    const active = item.path === pathname || 
                 (item.path && item.path !== "/" && pathname.startsWith(`${item.path}/`));

    if (item.children && item.children.length > 0) {
      const submenus: Submenu[] = item.children.map((child) => ({
        active: child.path ? pathname.startsWith(child.path) : false,
        href: child.path || "",
        label: child.label,
      }));

      let CollapseMenuIcon: React.FC<NavigationItemIconProps> | undefined =
        undefined;

      if (item.icon) {
        CollapseMenuIcon = item.icon;
      }

      return (
        <CollapseMenuButton
          active={active}
          icon={CollapseMenuIcon}
          isOpen={isOpen}
          key={item.id}
          label={item.label}
          submenus={submenus}
        />
      );
    } else {
      return (
        <TooltipProvider disableHoverableContent key={item.id}>
          <Tooltip delayDuration={100}>
            <TooltipTrigger asChild>
              <NavItem active={active} item={item} />
            </TooltipTrigger>
            {isOpen === false && (
              <TooltipContent side="right">{item.label}</TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      );
    }
  };

  return (
    <ScrollArea className="[&>div>div[style]]:!block">
      <nav className="mt-8 h-full w-full flex flex-col">
        <ul className="flex-1 flex flex-col items-start space-y-1 px-2 overflow-y-auto">
          {menu.getMenuItems().map(renderMenuItem)}
        </ul>
      </nav>
    </ScrollArea>
  );
};
