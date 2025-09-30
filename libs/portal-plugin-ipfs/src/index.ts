import {
  createNamespacedId,
  Framework,
  type Plugin,
} from "@lumeweb/portal-framework-core";

import { IpfsProtocol } from "./capabilities/ipfsProtocol";
import { IpfsUpload } from "./capabilities/ipfsUpload";
import { Capability as IpfsRefineConfig } from "./capabilities/refineConfig";
import routes from "./routes";
import { FileManagerFeature } from "@/features/fileManager/Feature";

export default function (): Plugin {
  return {
    capabilities: [
      new IpfsProtocol(),
      new IpfsUpload(),
      new IpfsRefineConfig(),
    ],
    capabilityAssociations: [
      {
        associated: ["ipfs:upload"],
        primary: "ipfs:protocol",
      },
    ],
    features: [new FileManagerFeature()],
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
export * from "./client/generated/ipfs";
export * from "./client/generated/iPFSPinningServiceAPI.schemas";
export * from "./client/generated/file-manager";
export * from "./client/generated/pins";
export * from "./client/generated/tus";
