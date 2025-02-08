import {
  createNamespacedId,
  Framework,
  type Plugin,
} from "@lumeweb/portal-framework-core";

export default function (): Plugin {
  return {
    async destroy(_framework: Framework) {
      console.log("Plugin Dashboard destroyed");
    },
    id: createNamespacedId("core", "dashboard"),
    async initialize(_framework: Framework) {
      console.log("Plugin Dashboard initialized");
    },
  } satisfies Plugin;
}
