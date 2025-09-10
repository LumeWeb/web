/**
 * Type for the force rerender method that can be called to trigger a component rerender
 */
export type ForceRerenderMethod = () => void;

/**
 * Callback function type for receiving the force rerender method
 * This is a "reverse callback" where the framework calls this callback with a method
 * that can be stored locally and used to force a rerender when something outside 
 * the render loop needs it
 */
export type ForceRerenderCallback = (forceRerender: ForceRerenderMethod) => void;

/**
 * Callback function type for receiving environment updates
 * This is a callback that can be called directly with the environment
 * when it needs to be synced
 */
export type EnvironmentSyncCallback = (environment: UnifiedEnvironment) => void;

/**
 * Enum representing the different types of forms
 */
export enum FormType {
  /**
   * Simple form type
   */
  SIMPLE = "simple",
  /**
   * Step form type
   */
  STEP = "step",
  /**
   * Wizard form type
   */
  WIZARD = "wizard",
}

/**
 * Union type representing any form environment
 */
export type AnyFormEnvironment =
  | SimpleFormEnvironment
  | StepFormEnvironment
  | WizardFormEnvironment;



/**
 * Base interface for form environment
 */
export interface FormEnvironment {
  /**
   * The type of form
   */
  type: FormType;
}

/**
 * Interface representing a simple form environment
 */
export interface SimpleFormEnvironment extends FormEnvironment {
  /**
   * Whether the form is currently submitting
   */
  isSubmitting?: boolean;
  /**
   * React Hook Form methods
   */
  methods: any;
  /**
   * The type of form (simple)
   */
  type: FormType.SIMPLE;
}

/**
 * Interface representing a step form environment
 */
export interface StepFormEnvironment extends FormEnvironment {
  /**
   * Whether the form is currently submitting
   */
  isSubmitting?: boolean;
  /**
   * React Hook Form methods
   */
  methods: any;
  /**
   * The type of form (step)
   */
  type: FormType.STEP;
}

/**
 * Interface representing a wizard form environment
 */
export interface WizardFormEnvironment extends FormEnvironment {
  /**
   * Whether the form is currently submitting
   */
  isSubmitting: boolean;
  /**
   * React Hook Form methods
   */
  methods: any;
  /**
   * The type of form (wizard)
   */
  type: FormType.WIZARD;
}

/**
 * Type guard to check if a form environment is a simple form
 * @param ctx - The form environment to check
 * @returns True if the form environment is a simple form, false otherwise
 */
export function isSimpleForm(
  ctx: AnyFormEnvironment,
): ctx is SimpleFormEnvironment {
  return ctx.type === FormType.SIMPLE;
}

/**
 * Type guard to check if a form environment is a step form
 * @param ctx - The form environment to check
 * @returns True if the form environment is a step form, false otherwise
 */
export function isStepForm(
  ctx: AnyFormEnvironment,
): ctx is StepFormEnvironment {
  return ctx.type === FormType.STEP;
}

/**
 * Type guard to check if a form environment is a wizard form
 * @param ctx - The form environment to check
 * @returns True if the form environment is a wizard form, false otherwise
 */
export function isWizardForm(
  ctx: AnyFormEnvironment,
): ctx is WizardFormEnvironment {
  return ctx.type === FormType.WIZARD;
}
