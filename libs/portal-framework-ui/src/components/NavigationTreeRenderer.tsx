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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@lumeweb/portal-framework-ui-core";
import { Link } from "@refinedev/core";
import { ChevronDown } from "lucide-react";
import React from "react";
import { useLocation } from "react-router";

import type { NavigationTreeNode } from "@/hooks/useNavigationTree";

import { useSidebarContext } from "./layout/SidebarContext";

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */

const isRouteActive = (
  item: NavigationItemType,
  currentPathname: string,
): boolean => {
  const itemPath = item.path;
  if (!itemPath) return false;
  if (itemPath === currentPathname) return true;
  if (itemPath !== "/" && currentPathname.startsWith(`${itemPath}/`))
    return true;
  return false;
};

const isChildRouteActive = (
  child: NavigationItemType,
  parent: NavigationItemType,
  currentPathname: string,
): boolean => {
  if (child.index && child.path === "" && parent.path === currentPathname) {
    return true;
  }
  return isRouteActive(child, currentPathname);
};

/**
 * Walk a tree node's descendants and return true if any descendant
 * route matches `currentPathname`. Used to auto-open collapsible
 * sections that contain an active child at any depth.
 */
const isDescendantActive = (
  node: NavigationTreeNode,
  currentPathname: string,
): boolean => {
  if (!node.children || node.children.length === 0) return false;
  for (const child of node.children) {
    if (isRouteActive(child, currentPathname)) return true;
    if (isDescendantActive(child, currentPathname)) return true;
  }
  return false;
};

/* ------------------------------------------------------------------ */
/* NavItemContent / leaf rendering                                      */
/* ------------------------------------------------------------------ */

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
    variant={active ? "secondary" : "ghost"}
  >
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
    variant={active ? "secondary" : "ghost"}
  >
    <NavItemContent
      active={active}
      IconComponent={IconComponent}
      isCollapsed={isCollapsed}
      item={item}
      onItemClick={onItemClick}
    />
  </Button>
);

const LeafNavItem: React.FC<{
  active: boolean;
  item: NavigationTreeNode;
  isOpen: boolean;
  onItemClick?: () => void;
}> = React.forwardRef<
  HTMLLIElement,
  {
    active: boolean;
    item: NavigationTreeNode;
    isOpen: boolean;
    onItemClick?: () => void;
  }
>(({ active, item, isOpen, onItemClick }, ref) => {
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
          isCollapsed={!isOpen}
          item={item}
          onItemClick={onItemClick}
        />
      ) : (
        <NonLinkableNavItem
          active={active}
          IconComponent={IconComponent}
          isCollapsed={!isOpen}
          item={item}
          onItemClick={onItemClick}
        />
      )}
    </li>
  );
});
LeafNavItem.displayName = "LeafNavItem";

/* ------------------------------------------------------------------ */
/* Recursive collapsible section                                        */
/* ------------------------------------------------------------------ */

/**
 * Renders a node that has children as a collapsible section.
 * When open, children are rendered recursively via NavigationTreeRenderer.
 */
const CollapseMenuRecursive: React.FC<{
  isOpen: boolean;
  node: NavigationTreeNode;
  onItemClick?: () => void;
  resetKey?: string;
}> = ({ isOpen, node, onItemClick, resetKey }) => {
  const location = useLocation();
  const pathname = location.pathname;

  const active = isRouteActive(node, pathname);
  const childActive = isDescendantActive(node, pathname);

  const [isSectionOpen, setIsSectionOpen] = React.useState<boolean>(active || childActive);

  React.useEffect(() => {
    setIsSectionOpen(active || childActive);
  }, [active, childActive]);

  // Reset state when resetKey changes (mobile navigation)
  React.useEffect(() => {
    if (resetKey) {
      setIsSectionOpen(false);
    }
  }, [resetKey]);

  let IconComponent: React.FC<NavigationItemIconProps> | undefined = undefined;
  if (node.icon) {
    IconComponent = node.icon;
  }

  const headerHref = node.path || undefined;

  return (
    <Collapsible
      className="w-full"
      onOpenChange={setIsSectionOpen}
      open={isSectionOpen}
    >
      <CollapsibleTrigger
        asChild
        className="mb-1 [&[data-state=open]>div>div>svg]:rotate-180"
      >
        <Button
          className="h-10 w-full justify-start"
          variant={active || childActive ? "secondary" : "ghost"}
        >
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center">
              {IconComponent && (
                <span className="mr-4">
                  <IconComponent size={18} />
                </span>
              )}
              {headerHref && node.linkable !== false ? (
                <Link
                  aria-label={node.label}
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => {
                    if (e.key === " ") {
                      e.preventDefault();
                      e.stopPropagation();
                    }
                    if (e.key === "Enter") {
                      e.stopPropagation();
                    }
                  }}
                  to={headerHref}
                >
                  <p
                    className={cn({
                      "-translate-x-96 opacity-0": !isOpen,
                      "translate-x-0 opacity-100": isOpen,
                    })}
                  >
                    {node.label}
                  </p>
                </Link>
              ) : (
                <p
                  aria-disabled="true"
                  className={cn({
                    "-translate-x-96 opacity-0": !isOpen,
                    "translate-x-0 opacity-100": isOpen,
                  })}
                >
                  {node.label}
                </p>
              )}
            </div>
            <div
              className={cn(
                "whitespace-nowrap",
                isOpen
                  ? "translate-x-0 opacity-100"
                  : "-translate-x-96 opacity-0",
              )}
            >
              <ChevronDown
                className="transition-transform duration-200"
                size={18}
              />
            </div>
          </div>
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down overflow-hidden">
        <NavigationTreeRenderer
          isOpen={isOpen}
          onItemClick={onItemClick}
          resetKey={resetKey}
          tree={node.children}
        />
      </CollapsibleContent>
    </Collapsible>
  );
};

/* ------------------------------------------------------------------ */
/* NavigationTreeItem — decides leaf vs collapsible                     */
/* ------------------------------------------------------------------ */

const NavigationTreeItem: React.FC<{
  isOpen: boolean;
  node: NavigationTreeNode;
  onItemClick?: () => void;
  resetKey?: string;
}> = ({ isOpen, node, onItemClick, resetKey }) => {
  const location = useLocation();
  const pathname = location.pathname;
  const active = isRouteActive(node, pathname);
  const hasChildren = node.children && node.children.length > 0;

  if (hasChildren) {
    return (
      <li>
        <CollapseMenuRecursive
          isOpen={isOpen}
          node={node}
          onItemClick={onItemClick}
          resetKey={resetKey}
        />
      </li>
    );
  }

  return (
    <TooltipProvider disableHoverableContent key={node.id}>
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <LeafNavItem
            active={active}
            item={node}
            isOpen={isOpen}
            onItemClick={onItemClick}
          />
        </TooltipTrigger>
        {isOpen === false && (
          <TooltipContent side="right">{node.label}</TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};

/* ------------------------------------------------------------------ */
/* NavigationTreeRenderer — public component                           */
/* ------------------------------------------------------------------ */

export interface NavigationTreeRendererProps {
  tree: NavigationTreeNode[];
  /** Whether the sidebar is in expanded (labels visible) mode. */
  isOpen?: boolean;
  onItemClick?: () => void;
  /** When this value changes, all collapsible sections reset to closed. */
  resetKey?: string;
}

/**
 * Recursively renders a navigation tree to arbitrary depth.
 *
 * - Nodes with `children.length > 0` render as `CollapseMenuRecursive` (collapsible).
 * - Leaf nodes render as `LeafNavItem`.
 * - Calls itself recursively for each level of children.
 *
 * Replaces the previous flat `Submenu[]` approach that hardcoded 2 levels.
 */
export const NavigationTreeRenderer: React.FC<NavigationTreeRendererProps> = ({
  tree,
  isOpen = true,
  onItemClick,
  resetKey,
}) => {
  return (
    <ul className="flex flex-col space-y-1">
      {tree.map((node) => (
        <NavigationTreeItem
          isOpen={isOpen}
          key={node.id}
          node={node}
          onItemClick={onItemClick}
          resetKey={resetKey}
        />
      ))}
    </ul>
  );
};
