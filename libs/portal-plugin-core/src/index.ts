import {
  createNamespacedId,
  Framework,
  type Plugin,
} from "@lumeweb/portal-framework-core";

import { Capability as RefineNotifyConfigCapability } from "./capabilities/refineConfig";
import { createNavigationFeature } from "./features/navigation";

export default function (): Plugin {
  return {
    capabilities: [new RefineNotifyConfigCapability()],
    async destroy(_framework: Framework) {
      console.log("Plugin Core destroyed");
    },
    features: [createNavigationFeature()],
    id: createNamespacedId("core", "core"),
    async initialize(_framework: Framework) {
      console.log("Plugin Core initialized");
    },
  } satisfies Plugin;
}
