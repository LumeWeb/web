import type {
  NavigationItem as NavigationItemType,
  NavigationItemIconProps,
} from "@lumeweb/portal-framework-core";
import React from "react";
import { useMatches } from "react-router";
import { useSidebarContext } from "./layout/SidebarContext";
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
import { useMenuItems } from "@/hooks/useMenuItems";
import { ChevronDown, Dot } from "lucide-react";
import { Link } from "@refinedev/core";

type Submenu = {
  href: string;
  label: string;
  active?: boolean;
};

interface CollapseMenuButtonProps {
  icon?: React.FC<NavigationItemIconProps>;
  label: string;
  active: boolean;
  submenus: Submenu[];
  isOpen: boolean;
}

const CollapseMenuButton: React.FC<CollapseMenuButtonProps> = ({
  icon: Icon,
  label,
  active,
  submenus,
  isOpen,
}) => {
  const pathname = useMatches()[0]?.pathname || ""; // Get current path
  const isSubmenuActive = submenus.some((submenu) =>
    submenu.active === undefined ? submenu.href === pathname : submenu.active,
  );
  const [isCollapsed, setIsCollapsed] =
    React.useState<boolean>(isSubmenuActive);

  return (
    <Collapsible
      open={isCollapsed}
      onOpenChange={setIsCollapsed}
      className="w-full">
      <CollapsibleTrigger
        className="[&[data-state=open]>div>div>svg]:rotate-180 mb-1"
        asChild>
        <Button
          variant={isSubmenuActive ? "secondary" : "ghost"}
          className="w-full justify-start h-10">
          <div className="w-full items-center flex justify-between">
            <div className="flex items-center">
              {Icon && (
                <span className="mr-4">
                  <Icon size={18} />
                </span>
              )}
              <Link to={"/abuse"}>
                {" "}
                {/* Link only wraps the text */}
                <p
                  className={cn(
                    "max-w-[150px] truncate",
                    isOpen
                      ? "translate-x-0 opacity-100"
                      : "-translate-x-96 opacity-0",
                  )}>
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
                size={18}
                className="transition-transform duration-200"
              />
            </div>
          </div>
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
        {submenus.map(({ href, label, active }, index) => (
          <Button
            key={index}
            variant={
              (active === undefined && pathname === href) || active
                ? "secondary"
                : "ghost"
            }
            className="w-full justify-start h-10 mb-1"
            asChild>
            <Link to={href}>
              <span className="mr-4 ml-2">
                <Dot size={18} />
              </span>
              <p
                className={cn(
                  "max-w-[170px] truncate",
                  isOpen
                    ? "translate-x-0 opacity-100"
                    : "-translate-x-96 opacity-0",
                )}>
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
          variant={active ? "secondary" : "ghost"}
          className="w-full justify-start h-10 mb-1"
          asChild>
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
  const matches = useMatches();
  const pathname = matches[0]?.pathname || "";

  const renderMenuItem = (item: NavigationItemType) => {
    const active = matches.some((match) => {
      const isDirectMatch = match.pathname === item.path;
      const isNestedMatch =
        item.path &&
        match.pathname.startsWith(`${item.path}/`) &&
        match.pathname !== item.path;
      if (item.path === "/" && (isDirectMatch || isNestedMatch)) {
        return true;
      }
      return isDirectMatch || isNestedMatch;
    });

    if (item.children && item.children.length > 0) {
      const submenus: Submenu[] = item.children.map((child) => ({
        href: child.path || "",
        label: child.label,
        active: child.path ? pathname.startsWith(child.path) : false,
      }));

      let CollapseMenuIcon: React.FC<NavigationItemIconProps> | undefined =
        undefined;

      if (item.icon) {
        CollapseMenuIcon = item.icon;
      }

      return (
        <CollapseMenuButton
          key={item.id}
          icon={CollapseMenuIcon}
          label={item.label}
          active={active}
          submenus={submenus}
          isOpen={isOpen}
        />
      );
    } else {
      return (
        <TooltipProvider key={item.id} disableHoverableContent>
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
