import {
  createNamespacedId,
  CORE_NS,
  Framework,
  FrameworkFeature,
  FRAMEWORK_NS,
  NamespacedId,
} from "@lumeweb/portal-framework-core";

// Re-export the factories so consumers can construct branded IDs through plugin-core.
export { createNamespace, createNamespacedId, CORE_NS, FRAMEWORK_NS } from "@lumeweb/portal-framework-core";

export class NamespaceFeature implements FrameworkFeature {
  id: NamespacedId = createNamespacedId(FRAMEWORK_NS, "namespace");
  status = "enabled" as const;
  version = "0.1.0";

  async destroy(): Promise<void> {
    // No cleanup required.
  }

  async initialize(_framework: Framework): Promise<void> {
    // No initialization required.
  }
}

export function createNamespaceFeature(): FrameworkFeature {
  return new NamespaceFeature();
}
