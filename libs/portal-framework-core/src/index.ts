export { Builder } from "./api/builder";
export { Framework } from "./api/framework";
export { ErrorDisplay } from "./components/ErrorDisplay";
export { RouteErrorBoundary } from "./components/RouteErrorBoundary";
export { RouteErrorBoundaryFallback } from "./components/RouteErrorBoundaryFallback";
export { RouteLoading } from "./components/RouteLoading";
export { WidgetArea } from "./components/WidgetArea";
// Contexts
export {
  FrameworkProvider,
  type InitializationError,
  useFramework,
  useFrameworkLoading,
} from "./contexts/framework";
export { env } from "./env";
// API
export {
  HostContextBridge,
  registerBridgedContext,
  RemoteContextConsumer,
} from "./plugins/context-bridge";
// Plugins
export { PluginManager } from "./plugins/manager";

export {
  createBridgeComponent,
  createRemoteComponentLoader,
  defaultRemoteOptions,
  type RemoteComponentOptions,
} from "./plugins/remoteComponentLoader";
// Test Utilities (exported for use in other packages like storybook)
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
export * from "./util/domain";
export { getApiBaseUrl } from "./util/getApiBaseUrl";

export * from "./util/location";
export * from "./util/namespace";
// Utils
export { getPortalPluginManifests } from "./util/pluginManifest";
export * from "./util/portalMeta";
export * from "./util/refineConfig";
