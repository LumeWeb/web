import { NamespacedId } from "libs/portal-framework-core/src/types/plugin";
import { RouteObject } from "react-router";
import type React from "react";

export interface NavigationBadge {
  content: string;
  variant?: "default" | "destructive" | "outline" | "secondary";
}

export interface NavigationItemIconProps {
  size?: number | string;
  className?: string;
}

export interface NavigationItem {
  badge?: NavigationBadge;
  children?: NavigationItem[];
  disabled?: boolean;
  hidden?: boolean;
  icon?: React.FC<NavigationItemIconProps>;
  id?: string;
  label: string;
  order?: number;
  path?: string;
  show?: () => boolean;
  parentId?: NamespacedId;
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
   * Namespaced ID of parent route. When set, this route will be nested under the parent.
   */
  parentId?: NamespacedId;
  /**
   * If true, the component will be loaded lazily.
   * This is handled during route resolution.
   */
  lazyLoad?: boolean;
  navigation?: NavigationItem;
  pluginId?: NamespacedId;
  shouldRevalidate?: (args: { currentUrl: URL; nextUrl: URL }) => boolean;
}
