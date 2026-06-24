import {
  FRAMEWORK_NS,
  createNamespacedId,
  type BaseCapability,
} from "@lumeweb/portal-framework-core";

export const PROTOCOL_CAPABILITY_TYPE = createNamespacedId(
  FRAMEWORK_NS,
  "protocol",
);

export interface ProtocolCapability
  extends BaseCapability {
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
