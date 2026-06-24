import {
  CORE_NS,
  createNamespacedId,
  Framework,
  type Plugin,
} from "@lumeweb/portal-framework-core";

import { Capability as RefineConfigCapability } from "./capabilities/refineConfig";
import { Feature as TemplateFeature } from "./features/template";
import routes from "./routes";
import widgets from "./widgetRegistrations";

export default function (): Plugin {
  return {
    capabilities: [new RefineConfigCapability()],
    async destroy(_framework: Framework) {
      console.log("Plugin Template destroyed");
    },
    features: [new TemplateFeature()],
    id: createNamespacedId(CORE_NS, "template"),
    async initialize(_framework: Framework) {
      console.log("Plugin Template initialized");
    },
    routes,
    widgets,
  } satisfies Plugin;
}