import { ComponentType } from "react";

export interface RouteConfig {
  id?: string;
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
