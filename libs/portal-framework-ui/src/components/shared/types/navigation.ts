import type { BaseRecord } from "@refinedev/core";

/**
 * Type for controlling step navigation in wizards
 * Can be a boolean value or a function that returns a boolean
 */
export type AllowStepNavigation = boolean | (() => boolean);
