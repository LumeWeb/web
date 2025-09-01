import type React from "react";

import { Framework } from "libs/portal-framework-core/src/api/framework";
import * as Module from "node:module";

import { FrameworkFeature } from "../types/api";
import { BaseCapability } from "./capabilities";
import { RouteDefinition } from "./navigation";
import { PluginWidgets } from "./widget";

export interface FeatureState {
  error?: Error;
  state: FeatureStateStatus;
}

export type FeatureStateStatus = "failed" | "loaded" | "loading";

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
  widgets?: PluginWidgets;
}

export interface PluginDependency {
  id: NamespacedId;
}
export type PluginExports = Record<string, React.ComponentType>;

export type PluginInitStatus =
  | "failed"
  | "initialized"
  | "initializing"
  | "pending";

export type PluginLoadStatus = "failed" | "loaded" | "loading";

export interface PluginModule extends Module {
  default: () => Plugin;
}

export interface PluginState {
  error?: Error;
  initState: PluginInitStatus;
  loadState: PluginLoadStatus;
  retryCount: number;
}
