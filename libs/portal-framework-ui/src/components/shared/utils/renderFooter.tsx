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
  stepControl,
}: {
  dialogConfig?: DialogConfig<T>;
  formMethods?: any;
  isDialog: boolean;
  stepControl?: any;
}) {
  if (!isDialog || !dialogConfig) {
    // Standalone context
    return Environment.footer()
      .standalone()
      .simpleForm({
        isSubmitting: formMethods?.formState?.isSubmitting || false,
        methods: formMethods,
      })
      .build();
  }

  const isWizardForm =
    dialogConfig.formConfig && isWizardFormConfig(dialogConfig.formConfig);
  const hasStepControl = !!stepControl;

  const builder = Environment.footer().dialog({
    dialogConfig,
    onClose: dialogConfig.onClose,
  });

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

  return builder
    .simpleForm({
      isSubmitting: formMethods?.formState?.isSubmitting || false,
      methods: formMethods,
    })
    .build();
}
