import type { ProtocolCapability } from "@lumeweb/portal-plugin-dashboard";

import * as React from "react";

import LbryIcon from "@/ui/components/LbryIcon";
import { type CapabilityStatus } from "@lumeweb/portal-framework-core";

export class LbryProtocol implements ProtocolCapability {
  readonly id = "lbry:protocol";
  readonly type = "core:protocol" as const;
  readonly status: CapabilityStatus;

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
