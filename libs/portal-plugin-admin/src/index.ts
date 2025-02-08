import {
  RefineConfigCapability,
  SdkCapability,
} from "@lumeweb/portal-framework-auth";
import {
  createNamespacedId,
  Framework,
  type Plugin,
} from "@lumeweb/portal-framework-core";

import routes from "./routes";

export default function (): Plugin {
  return {
    capabilities: [new RefineConfigCapability(), new SdkCapability()],
    async destroy(_framework: Framework) {
      console.log("Plugin Admin destroyed");
    },
    id: createNamespacedId("core", "admin"),
    async initialize(_framework: Framework) {
      console.log("Plugin Admin initialized");
    },
    routes,
  } satisfies Plugin;
}
