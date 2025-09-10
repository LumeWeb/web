import type { BaseRecord } from "@refinedev/core";

import React, { ReactNode } from "react";

import {
  DialogConfig,
  isDialogHeaderFunction,
} from "../../dialog/Dialog.types";
import { useOptionalStepControlContext } from "../../form/StepControlContext";
import { Environment } from "../environment/builders";
import { UnifiedHeader } from "../UnifiedHeader";

export interface HeaderRenderConfig<T extends BaseRecord = any> {
  /** Actions for the header */
  actions?: any[];
  /** CSS class name for the header container */
  className?: string;
  /** Description for the header */
  description?: string;
  /** Dialog configuration (required for dialog contexts) */
  dialogConfig?: DialogConfig<T>;
  /** Header configuration - can be false, ReactNode, or function */
  header?: ((environment: any) => ReactNode) | false | ReactNode;
  /** Whether this is rendered in a dialog context */
  isDialog?: boolean;
  /** Title for the header */
  title?: string;
  /** Configuration object for UnifiedHeader */
  unifiedHeaderConfig?: any;
}

/**
 * Shared header rendering utility that standardizes header rendering
 * across dialogs and forms in the portal framework.
 *
 * This utility handles:
 * - Function-based headers with environment context
 * - Static header content
 * - Disabled headers (header: false)
 * - Default UnifiedHeader fallback
 * - Dialog vs standalone contexts
 * - Wizard/step form detection for dialogs
 */
export function renderHeader<T extends BaseRecord = any>(
  config: HeaderRenderConfig<T>,
): React.ReactNode {
  const {
    actions,
    className,
    description,
    dialogConfig,
    header,
    isDialog = false,
    title,
    unifiedHeaderConfig,
  } = config;

  // If header is explicitly false, don't render anything
  if (header === false) {
    return null;
  }

  // Handle function-based headers
  if (header && isDialogHeaderFunction(header)) {
    let headerEnvironment;

    if (isDialog && dialogConfig) {
      // Dialog context - determine if wizard or simple form
      if (dialogConfig.formConfig && "steps" in dialogConfig.formConfig) {
        // Wizard dialog - use optional step control context
        const stepControl = useOptionalStepControlContext();
        if (stepControl) {
          headerEnvironment = Environment.header()
            .dialog({ dialogConfig, onClose: dialogConfig.onClose })
            .content({ actions, description, title })
            .wizardNavigation({
              current: stepControl.currentStep,
              progressStyle: "timeline", // Default progress style
              steps: dialogConfig.formConfig.steps,
              total: stepControl.totalSteps,
            })
            .build();
        } else {
          // Fallback to simple dialog context if not in step control context
          headerEnvironment = Environment.header()
            .dialog({ dialogConfig, onClose: dialogConfig.onClose })
            .content({ actions, description, title })
            .noneNavigation()
            .build();
        }
      } else {
        // Simple dialog context
        headerEnvironment = Environment.header()
          .dialog({ dialogConfig, onClose: dialogConfig.onClose })
          .content({ actions, description, title })
          .noneNavigation()
          .build();
      }
    } else {
      // Standalone context
      headerEnvironment = Environment.header()
        .standalone()
        .content({ actions, description, title })
        .noneNavigation()
        .build();
    }

    const customHeader = header(headerEnvironment);
    return <div className={className}>{customHeader}</div>;
  }

  // Handle static header content
  if (header) {
    return <div className={className}>{header}</div>;
  }

  // Default: Use UnifiedHeader system
  let unifiedHeaderEnvironment;

  if (isDialog && dialogConfig) {
    // Dialog context - determine if wizard or simple form
    if (dialogConfig.formConfig && "steps" in dialogConfig.formConfig) {
      // Wizard dialog - use optional step control context
      const stepControl = useOptionalStepControlContext();
      if (stepControl) {
        unifiedHeaderEnvironment = Environment.header()
          .dialog({ dialogConfig, onClose: dialogConfig.onClose })
          .content({ actions, description, title })
          .wizardNavigation({
            current: stepControl.currentStep,
            progressStyle: "timeline", // Default progress style
            steps: dialogConfig.formConfig.steps,
            total: stepControl.totalSteps,
          })
          .build();
      } else {
        // Fallback to simple dialog context if not in step control context
        unifiedHeaderEnvironment = Environment.header()
          .dialog({ dialogConfig, onClose: dialogConfig.onClose })
          .content({ actions, description, title })
          .noneNavigation()
          .build();
      }
    } else {
      // Simple dialog context
      unifiedHeaderEnvironment = Environment.header()
        .dialog({ dialogConfig, onClose: dialogConfig.onClose })
        .content({ actions, description, title })
        .noneNavigation()
        .build();
    }
  } else {
    // Standalone context
    unifiedHeaderEnvironment = Environment.header()
      .standalone()
      .content({ actions, description, title })
      .noneNavigation()
      .build();
  }

  return (
    <UnifiedHeader
      config={unifiedHeaderConfig || { actions, description, title }}
      environment={unifiedHeaderEnvironment}
    />
  );
}
