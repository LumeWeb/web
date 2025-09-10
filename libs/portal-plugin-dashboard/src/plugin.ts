import {
  RefineConfigCapability,
  SdkCapability,
} from "@lumeweb/portal-framework-auth";
import {
  createNamespacedId,
  Framework,
  type Plugin,
} from "@lumeweb/portal-framework-core";

import { Feature } from "@/features/upload";
import { registerInput } from "@/ui/forms/fields/AccountEmail";

import { Capability as DashRefineConfigCapability } from "./capabilities/refineConfig";
import routes from "./routes";
import dashboardWidgets from "./widgetRegistrations";

export default function (): Plugin {
  return {
    capabilities: [
      new RefineConfigCapability(),
      new SdkCapability(),
      new DashRefineConfigCapability(),
    ],
    async destroy(_framework: Framework) {
      console.log("Plugin Dashboard destroyed");
    },
    features: [new Feature()],
    id: createNamespacedId("core", "dashboard"),
    async initialize(_framework: Framework) {
      console.log("Plugin Dashboard initialized");
      registerInput();
    },
    routes,
    widgets: dashboardWidgets,
  } satisfies Plugin;
}
