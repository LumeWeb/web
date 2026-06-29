import {
  createNamespacedId,
  Framework,
  type Plugin,
} from "@lumeweb/portal-framework-core";

import { RefineConfig as SiaRefineConfig } from "./capabilities/refineConfig";
import routes from "./routes";

export default function (): Plugin {
  return {
    capabilities: [new SiaRefineConfig()],
    async destroy(_framework: Framework) {
      console.log("Plugin Sia destroyed");
    },
    id: createNamespacedId("core", "sia"),
    async initialize(_framework: Framework) {
      console.log("Plugin Sia initialized");
    },
    routes,
  } satisfies Plugin;
}

export * from "./types";
