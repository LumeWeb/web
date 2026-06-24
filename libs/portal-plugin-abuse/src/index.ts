import {
  CORE_NS,
  createNamespacedId,
  Framework,
  type Plugin,
} from "@lumeweb/portal-framework-core";

import { Capability as RefineConfigCapability } from "./capabilities/refineConfig";
import routes from "./routes";

export default function (): Plugin {
  return {
    capabilities: [new RefineConfigCapability()],
    async destroy(_framework: Framework) {
      console.log("Plugin Abuse destroyed");
    },
    id: createNamespacedId(CORE_NS, "abuse"),
    async initialize(_framework: Framework) {
      console.log("Plugin Abuse initialized");
    },
    routes,
  } satisfies Plugin;
}
