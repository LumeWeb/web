import { Builder } from "../api/builder";
import { Framework } from "../api/framework";
import { NamespacedId } from "./plugin";

export interface CategoryError {
  category: ErrorCategory;
  error: Error;
  id: string;
}

export type ErrorCategory = "capability" | "feature" | "plugin" | "system";

export interface FeatureDependency {
  id: NamespacedId;
}
export type FeatureStatus = "disabled" | "enabled" | "error";

export interface FrameworkFeature {
  dependencies?: FeatureDependency[];
  destroy(framework: Framework): Promise<void>;
  id: NamespacedId;
  initialize(framework: Framework): Promise<void>;
  status: FeatureStatus;
}

export interface InitializationResult {
  builder: Builder;
  errors?: CategoryError[];
  framework: Framework;
  success: boolean;
}
