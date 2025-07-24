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
export type { FrameworkFeature, FeatureStatus } from "./types/api";
export type {
  BaseCapability,
  RefineConfigCapability,
  SdkCapability,
  CapabilityStatus,
} from "./types/capabilities";

export type { NavigationFeature } from "./types/features";
export type {
  NavigationItem,
  RouteDefinition,
  NavigationItemIconProps,
} from "./types/navigation";
export type {
  NamespacedId,
  Plugin,
  PluginModule,
  PluginState,
  PluginInitStatus,
  PluginLoadStatus,
  WidgetRegistration,
} from "./types/plugin";
export * from "./types/portal";
export { getApiBaseUrl } from "./util/getApiBaseUrl";
// Utils
export { getPortalPluginManifests } from "./util/pluginManifest";

export * from "./util/location";
export * from "./util/namespace";
export * from "./util/domain";
export * from "./util/portalMeta";
