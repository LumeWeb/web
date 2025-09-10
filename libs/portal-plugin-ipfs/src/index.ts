import {
  createNamespacedId,
  Framework,
  type Plugin,
} from "@lumeweb/portal-framework-core";

import { IpfsProtocol } from "./capabilities/ipfsProtocol";
import { IpfsUpload } from "./capabilities/ipfsUpload";
import routes from "./routes";

export default function (): Plugin {
  return {
    capabilities: [new IpfsProtocol(), new IpfsUpload()],
    capabilityAssociations: [
      {
        associated: ["ipfs:upload"],
        primary: "ipfs:protocol",
      },
    ],
    async destroy(_framework: Framework) {
      console.log("Plugin IPFS destroyed");
    },
    id: createNamespacedId("core", "ipfs"),
    async initialize(_framework: Framework) {
      console.log("Plugin IPFS initialized");
    },
    routes,
  } satisfies Plugin;
}
