import {
  createNamespacedId,
  Framework,
  type Plugin,
} from "@lumeweb/portal-framework-core";
import {
  RefineConfigCapability,
  SdkCapability,
} from "@lumeweb/portal-framework-auth";
import routes from "./routes";

export default function (): Plugin {
  return {
    capabilities: [new RefineConfigCapability(), new SdkCapability()],
    id: createNamespacedId("core", "dashboard"),
    routes,
    async destroy(_framework: Framework) {
      console.log("Plugin Dashboard destroyed");
    },
    async initialize(_framework: Framework) {
      console.log("Plugin Dashboard initialized");
    },
  } satisfies Plugin;
}
