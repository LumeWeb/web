// API
export { Builder } from "./api/builder";
export { Framework } from "./api/framework";

// Components
export { ErrorDisplay } from "./components/ErrorDisplay";
export { FlexWidgetArea } from "./components/FlexWidgetArea";
export { GridWidgetArea } from "./components/GridWidgetArea";
export { RouteErrorBoundary } from "./components/RouteErrorBoundary";
export { RouteErrorBoundaryFallback } from "./components/RouteErrorBoundaryFallback";
export { RouteLoading } from "./components/RouteLoading";

// Contexts
export {
  FrameworkProvider,
  type InitializationError,
  useFramework,
  useFrameworkLoading,
} from "./contexts/framework";

// Environment
export { env } from "./env";

// Plugin Context Bridge
export {
  HostContextBridge,
  registerBridgedContext,
  RemoteContextConsumer,
} from "./plugins/context-bridge";

// Plugin Management
export { PluginManager } from "./plugins/manager";
export {
  createBridgeComponent,
  createRemoteComponentLoader,
  defaultRemoteOptions,
  type RemoteComponentOptions,
} from "./plugins/remoteComponentLoader";

// Testing Utilities
export { MockFrameworkProvider } from "./testing/MockFrameworkProvider";

// Types
export type { FeatureStatus, FrameworkFeature } from "./types/api";
export type {
  BaseCapability,
  CapabilityStatus,
  RefineConfigCapability,
  SdkCapability,
} from "./types/capabilities";
export type { NavigationFeature } from "./types/features";
export type {
  NavigationItem,
  NavigationItemIconProps,
  RouteDefinition,
} from "./types/navigation";
export type {
  NamespacedId,
  Plugin,
  PluginInitStatus,
  PluginLoadStatus,
  PluginModule,
  PluginState,
} from "./types/plugin";
export * from "./types/portal";
export type {
  WidgetAreaDefinition,
  WidgetDefinition,
  WidgetRegistration,
} from "./types/widget";

// Utilities
export * from "./util/domain";
export { getApiBaseUrl } from "./util/getApiBaseUrl";
export * from "./util/getSdk";
export * from "./util/location";
export * from "./util/namespace";
export { getPortalPluginManifests } from "./util/pluginManifest";
export * from "./util/portalMeta";
export * from "./util/refineConfig";
export * from "./util/validation";
