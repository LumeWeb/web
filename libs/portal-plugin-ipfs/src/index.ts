import {
  CORE_NS,
  createNamespacedId,
  Framework,
  type Plugin,
} from "@lumeweb/portal-framework-core";

import { IpfsProtocol } from "./capabilities/ipfsProtocol";
import { IpfsUpload } from "./capabilities/ipfsUpload";
import { Capability as IpfsRefineConfig } from "./capabilities/refineConfig";
import routes from "./routes";

export default function (): Plugin {
  return {
    capabilities: [
      new IpfsProtocol(),
      new IpfsUpload(),
      new IpfsRefineConfig(),
    ],
    capabilityAssociations: [
      {
        associated: [createNamespacedId("ipfs", "upload")],
        primary: createNamespacedId("ipfs", "protocol"),
      },
    ],
    async destroy(_framework: Framework) {
      console.log("Plugin IPFS destroyed");
    },
    features: [],
    id: createNamespacedId(CORE_NS, "ipfs"),
    async initialize(_framework: Framework) {
      console.log("Plugin IPFS initialized");
    },
    routes,
  } satisfies Plugin;
}
export type {
  Component,
  ErrorResponse,
  PinRequest,
  PinRequestMeta,
  PinResultsResponse,
  PinStatusResponse,
  PinStatusResponseInfo,
  PostUploadResponse,
  UploadResultResponse,
} from "@lumeweb/pinner";
