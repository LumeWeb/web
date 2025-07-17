import {
  createNamespacedId,
  Framework,
  type Plugin,
} from "@lumeweb/portal-framework-core";
import routes from "./routes";

export default function (): Plugin {
  return {
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
