import { FrameworkFeature } from "./api";
import { NavigationItem, RouteDefinition } from "./navigation";

export interface NavigationFeature extends FrameworkFeature {
  getNavigation(): NavigationItem[];
  getRoutes(): Promise<RouteDefinition[]>;
}
