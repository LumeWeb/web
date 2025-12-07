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

const isRouteActive = (
  item: NavigationItemType,
  currentPathname: string,
): boolean => {
  const itemPath = item.path;

  if (!itemPath) return false;

  // Exact match
  if (itemPath === currentPathname) return true;

  // Check if current path starts with item path + "/"
  if (itemPath !== "/" && currentPathname.startsWith(`${itemPath}/`))
    return true;

  return false;
};

const isChildRouteActive = (
  child: NavigationItemType,
  parent: NavigationItemType,
  currentPathname: string,
): boolean => {
  // Special handling for index routes - they should be active when we're on the parent path
  if (child.index && child.path === "" && parent.path === currentPathname) {
    return true;
  }

  return isRouteActive(child, currentPathname);
};

interface BaseNavItemProps {
  active: boolean;
  IconComponent: React.FC<NavigationItemIconProps> | undefined;
  isCollapsed: boolean;
  item: NavigationItemType;
  onItemClick?: () => void;
}

const NavItemContent: React.FC<BaseNavItemProps> = ({
  IconComponent,
  isCollapsed,
  item,
}) => (
  <div className="flex items-center">
    {IconComponent && (
      <span className="mr-2 h-5 w-5">
        <IconComponent />
      </span>
    )}
    <span className={cn({ hidden: isCollapsed })}>{item.label}</span>
  </div>
);

interface CollapseMenuButtonProps {
  active: boolean;
  icon?: React.FC<NavigationItemIconProps>;
  isOpen: boolean;
  item: NavigationItemType;
  label: string;
  onItemClick?: () => void;
  resetKey?: string;
  submenus: Submenu[];
}

interface Submenu {
  active?: boolean;
  href: string;
  icon?: React.FC<NavigationItemIconProps>;
  label: string;
}

const CollapseMenuButton: React.FC<CollapseMenuButtonProps> = ({
  active,
  icon: Icon,
  isOpen,
  item,
  label,
  onItemClick,
  resetKey,
  submenus,
}) => {
  const location = useLocation();
  const pathname = location.pathname; // Get current path
  const isSubmenuActive = submenus.some((submenu) =>
    submenu.active === undefined ? submenu.href === pathname : submenu.active,
  );
  const [isOpenState, setIsOpenState] = React.useState<boolean>(
    active || isSubmenuActive,
  );
  const headerHref = item.path || submenus[0]?.href;

  React.useEffect(() => {
    setIsOpenState(active || isSubmenuActive);
  }, [active, isSubmenuActive]);

  // Reset state when resetKey changes (mobile navigation)
  React.useEffect(() => {
    if (resetKey) {
      setIsOpenState(false);
    }
  }, [resetKey]);

  return (
    <Collapsible
      className="w-full"
      onOpenChange={setIsOpenState}
      open={isOpenState}>
      <CollapsibleTrigger
        asChild
        className="mb-1 [&[data-state=open]>div>div>svg]:rotate-180">
        <Button
          className="h-10 w-full justify-start"
          variant={active || isSubmenuActive ? "secondary" : "ghost"}>
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center">
              {Icon && (
                <span className="mr-4">
                  <Icon size={18} />
                </span>
              )}
              {headerHref && item.linkable !== false ? (
                <Link
                  aria-label={label}
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => {
                    if (e.key === " ") {
                      e.preventDefault(); // avoid page scroll
                      e.stopPropagation();
                    }
                    if (e.key === "Enter") {
                      e.stopPropagation();
                    }
                  }}
                  to={headerHref}>
                  <p
                    className={cn({
                      "-translate-x-96 opacity-0": !isOpen,
                      "translate-x-0 opacity-100": isOpen,
                    })}>
                    {label}
                  </p>
                </Link>
              ) : (
                <p
                  aria-disabled="true"
                  className={cn({
                    "-translate-x-96 opacity-0": !isOpen,
                    "translate-x-0 opacity-100": isOpen,
                  })}>
                  {label}
                </p>
              )}
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
      <CollapsibleContent className="data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down overflow-hidden">
        {submenus.map(({ active, href, icon: Icon, label }, index) => (
          <Button
            asChild
            className="mb-1 h-10 w-full justify-start"
            key={index}
            variant={
              (active === undefined && pathname === href) || active
                ? "secondary"
                : "ghost"
            }>
            <Link
              onClick={() => {
                if (onItemClick) {
                  onItemClick();
                }
              }}
              to={href}>
              <span className="ml-2 mr-4">
                {Icon ? <Icon size={18} /> : <Dot size={18} />}
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

const LinkableNavItem: React.FC<BaseNavItemProps> = ({
  active,
  IconComponent,
  isCollapsed,
  item,
  onItemClick,
}) => (
  <Button
    asChild
    className="mb-1 h-10 w-full justify-start"
    variant={active ? "secondary" : "ghost"}>
    <Link onClick={onItemClick} to={item.path || ""}>
      <NavItemContent
        active={active}
        IconComponent={IconComponent}
        isCollapsed={isCollapsed}
        item={item}
        onItemClick={onItemClick}
      />
    </Link>
  </Button>
);

const NonLinkableNavItem: React.FC<BaseNavItemProps> = ({
  active,
  IconComponent,
  isCollapsed,
  item,
  onItemClick,
}) => (
  <Button
    className="mb-1 h-10 w-full justify-start"
    onClick={onItemClick}
    variant={active ? "secondary" : "ghost"}>
    <NavItemContent
      active={active}
      IconComponent={IconComponent}
      isCollapsed={isCollapsed}
      item={item}
      onItemClick={onItemClick}
    />
  </Button>
);

interface MenuProps {
  isOpen: boolean;
  onItemClick?: () => void;
}

const NavItem: React.FC<{
  active: boolean;
  item: NavigationItemType;
  onItemClick?: () => void;
}> = (
  {
    ref,
    active,
    item,
    onItemClick
  }: { active: boolean; item: NavigationItemType; onItemClick?: () => void } & {
    ref: React.RefObject<HTMLLIElement>;
  }
) => {
  const { isCollapsed } = useSidebarContext();

  let IconComponent: React.FC<NavigationItemIconProps> | undefined = undefined;

  if (item.icon) {
    IconComponent = item.icon;
  }

  return (
    <li ref={ref}>
      {item.linkable !== false && Boolean(item.path) ? (
        <LinkableNavItem
          active={active}
          IconComponent={IconComponent}
          isCollapsed={isCollapsed}
          item={item}
          onItemClick={onItemClick}
        />
      ) : (
        <NonLinkableNavItem
          active={active}
          IconComponent={IconComponent}
          isCollapsed={isCollapsed}
          item={item}
          onItemClick={onItemClick}
        />
      )}
    </li>
  );
};
NavItem.displayName = "NavItem";

export const MainNavigation: React.FC<MenuProps> = ({
  isOpen,
  onItemClick,
}) => {
  const menu = useMenuItems(); // Get menu data
  const location = useLocation();
  const pathname = location.pathname;

  const renderMenuItem = (item: NavigationItemType) => {
    const active = isRouteActive(item, pathname);

    if (item.children && item.children.length > 0) {
      const submenus: Submenu[] = item.children.map((child) => ({
        active: isChildRouteActive(child, item, pathname),
        href: child.index ? item.path : child.path || "",
        icon: child.icon,
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
          item={item}
          key={item.id}
          label={item.label}
          onItemClick={onItemClick}
          resetKey={typeof onItemClick === "function" ? pathname : undefined}
          submenus={submenus}
        />
      );
    } else {
      return (
        <TooltipProvider disableHoverableContent key={item.id}>
          <Tooltip delayDuration={100}>
            <TooltipTrigger asChild>
              <NavItem active={active} item={item} onItemClick={onItemClick} />
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
      <nav className="mt-8 flex h-full w-full flex-col">
        <ul className="flex flex-1 flex-col items-start space-y-1 overflow-y-auto overflow-x-hidden px-2">
          {menu.getMenuItems().map(renderMenuItem)}
        </ul>
      </nav>
    </ScrollArea>
  );
};
