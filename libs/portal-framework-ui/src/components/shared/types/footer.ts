import type { BaseRecord } from "@refinedev/core";

import { ActionItemConfig } from "../../../actions";
import {
  AnyContainerEnvironment,
  DialogContainerEnvironment,
  StandaloneContainerEnvironment,
} from "./container";
import {
  AnyFormEnvironment,
  SimpleFormEnvironment,
  StepFormEnvironment,
  WizardFormEnvironment,
} from "./form";
import { StepEnvironment } from "./step";

/**
 * Interface representing the base props for a footer component
 * @template T - The type of record being used
 */
export interface BaseFooterProps<T extends BaseRecord = any> {
  /**
   * Optional array of action button configurations
   */
  actionButtons?: ActionItemConfig[];
  /**
   * Optional CSS class name
   */
  className?: string;
  /**
   * The environment configuration for the footer
   */
  environment: FooterEnvironment<T>;
  /**
   * Whether the form is currently submitting
   */
  isSubmitting?: boolean;
  /**
   * Function to close the container
   */
  onClose?: () => void;
  /**
   * Function to confirm the form submission
   */
  onConfirm?: () => void;
  /**
   * Label for the submit button, either a string or a function that returns a string
   */
  submitLabel?: ((values: Partial<T>) => string) | string;
}

// createFooterEnvironment function is now in environment/builders.ts

/**
 * Interface representing the environment for a footer component
 * @template T - The type of record being used
 */
export interface FooterEnvironment<T extends BaseRecord = any> {
  /**
   * The container environment
   */
  container: AnyContainerEnvironment;
  /**
   * The form environment
   */
  form: AnyFormEnvironment;
  /**
   * Optional step environment
   */
  step?: StepEnvironment;
}

/**
 * Type guard to check if a footer environment has a step environment
 * @param ctx - The footer environment to check
 * @returns True if the footer environment has a step environment, false otherwise
 */
export function hasStepEnvironment(
  ctx: FooterEnvironment,
): ctx is FooterEnvironment & { step: StepEnvironment } {
  return ctx.step !== undefined;
}

/**
 * Type guard to check if a footer environment is a dialog footer environment
 * @template T - The type of record being used
 * @param ctx - The footer environment to check
 * @returns True if the footer environment is a dialog footer environment, false otherwise
 */
export function isDialogFooterEnvironment<T extends BaseRecord = any>(
  ctx: FooterEnvironment<T>,
): ctx is FooterEnvironment<T> & { container: DialogContainerEnvironment } {
  return ctx.container.type === "dialog";
}

/**
 * Type guard to check if a footer environment is a simple footer environment
 * @template T - The type of record being used
 * @param ctx - The footer environment to check
 * @returns True if the footer environment is a simple footer environment, false otherwise
 */
export function isSimpleFooterEnvironment<T extends BaseRecord = any>(
  ctx: FooterEnvironment<T>,
): ctx is FooterEnvironment<T> & { form: SimpleFormEnvironment } {
  return ctx.form.type === "simple";
}

/**
 * Type guard to check if a footer environment is a standalone footer environment
 * @template T - The type of record being used
 * @param ctx - The footer environment to check
 * @returns True if the footer environment is a standalone footer environment, false otherwise
 */
export function isStandaloneFooterEnvironment<T extends BaseRecord = any>(
  ctx: FooterEnvironment<T>,
): ctx is FooterEnvironment<T> & { container: StandaloneContainerEnvironment } {
  return ctx.container.type === "standalone";
}

/**
 * Type guard to check if a footer environment is a step footer environment
 * @template T - The type of record being used
 * @param ctx - The footer environment to check
 * @returns True if the footer environment is a step footer environment, false otherwise
 */
export function isStepFooterEnvironment<T extends BaseRecord = any>(
  ctx: FooterEnvironment<T>,
): ctx is FooterEnvironment<T> & { form: StepFormEnvironment } {
  return ctx.form.type === "step";
}

/**
 * Type guard to check if a footer environment is a wizard footer environment
 * @template T - The type of record being used
 * @param ctx - The footer environment to check
 * @returns True if the footer environment is a wizard footer environment, false otherwise
 */
export function isWizardFooterEnvironment<T extends BaseRecord = any>(
  ctx: FooterEnvironment<T>,
): ctx is FooterEnvironment<T> & { form: WizardFormEnvironment } {
  return ctx.form.type === "wizard";
}
