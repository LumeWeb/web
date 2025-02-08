import {
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
        id: "core:core",
      },
    ],
    async destroy(_framework: Framework) {
      console.log("Plugin Abuse Report destroyed");
    },
    id: createNamespacedId("core", "abuse-report"),
    async initialize(_framework: Framework) {
      console.log("Plugin Abuse Report initialized");
    },
    routes,
  } satisfies Plugin;
}
