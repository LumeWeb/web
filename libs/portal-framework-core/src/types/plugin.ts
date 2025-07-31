import type React from "react";

import { Framework } from "libs/portal-framework-core/src/api/framework";
import * as Module from "node:module";

import { FrameworkFeature } from "../types/api";
import { BaseCapability } from "./capabilities";
import { RouteDefinition } from "./navigation";

export type FeatureStateStatus = "failed" | "loaded" | "loading";

export interface FeatureState {
  error?: Error;
  state: FeatureStateStatus;
}

// Type safety for namespaced IDs
export type NamespacedId = `${string}:${string}`;

export interface Plugin {
  // Capabilities also map to exposed modules
  capabilities?: BaseCapability[];
  dependencies?: PluginDependency[];
  destroy(framework: Framework): Promise<void>;
  exports?: PluginExports;
  features?: FrameworkFeature[];
  id: NamespacedId;
  initialize(framework: Framework): Promise<void>;
  // Routes map to exposed components
  routes?: RouteDefinition[];
  widgetRegistrations?: WidgetRegistration[];
}

export type PluginInitStatus =
  | "failed"
  | "initialized"
  | "initializing"
  | "pending";
export type PluginLoadStatus = "failed" | "loaded" | "loading";

export interface PluginDependency {
  id: NamespacedId;
}

export type PluginExports = Record<string, React.ComponentType>;

export interface PluginModule extends Module {
  default: () => Plugin;
}

export interface PluginState {
  error?: Error;
  initState: PluginInitStatus;
  loadState: PluginLoadStatus;
  retryCount: number;
}

export interface WidgetRegistration {
  area: string;
  componentName: string;
  /** Number of grid columns the widget should span (positive integer) */
  cols?: number;
  /** Number of grid rows the widget should span (positive integer) */
  rows?: number;
  /** Display order within the widget area (higher values appear later) */
  order?: number;
}

export interface WidgetRegistrationInfo extends WidgetRegistration {
  pluginId: NamespacedId;
}

export interface WidgetRegistrationEntity extends WidgetRegistration {
  component: React.FC;
}
