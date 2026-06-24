import type React from "react";

import { FrameworkFeature } from "../types/api";
import { Namespace, NamespacedId } from "../types/namespace";
import { BaseCapability } from "./capabilities";
import { RouteDefinition } from "./navigation";
import type { QueryParamPersistConfig } from "../util/queryParamPersist";
import { PluginWidgets } from "./widget";

export interface FeatureState {
  error?: Error;
  state: FeatureStateStatus;
}

export type FeatureStateStatus = "failed" | "loaded" | "loading";

export type { Namespace, NamespacedId };

export interface Plugin {
  // Capabilities also map to exposed modules
  capabilities?: BaseCapability[];
  capabilityAssociations?: CapabilityAssociation[];
  dependencies?: PluginDependency[];
  destroy(framework: Framework): Promise<void>;
  exports?: PluginExports;
  features?: FrameworkFeature[];
  id: NamespacedId;
  initialize(framework: Framework): Promise<void>;
  /** Additional namespaces this plugin claims (beyond the one in its ID) */
  namespaces?: Namespace[];
  queryParamConfig?: QueryParamPersistConfig[];
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

export interface CapabilityAssociation {
  /**
   * The primary capability that others are associated with
   */
  primary: NamespacedId;
  /**
   * The associated capabilities
   */
  associated: NamespacedId[];
}
