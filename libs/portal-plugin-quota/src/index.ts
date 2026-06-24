import {
  CORE_NS,
  createNamespacedId,
  Framework,
  type Plugin,
} from "@lumeweb/portal-framework-core";

import { Capability as RefineConfigCapability } from "./capabilities/refineConfig";
import routes from "./routes";
import widgets from "./widgetRegistrations";

export default function (): Plugin {
  return {
    capabilities: [new RefineConfigCapability()],
    dependencies: [{ id: createNamespacedId(CORE_NS, "dashboard") }],
    async destroy(_framework: Framework) {
    },
    id: createNamespacedId(CORE_NS, "quota"),
    async initialize(_framework: Framework) {
    },
    routes,
    widgets,
  } satisfies Plugin;
}