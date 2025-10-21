export * from "./ui";
export * from "./hooks";
export * from "./types";

import {
  createNamespacedId,
  Framework,
  type Plugin,
} from "@lumeweb/portal-framework-core";
import { Capability as RefineConfigCapability } from "./capabilities";
import routes from "./routes";

export default function (): Plugin {
  return {
    dependencies: [{ id: "core:dashboard" }],
    capabilities: [new RefineConfigCapability()],
    async destroy(_framework: Framework) {
      console.log("Plugin Billing destroyed");
    },
    id: createNamespacedId("core", "billing"),
    async initialize(_framework: Framework) {
      console.log("Plugin Billing initialized");
    },
    routes,
  } satisfies Plugin;
}
