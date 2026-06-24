import type { ProtocolCapability } from "@lumeweb/portal-plugin-dashboard";
import { createNamespacedId } from "@lumeweb/portal-framework-core";

import * as React from "react";

import IpfsIcon from "@/ui/Icon";

export class IpfsProtocol implements ProtocolCapability {
  readonly id = createNamespacedId("ipfs", "protocol");
  status: "active" | "error" | "inactive" = "active";
  readonly type = "framework:protocol" as const;

  async destroy() {}

  getDescription(): string {
    return "InterPlanetary File System - a peer-to-peer hypermedia protocol designed to make the web faster, safer, and more open.";
  }

  getIcon(): React.ComponentType<{ className?: string }> {
    return IpfsIcon;
  }

  getName(): string {
    return "IPFS";
  }

  async initialize() {}
}
