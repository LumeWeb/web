import type { ProtocolCapability } from "@lumeweb/portal-plugin-dashboard";

import * as React from "react";

import LbryIcon from "@/ui/components/LbryIcon";
import {
  type CapabilityStatus,
  FRAMEWORK_NS,
  createNamespacedId,
} from "@lumeweb/portal-framework-core";

export class LbryProtocol implements ProtocolCapability {
  readonly id = createNamespacedId("lbry", "protocol");
  readonly status: CapabilityStatus;
  readonly type = createNamespacedId(FRAMEWORK_NS, "protocol");

  async destroy() {}

  getDescription(): string {
    return "Decentralized content storage platform";
  }

  getIcon(): React.ComponentType<{ className?: string }> {
    return LbryIcon;
  }

  getName(): string {
    return "LBRY";
  }

  async initialize() {}
}
