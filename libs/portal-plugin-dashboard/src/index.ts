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
import widgetRegistrations from "./widgetRegistrations";
import { Capability as DashRefineConfigCapability } from "./capabilities/refineConfig";
import { registerInput } from "@/ui/forms/fields/AccountEmail";

export default function (): Plugin {
  return {
    widgetRegistrations,
    capabilities: [
      new RefineConfigCapability(),
      new SdkCapability(),
      new DashRefineConfigCapability(),
    ],
    id: createNamespacedId("core", "dashboard"),
    routes,
    async destroy(_framework: Framework) {
      console.log("Plugin Dashboard destroyed");
    },
    async initialize(_framework: Framework) {
      registerInput();
    },
  } satisfies Plugin;
}
