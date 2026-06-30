import type {
  NavigationItemIconProps,
  NavigationItem as NavigationItemType,
} from "@lumeweb/portal-framework-core";

import { Button, cn, Collapsible, CollapsibleContent, CollapsibleTrigger, Popover, PopoverContent, PopoverTrigger, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, lazyIcon } from "@lumeweb/portal-framework-ui-core";
import { Link } from "@refinedev/core";

import React from "react";
import { useLocation } from "react-router";

import type { NavigationTreeNode } from "@/hooks/useNavigationTree";

import { useSidebarContext } from "./layout/SidebarContext";
const ChevronDown = lazyIcon("ChevronDown");
const ChevronRight = lazyIcon("ChevronRight");


/* ------------------------------------------------------------------ */
/* Route matching helpers                                              */
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
/* Indentation                                                         */
/* ------------------------------------------------------------------ */

/**
 * Maximum total accumulated indent in pixels. Beyond this depth,
 * all levels get a flat 8px so deep nesting doesn't eat label space.
 * This mirrors VS Code's approach: 8px default, clamped to 40px max.
 */
const MAX_TOTAL_INDENT = 40;
const BASE_INDENT_PX = 8;

/**
 * Returns the total indent for a given depth, clamped to MAX_TOTAL_INDENT.
 * Each level adds BASE_INDENT_PX, but the total never exceeds the cap.
 */
const getTotalIndent = (depth: number): number => {
  return Math.min(depth * BASE_INDENT_PX, MAX_TOTAL_INDENT);
};

/* ------------------------------------------------------------------ */
/* Depth threshold for cascading flyout                               */
/* ------------------------------------------------------------------ */

/**
 * Beyond this depth, children render in a flyout panel to the right
 * instead of inline. This prevents deep nesting from eating all the
 * sidebar width. Each flyout level is a full-width panel with its own
 * scroll, flowing horizontally like VS Code's cascading panels.
 */
const FLYOUT_DEPTH_THRESHOLD = 3;

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

/**
 * Shared label. Truncated with ellipsis so long labels at deep
 * nesting never overflow the sidebar. Tooltip on hover shows
 * the full text when truncated.
 */
const NavLabel: React.FC<{
  label: string;
  isCollapsed: boolean;
}> = ({ label, isCollapsed }) => (
  <span className={cn("truncate", { hidden: isCollapsed })}>{label}</span>
);

const NavItemContent: React.FC<BaseNavItemProps> = ({
  IconComponent,
  isCollapsed,
  item,
}) => (
  <div className="flex min-w-0 flex-1 items-center">
    {IconComponent && (
      <span className="mr-2 h-5 w-5 shrink-0">
        <IconComponent />
      </span>
    )}
    <NavLabel isCollapsed={isCollapsed} label={item.label} />
  </div>
);

/**
 * Tooltip wrapper for nav items. When collapsed (labels hidden) it shows
 * the full label. When expanded, it shows the description on hover if one
 * is available; otherwise shows the label for potential truncation.
 */
const NavTooltip: React.FC<{
  label: string;
  description?: string;
  isCollapsed: boolean;
  children: React.ReactElement;
}> = ({ label, description, isCollapsed, children }) => {
  // When collapsed, always show label. When expanded, only show tooltip
  // if there's a description (for rich hover text) — label truncation
  // tooltips are still useful so keep the label as fallback.
  const content = isCollapsed ? label : (description ?? label);
  return (
    <TooltipProvider delayDuration={isCollapsed ? 300 : 700}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="block w-full">{children}</span>
        </TooltipTrigger>
        <TooltipContent side="right" className="font-medium">
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
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
    className="mb-1 h-9 w-full justify-start"
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
    className="mb-1 h-9 w-full justify-start"
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
      <NavTooltip isCollapsed={!isOpen} label={item.label} description={item.description}>
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
      </NavTooltip>
    </li>
  );
});
LeafNavItem.displayName = "LeafNavItem";

/* ------------------------------------------------------------------ */
/* Cascading flyout for deep hierarchies                              */
/* ------------------------------------------------------------------ */

/**
 * Individual item inside a flyout panel. Can itself be a flyout
 * if it has children, creating the cascading effect.
 */
const FlyoutNavItem: React.FC<{
  item: NavigationTreeNode;
  isOpen: boolean;
  onItemClick?: () => void;
  depth: number;
  isCollapsed?: boolean;
}> = ({ item, isOpen, onItemClick, depth, isCollapsed = false }) => {
  const hasChildren = item.children && item.children.length > 0;
  const location = useLocation();
  const pathname = location.pathname;
  const active = isRouteActive(item, pathname) || isDescendantActive(item, pathname);

  let IconComponent: React.FC<NavigationItemIconProps> | undefined = undefined;
  if (item.icon) {
    IconComponent = item.icon;
  }

  if (hasChildren) {
    return (
      <li>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              className="mb-1 h-9 w-full justify-start"
              variant={active ? "secondary" : "ghost"}
            >
              <div className="flex w-full items-center justify-between gap-2">
                <div className="flex min-w-0 flex-1 items-center">
                  {IconComponent && (
                    <span className="mr-2 shrink-0">
                      <IconComponent size={18} />
                    </span>
                  )}
                  <span className="truncate">{item.label}</span>
                </div>
                <ChevronRight className="shrink-0" size={16} />
              </div>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            className="w-80 p-2"
            side="right"
            sideOffset={4}
          >
            <ul className="flex flex-col space-y-0.5">
              {item.children!.map((child) => (
                <FlyoutNavItem
                  key={child.id}
                  depth={depth + 1}
                  isOpen={isOpen}
                  item={child}
                  onItemClick={onItemClick}
                />
              ))}
            </ul>
          </PopoverContent>
        </Popover>
      </li>
    );
  }

  return (
    <li>
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

/* ------------------------------------------------------------------ */
/* Recursive collapsible section                                        */
/* ------------------------------------------------------------------ */

/**
 * Renders a node that has children as a collapsible section.
 * Each level gets a left border guide (like shadcn SidebarMenuSub)
 * and a fixed indent. Labels truncate with tooltip on hover.
 *
 * When depth exceeds FLYOUT_DEPTH_THRESHOLD, children render in
 * a flyout Popover panel to the right instead of inline, preventing
 * deep nesting from eating all the sidebar width.
 */
const CollapseMenuRecursive: React.FC<{
  isOpen: boolean;
  node: NavigationTreeNode;
  onItemClick?: () => void;
  resetKey?: string;
  depth: number;
}> = ({ isOpen, node, onItemClick, resetKey, depth }) => {
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

  // When the children of this node would exceed the flyout threshold,
  // OR sidebar is collapsed, switch to flyout rendering. This ensures
  // ALL children at depth 3+ (both leaves and parents) render inside
  // the flyout panel, keeping siblings visually consistent.
  // Collapsed sidebar always uses flyout (VS Code style).
  const useFlyout = (depth + 1) >= FLYOUT_DEPTH_THRESHOLD || !isOpen;

  if (useFlyout) {
    return (
      <li>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              className="mb-1 h-9 w-full justify-start"
              variant={active || childActive ? "secondary" : "ghost"}
            >
              <div className="flex w-full items-center justify-between gap-2">
                <div className="flex min-w-0 flex-1 items-center">
                  {IconComponent && (
                    <span className="mr-2 shrink-0">
                      <IconComponent size={18} />
                    </span>
                  )}
                  <span className={cn("truncate", { hidden: !isOpen })}>
                    {node.label}
                  </span>
                </div>
                <ChevronRight
                  className={cn("shrink-0", { hidden: !isOpen })}
                  size={16}
                />
              </div>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            className="w-80 p-2"
            side="right"
            sideOffset={4}
          >
            <ul className="flex flex-col space-y-0.5">
              {node.children!.map((child) => (
                <FlyoutNavItem
                  key={child.id}
                  depth={depth + 1}
                  isOpen={isOpen}
                  item={child}
                  onItemClick={onItemClick}
                />
              ))}
            </ul>
          </PopoverContent>
        </Popover>
      </li>
    );
  }

  return (
    <Collapsible
      className="w-full"
      onOpenChange={setIsSectionOpen}
      open={isSectionOpen}
    >
      <NavTooltip isCollapsed={!isOpen} label={node.label} description={node.description}>
        <CollapsibleTrigger
          asChild
          className="mb-1 [&[data-state=open]>div>div>svg]:rotate-180"
        >
          <Button
            className="h-9 w-full justify-start"
            variant={active || childActive ? "secondary" : "ghost"}
          >
            <div className="flex w-full items-center justify-between gap-2">
              <div className="flex min-w-0 flex-1 items-center">
                {IconComponent && (
                  <span className="mr-2 shrink-0">
                    <IconComponent size={18} />
                  </span>
                )}
                {headerHref && node.linkable !== false ? (
                  <Link
                    aria-label={node.label}
                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
                    onKeyDown={(e: React.KeyboardEvent) => {
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
                    <span
                      className={cn(
                        "truncate",
                        {
                          "-translate-x-96 opacity-0": !isOpen,
                          "translate-x-0 opacity-100": isOpen,
                        },
                      )}
                    >
                      {node.label}
                    </span>
                  </Link>
                ) : (
                  <span
                    aria-disabled="true"
                    className={cn(
                      "truncate",
                      {
                        "-translate-x-96 opacity-0": !isOpen,
                        "translate-x-0 opacity-100": isOpen,
                      },
                    )}
                  >
                    {node.label}
                  </span>
                )}
              </div>
              <ChevronDown
                className={cn(
                  "shrink-0 transition-transform duration-200",
                  isOpen
                    ? "translate-x-0 opacity-100"
                    : "-translate-x-96 opacity-0",
                )}
                size={18}
              />
            </div>
          </Button>
        </CollapsibleTrigger>
      </NavTooltip>
      <CollapsibleContent className="data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down overflow-hidden">
        <NavigationTreeRenderer
          depth={depth + 1}
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
  depth: number;
}> = ({ isOpen, node, onItemClick, resetKey, depth }) => {
  const location = useLocation();
  const pathname = location.pathname;
  const active = isRouteActive(node, pathname);
  const hasChildren = node.children && node.children.length > 0;

  // When depth exceeds threshold OR sidebar is collapsed, ALL items
  // at this level use flyout rendering — both parents (with Popover)
  // and leaves (without). This keeps siblings visually consistent:
  // no mixing of inline links and flyout triggers at the same depth.
  const useFlyout = depth >= FLYOUT_DEPTH_THRESHOLD || !isOpen;

  if (useFlyout && !hasChildren) {
    return (
      <li>
        <NavTooltip isCollapsed={!isOpen} label={node.label} description={node.description}>
          <div>
            <FlyoutNavItem
              depth={depth}
              isOpen={isOpen}
              item={node}
              onItemClick={onItemClick}
              isCollapsed={!isOpen}
            />
          </div>
        </NavTooltip>
      </li>
    );
  }

  if (hasChildren) {
    return (
      <li>
        <CollapseMenuRecursive
          depth={depth}
          isOpen={isOpen}
          node={node}
          onItemClick={onItemClick}
          resetKey={resetKey}
        />
      </li>
    );
  }

  return (
    <LeafNavItem
      active={active}
      item={node}
      isOpen={isOpen}
      key={node.id}
      onItemClick={onItemClick}
    />
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
  /**
   * Whether to indent the list. Set false for the top-level call from
   * MainNavigation; the recursive call from CollapseMenuRecursive defaults
   * to true so each nesting level visually indents.
   */
  indent?: boolean;
  /** Current nesting depth (0 = root). */
  depth?: number;
}

/**
 * Recursively renders a navigation tree to arbitrary depth.
 *
 * Indentation uses a simple left border + fixed padding per level,
 * following the shadcn SidebarMenuSub pattern. Total indent is clamped
 * to 40px so deep nesting doesn't eat label space. Labels truncate
 * with ellipsis; Radix Tooltips show full text when sidebar is collapsed.
 *
 * Beyond depth 3, children render in cascading flyout Popover panels
 * to the right of the sidebar, each panel with full label width.
 */
export const NavigationTreeRenderer: React.FC<NavigationTreeRendererProps> = ({
  tree,
  isOpen = true,
  onItemClick,
  resetKey,
  indent = true,
  depth = 0,
}) => {
  const indentPx = indent ? getTotalIndent(depth) : 0;

  return (
    <ul
      className={cn(
        "flex flex-col space-y-0.5",
        indent && "border-l border-border/40 ml-1",
      )}
      style={indent ? { paddingLeft: `${indentPx}px` } : undefined}
    >
      {tree.map((node) => (
        <NavigationTreeItem
          depth={depth}
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
