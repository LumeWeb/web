import { ComponentType } from "react";

export interface RouteConfig {
  path: string;
  file: string;
  children?: RouteConfig[];
  index?: boolean;
}

export interface MenuItem {
  key: string;
  label: string;
  icon?: ComponentType;
  path?: string;
  children?: MenuItem[];
}
