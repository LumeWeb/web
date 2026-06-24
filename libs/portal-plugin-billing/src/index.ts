export * from "./ui";
export * from "./hooks";
export * from "./types";
export * from "./utils";

import {
  CORE_NS,
  createNamespacedId,
  Framework,
  type Plugin,
} from "@lumeweb/portal-framework-core";
import { Capability as RefineConfigCapability } from "./capabilities";
import routes from "./routes";

export default function (): Plugin {
  return {
    dependencies: [{ id: createNamespacedId(CORE_NS, "dashboard") }],
    capabilities: [new RefineConfigCapability()],
    async destroy(_framework: Framework) {
      console.log("Plugin Billing destroyed");
    },
    id: createNamespacedId(CORE_NS, "billing"),
    async initialize(_framework: Framework) {
      console.log("Plugin Billing initialized");
    },
    routes,
  } satisfies Plugin;
}
