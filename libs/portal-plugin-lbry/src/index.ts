import {
  CORE_NS,
  createNamespacedId,
  Framework,
  type Plugin,
} from "@lumeweb/portal-framework-core";

import { LbryProtocol } from "./capabilities/lbryProtocol";
import { LbryUpload } from "./capabilities/lbryUpload";
import { RefineConfig as LbryRefineConfig } from "./capabilities/refineConfig";
import routes from "./routes";

export default function (): Plugin {
  return {
    capabilities: [
      new LbryProtocol(),
      new LbryUpload(),
      new LbryRefineConfig(),
    ],
    capabilityAssociations: [
      {
        associated: [createNamespacedId("lbry", "upload")],
        primary: createNamespacedId("lbry", "protocol"),
      },
    ],
    async destroy(_framework: Framework) {
      console.log("Plugin LBRY destroyed");
    },
    id: createNamespacedId(CORE_NS, "lbry"),
    async initialize(_framework: Framework) {
      console.log("Plugin LBRY initialized");
    },
    routes,
  } satisfies Plugin;
}

export * from "./types";
export * from "./client/default";
export * from "./client/lBRYStreamAPI.schemas";
export * from "./client/tus";
