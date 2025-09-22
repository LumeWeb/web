import type { BaseRecord } from "@refinedev/core";

import { DialogFooter } from "@lumeweb/portal-framework-ui-core";
import React, { ReactNode } from "react";

import { DialogConfig, isDialogFooterFunction, isWizardFormConfig } from "../../dialog/Dialog.types";
import { useOptionalStepControlContext } from "../../form/StepControlContext";
import { isStepFormConfig } from "../../form/types";
import { Environment } from "../environment/builders";
import { UnifiedFooter } from "../UnifiedFooter";

export interface FooterRenderConfig<T extends BaseRecord = any> {
  /** CSS class name for the footer container */
  className?: string;
  /** Dialog configuration (required for dialog contexts) */
  dialogConfig?: DialogConfig<T>;
  /** Footer configuration - can be false, ReactNode, or function */
  footer?: ((environment: any) => ReactNode) | false | ReactNode;
  /** Form methods for form state */
  formMethods?: any;
  /** Whether this is rendered in a dialog context */
  isDialog?: boolean;
  /** Callback function to handle cancel/close actions */
  onCancel?: () => void;
  /** Configuration object for UnifiedFooter */
  unifiedFooterConfig?: any;
}

/**
 * Shared footer rendering utility that standardizes footer rendering
 * across dialogs and forms in the portal framework.
 *
 * This utility handles:
 * - Function-based footers with environment context
 * - Static footer content
 * - Disabled footers (footer: false)
 * - Default UnifiedFooter fallback
 * - Dialog vs standalone contexts
 * - Wizard/step form detection for dialogs
 */
export function renderFooter<T extends BaseRecord = any>(
  config: FooterRenderConfig<T>,
): React.ReactNode {
  const {
    className,
    dialogConfig,
    footer,
    formMethods,
    isDialog = false,
    onCancel,
    unifiedFooterConfig,
  } = config;

  // If footer is explicitly false, don't render anything
  if (footer === false) {
    return null;
  }

  // Handle function-based footers
  if (footer && isDialogFooterFunction(footer)) {
    const stepControl = useOptionalStepControlContext();
    const footerEnvironment = buildFooterEnvironment({
      dialogConfig,
      formMethods,
      isDialog,
      onCancel,
      stepControl,
    });

    const customFooter = footer(footerEnvironment);
    return <DialogFooter className={className}>{customFooter}</DialogFooter>;
  }

  // Handle static footer content
  if (footer) {
    return <DialogFooter className={className}>{footer}</DialogFooter>;
  }

  // Default: Use UnifiedFooter system
  const stepControl = useOptionalStepControlContext();
  const footerEnvironment = buildFooterEnvironment({
    dialogConfig,
    formMethods,
    isDialog,
    onCancel,
    stepControl,
  });

  return (
    <DialogFooter className={className}>
      <UnifiedFooter
        config={unifiedFooterConfig || dialogConfig?.formConfig || dialogConfig}
        environment={footerEnvironment}
      />
    </DialogFooter>
  );
}

// Helper function extracted from current DialogFooterContent
function buildFooterEnvironment<T extends BaseRecord = any>({
  dialogConfig,
  formMethods,
  isDialog,
  onCancel,
  stepControl,
}: {
  dialogConfig?: DialogConfig<T>;
  formMethods?: any;
  isDialog: boolean;
  onCancel?: () => void;
  stepControl?: any;
}) {
  // Handle standalone context (when not in dialog or dialogConfig is missing)
  const isStandaloneContext = !isDialog || !dialogConfig;
  if (isStandaloneContext) {
    return buildStandaloneFooterEnvironment(formMethods, dialogConfig);
  }

  // Handle dialog context
  return buildDialogFooterEnvironment(dialogConfig, formMethods, onCancel, stepControl);
}

/**
 * Builds footer environment for standalone contexts
 */
function buildStandaloneFooterEnvironment(formMethods: any, dialogConfig: any) {
  const builder = Environment.footer().standalone();
  
  // Add form context only if formMethods exists and dialogConfig.formConfig exists (when dialogConfig is provided)
  const shouldIncludeFormContext = formMethods && (!dialogConfig || dialogConfig.formConfig);
  if (shouldIncludeFormContext) {
    return builder
      .simpleForm({
        isSubmitting: formMethods?.formState?.isSubmitting || false,
        methods: formMethods,
      })
      .build();
  }
  
  // Return basic standalone footer without form context
  return builder.buildContainerOnly();
}

/**
 * Builds footer environment for dialog contexts
 */
function buildDialogFooterEnvironment(dialogConfig: any, formMethods: any, onCancel: (() => void) | undefined, stepControl: any) {
  const builder = Environment.footer().dialog({
    dialogConfig,
    onClose: onCancel || dialogConfig.onClose,
  });

  // Check if this is a wizard form with step control
  const isWizardForm = dialogConfig.formConfig && isWizardFormConfig(dialogConfig.formConfig);
  const hasStepControl = !!stepControl;
  
  if (isWizardForm && hasStepControl) {
    return builder
      .wizardForm({
        isSubmitting: formMethods?.formState?.isSubmitting || false,
        methods: formMethods,
      })
      .step({
        current: stepControl.currentStep,
        isFirst: stepControl.isFirstStep,
        isLast: stepControl.isLastStep,
        onNext: stepControl.handleNext,
        onPrevious: stepControl.handlePrevious,
        onRetry: stepControl.handleRetry,
        total: stepControl.totalSteps,
        retryCount: stepControl.retryCount,
      })
      .build();
  }

  // Add simple form context if formMethods and formConfig exist
  const shouldIncludeSimpleFormContext = formMethods && dialogConfig.formConfig;
  if (shouldIncludeSimpleFormContext) {
    return builder
      .simpleForm({
        isSubmitting: formMethods?.formState?.isSubmitting || false,
        methods: formMethods,
      })
      .build();
  }

  // Return dialog footer without form context
  return builder.buildContainerOnly();
}
