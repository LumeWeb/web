import { BaseRecord } from "@refinedev/core";

import type { DialogConfig } from "../../dialog/Dialog.types";
import type { WizardStepDefinition } from "../../form/types";
import type {
  DialogContainerEnvironment,
  FooterEnvironment,
  SimpleFormEnvironment,
  StandaloneContainerEnvironment,
  StepEnvironment,
  StepFormEnvironment,
  WizardFormEnvironment,
} from "../types";
import type {
  AnyNavigationEnvironment,
  HeaderContent,
  HeaderEnvironment,
} from "../types/header";
import type { AllowStepNavigation } from "../types/navigation";
import type { ForceRerenderCallback, EnvironmentSyncCallback } from "../types/form";

import { ContainerType } from "../types/container";
import { FormType } from "../types/form";
import { NavigationType, ProgressStyleType } from "../types/header";

// Base Environment Builder Class
export class EnvironmentBuilder<T extends BaseRecord = any> {
  protected _container:
    | DialogContainerEnvironment
    | null
    | StandaloneContainerEnvironment = null;
  protected _form:
    | null
    | SimpleFormEnvironment
    | StepFormEnvironment
    | WizardFormEnvironment = null;
  protected _step: null | StepEnvironment = null;

  // Build method to be implemented by subclasses
  build(): any {
    throw new Error("Build method must be implemented by subclasses");
  }

  // Container methods
  dialog(options: {
    dialogConfig: DialogConfig<T>;
    onClose: () => void;
  }): this {
    this._container = {
      dialogConfig: options.dialogConfig,
      onClose: options.onClose,
      type: ContainerType.DIALOG,
    };
    return this;
  }

  // Form methods
  simpleForm(options: { 
    isSubmitting?: boolean; 
    methods: any;
    forceRerender?: ForceRerenderCallback;
    environmentSync?: EnvironmentSyncCallback;
  }): this {
    this._form = {
      isSubmitting: options.isSubmitting,
      methods: options.methods,
      forceRerender: options.forceRerender,
      environmentSync: options.environmentSync,
      type: FormType.SIMPLE,
    };
    return this;
  }

  standalone(): this {
    this._container = {
      type: ContainerType.STANDALONE,
    };
    return this;
  }

  // Step methods
  step(options: {
    current: number;
    isFirst: boolean;
    isLast: boolean;
    onNext?: () => Promise<void>;
    onPrevious?: () => Promise<void>;
    onRetry?: () => Promise<void>;
    jumpTo?: (step: number) => void;
    total: number;
    retryCount?: number;
  }): this {
    this._step = {
      current: options.current,
      isFirst: options.isFirst,
      isLast: options.isLast,
      onNext: options.onNext,
      onPrevious: options.onPrevious,
      onRetry: options.onRetry,
      jumpTo: options.jumpTo,
      total: options.total,
      retryCount: options.retryCount ?? 0,
    };
    return this;
  }

  stepForm(options: { 
    isSubmitting?: boolean; 
    methods: any;
    forceRerender?: ForceRerenderCallback;
    environmentSync?: EnvironmentSyncCallback;
  }): this {
    this._form = {
      isSubmitting: options.isSubmitting,
      methods: options.methods,
      forceRerender: options.forceRerender,
      environmentSync: options.environmentSync,
      type: FormType.STEP,
    };
    return this;
  }

  wizardForm(options: { 
    isSubmitting: boolean; 
    methods: any;
    forceRerender?: ForceRerenderCallback;
    environmentSync?: EnvironmentSyncCallback;
  }): this {
    this._form = {
      isSubmitting: options.isSubmitting,
      methods: options.methods,
      forceRerender: options.forceRerender,
      environmentSync: options.environmentSync,
      type: FormType.WIZARD,
    };
    return this;
  }

  // Validation
  protected validate(): void {
    if (!this._container) {
      throw new Error("Container environment is required");
    }
    if (!this._form) {
      throw new Error("Form environment is required");
    }
  }

  // Header-specific validation that doesn't require form environment
  protected validateHeader(): void {
    if (!this._container) {
      throw new Error("Container environment is required");
    }
    // Headers don't require form environment - they are independent
  }

  // Environment validation that doesn't require form environment
  protected validateContainerOnly(): void {
    if (!this._container) {
      throw new Error("Container environment is required");
    }
  }

  // Environment validation that doesn't require container environment
  protected validateFormOnly(): void {
    if (!this._form) {
      throw new Error("Form environment is required");
    }
  }
}

// Footer Environment Builder
export class FooterEnvironmentBuilder<
  T extends BaseRecord = any,
> extends EnvironmentBuilder<T> {
  build(): FooterEnvironment<T> {
    this.validate();

    return {
      container: this._container!,
      form: this._form!,
      step: this._step || undefined,
    };
  }

  buildContainerOnly(): Pick<FooterEnvironment<T>, "container"> {
    this.validateContainerOnly();

    return {
      container: this._container!,
    };
  }

  buildFormOnly(): Pick<FooterEnvironment<T>, "form"> {
    this.validateFormOnly();

    return {
      form: this._form!,
    };
  }
}

// Header Environment Builder
export class HeaderEnvironmentBuilder<
  T extends BaseRecord = any,
> extends EnvironmentBuilder<T> {
  protected _content: HeaderContent | null = null;
  protected _navigation: AnyNavigationEnvironment | null = null;

  build(): HeaderEnvironment<T> {
    this.validateHeader();

    if (!this._content) {
      throw new Error("Header content is required");
    }

    if (!this._navigation) {
      throw new Error("Header navigation is required");
    }

    return {
      container: this._container!,
      content: this._content,
      navigation: this._navigation,
    };
  }

  content(options: {
    actions?: any[];
    description?: string;
    title?: string;
  }): this {
    this._content = {
      actions: options.actions,
      description: options.description,
      title: options.title,
    };
    return this;
  }

  noneNavigation(): this {
    this._navigation = {
      type: NavigationType.NONE,
    };
    return this;
  }

  stepNavigation(options: { current?: number; total?: number }): this {
    this._navigation = {
      current: options.current,
      total: options.total,
      type: NavigationType.STEP,
    };
    return this;
  }

  wizardNavigation(options: {
    allowNavigation?: AllowStepNavigation;
    current: number;
    descriptionMaxWidth?: string;
    disabledSteps?: number[];
    iconSize?: string;
    onStepClick?: (stepIndex: number) => void;
    progressStyle?: ProgressStyleType;
    showStepDescriptions?: boolean;
    showStepTitles?: boolean;
    steps?: WizardStepDefinition[];
    total: number;
  }): this {
    this._navigation = {
      allowNavigation: options.allowNavigation ?? true,
      current: options.current,
      descriptionMaxWidth: options.descriptionMaxWidth ?? "xs",
      disabledSteps: options.disabledSteps,
      iconSize: options.iconSize ?? "sm",
      onStepClick: options.onStepClick,
      progressStyle: options.progressStyle ?? ProgressStyleType.TIMELINE,
      showStepDescriptions: options.showStepDescriptions ?? true,
      showStepTitles: options.showStepTitles ?? true,
      steps: options.steps,
      total: options.total,
      type: NavigationType.WIZARD,
    };
    return this;
  }
}

// Factory functions
export const Environment = {
  footer<T extends BaseRecord = any>(): FooterEnvironmentBuilder<T> {
    return new FooterEnvironmentBuilder<T>();
  },

  header<T extends BaseRecord = any>(): HeaderEnvironmentBuilder<T> {
    return new HeaderEnvironmentBuilder<T>();
  },
};
