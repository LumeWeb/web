import {
  CORE_NS,
  createNamespacedId,
  Framework,
  type Plugin,
} from "@lumeweb/portal-framework-core";

import { Capability as RefineNotifyConfigCapability } from "./capabilities/refineConfig";
import { createNavigationFeature } from "./features/navigation";
import widgets from "./widgetRegistrations";

export default function (): Plugin {
  return {
    capabilities: [new RefineNotifyConfigCapability()],
    async destroy(_framework: Framework) {
      console.log("Plugin Core destroyed");
    },
    features: [createNavigationFeature()],
    id: createNamespacedId(CORE_NS, "core"),
    async initialize(_framework: Framework) {
      console.log("Plugin Core initialized");
    },
    widgets,
  } satisfies Plugin;
}
