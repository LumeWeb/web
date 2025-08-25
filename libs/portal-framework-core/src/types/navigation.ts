import type React from "react";

import { RouteObject } from "react-router";

import { NamespacedId } from "./plugin";

export interface NavigationBadge {
  content: string;
  variant?: "default" | "destructive" | "outline" | "secondary";
}

export interface NavigationItem {
  /**
   * Badge to display alongside the navigation item
   */
  badge?: NavigationBadge;
  /**
   * Child navigation items for nested menus
   */
  children?: NavigationItem[];
  /**
   * Whether the item is disabled (non-clickable)
   */
  disabled?: boolean;
  /**
   * If true, will force this item to appear in navigation even if it's an index route
   */
  forceShowInNavigation?: boolean;
  /**
   * Whether the item is hidden from navigation
   */
  hidden?: boolean;
  /**
   * Icon component to display before the label
   */
  icon?: React.FC<NavigationItemIconProps>;
  /**
   * Unique identifier for the navigation item
   */
  id?: string;
  /**
   * If true, this route is an index route
   */
  index?: boolean;
  /**
   * Display label for the navigation item
   */
  label: string;
  /**
   * If false, will render the item without a link (default: true)
   */
  linkable?: boolean;
  /**
   * Sort order relative to sibling items (lower numbers come first)
   */
  order?: number;
  /**
   * ID of parent navigation item for hierarchical structures
   */
  parentId?: NamespacedId;
  /**
   * Route path this item links to
   */
  path?: string;
  /**
   * Function to dynamically determine if item should be shown
   */
  show?: () => boolean;
}

export interface NavigationItemIconProps {
  className?: string;
  size?: number | string;
}

export interface RouteDefinition extends Omit<RouteObject, "children"> {
  caseSensitive?: boolean;
  children?: RouteDefinition[];
  /**
   * Name of the component export from the plugin's root.
   * This should match an exported component name from your plugin.
   * @example "HomePage"
   */
  component: string;
  /**
   * Optional unique identifier for the route.
   * If not provided, path will be used to generate an ID.
   * Will be namespaced with plugin ID if not already namespaced.
   */
  id?: string;
  index?: boolean;
  /**
   * If true, the component will be loaded lazily.
   * This is handled during route resolution.
   */
  lazyLoad?: boolean;
  navigation?: NavigationItem;
  /**
   * Namespaced ID of parent route. When set, this route will be nested under the parent.
   */
  parentId?: NamespacedId;
  pluginId?: NamespacedId;
  shouldRevalidate?: (args: { currentUrl: URL; nextUrl: URL }) => boolean;
}
