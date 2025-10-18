import {
  createNamespacedId,
  Framework,
  FrameworkFeature,
} from "@lumeweb/portal-framework-core";

export class Feature implements FrameworkFeature {
  readonly id = createNamespacedId("template", "main");

  async initialize(framework: Framework): Promise<void> {
    // Initialize the template feature
    console.log("Template feature initialized");
  }

  async destroy(framework: Framework): Promise<void> {
    // Cleanup the template feature
    console.log("Template feature destroyed");
  }

  // Add feature-specific methods here
  getTemplateConfig() {
    return {
      // Feature configuration
    };
  }
}