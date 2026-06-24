import {
  createNamespace,
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
    dependencies: [
      {
        id: createNamespacedId(CORE_NS, "core"),
      },
    ],
    async destroy(_framework: Framework) {
      console.log("Plugin Abuse Report destroyed");
    },
    id: createNamespacedId(CORE_NS, "abuse-report"),
    async initialize(_framework: Framework) {
      console.log("Plugin Abuse Report initialized");
    },
    namespaces: [createNamespace("abuse-report")],
    routes,
  } satisfies Plugin;
}
