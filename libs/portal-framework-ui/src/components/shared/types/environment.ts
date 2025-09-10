import { DialogContainerEnvironment } from "./container";
import { AnyFormEnvironment } from "./form";
import { StepEnvironment } from "./step";

/**
 * Interface representing a unified environment that combines container, form, and step environments
 */
export type UnifiedEnvironment = {
  /**
   * Optional container environment
   */
  container?: DialogContainerEnvironment;
  /**
   * Optional form environment
   */
  form?: AnyFormEnvironment;
  /**
   * Optional step environment
   */
  step?: StepEnvironment;
};
