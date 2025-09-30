import type { ProtocolCapability } from "@lumeweb/portal-plugin-dashboard";

import * as React from "react";

import IpfsIcon from "@/ui/Icon";

export class IpfsProtocol implements ProtocolCapability {
  readonly id = "ipfs:protocol";
  readonly type = "core:protocol" as const;

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
