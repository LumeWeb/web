import type { BaseCapability } from "@lumeweb/portal-framework-core";

export interface ProtocolCapability extends BaseCapability<"core:protocol"> {
  /**
   * Get the protocol description for display in UI
   */
  getDescription(): string;

  /**
   * Get the icon component for display in UI
   */
  getIcon(): React.ComponentType<{ className?: string }>;

  /**
   * Get the protocol name for display in UI
   */
  getName(): string;
}
