import {
  createNamespacedId,
  Framework,
  type Plugin,
} from "@lumeweb/portal-framework-core";

import { LbryProtocol } from "./capabilities/lbryProtocol";
import { LbryUpload } from "./capabilities/lbryUpload";
import { RefineConfig as LbryRefineConfig } from "./capabilities/refineConfig";

export default function (): Plugin {
  return {
    capabilities: [
      new LbryProtocol(),
      new LbryUpload(),
      new LbryRefineConfig(),
    ],
    capabilityAssociations: [
      {
        associated: ["lbry:upload"],
        primary: "lbry:protocol",
      },
    ],
    async destroy(_framework: Framework) {
      console.log("Plugin LBRY destroyed");
    },
    id: createNamespacedId("core", "lbry"),
    async initialize(_framework: Framework) {
      console.log("Plugin LBRY initialized");
    },
  } satisfies Plugin;
}

export * from "./client/default";
export * from "./client/lBRYStreamAPI.schemas";
export * from "./client/tus";
