import { BaseRecord } from "@refinedev/core";

import { DialogType } from "../../dialog/Dialog.types";
import { ActionsFooter } from "../footers/ActionsFooter";
import { DefaultFooter } from "../footers/DefaultFooter";
import { FormFooter } from "../footers/FormFooter";
import { StepFormFooter } from "../footers/StepFormFooter";
import { WizardFooter } from "../footers/WizardFooter";
import { ContainerType } from "../types/container";
import { FooterEnvironment } from "../types/footer";
import { FormType } from "../types/form";
import { FooterComponent, FooterType } from "./types";

export interface FooterRegistry {
  get: (type: FooterType) => FooterComponent;
  register: (type: FooterType, component: FooterComponent) => void;
  resolveType: <T extends BaseRecord>(
    config: any,
    context: FooterEnvironment<T>,
  ) => FooterType;
}

export function createFooterRegistry(): FooterRegistry {
  const components = new Map<FooterType, FooterComponent>();

  // Register default components

  components.set(FooterType.DEFAULT, DefaultFooter);
  components.set(FooterType.FORM, FormFooter);
  components.set(FooterType.STEP_FORM, StepFormFooter);
  components.set(FooterType.WIZARD_FORM, WizardFooter);
  components.set(FooterType.ACTIONS, ActionsFooter);

  return {
    get(type: FooterType): FooterComponent {
      const component = components.get(type);
      if (!component) {
        console.warn(
          `Footer component not found for type: ${type}, falling back to DEFAULT`,
        );
        return components.get(FooterType.DEFAULT)!;
      }
      return component;
    },

    register(type: FooterType, component: FooterComponent): void {
      components.set(type, component);
    },

    resolveType<T extends BaseRecord>(
      config: any,
      context: FooterEnvironment<T>,
    ): FooterType {
      // Priority 2: Actions dropdown (dialog-specific)
      if (
        context.container.type === ContainerType.DIALOG &&
        config.type === DialogType.FORM &&
        "actions" in config &&
        config.actions
      ) {
        return FooterType.ACTIONS;
      }

      // Priority 3: Form type based on context
      switch (context.form?.type) {
        case FormType.WIZARD:
          return FooterType.WIZARD_FORM;
        case FormType.STEP:
          return FooterType.STEP_FORM;
        case FormType.SIMPLE:
        default:
          return FooterType.DEFAULT;
      }
    },
  };
}

// Create singleton instance
export const footerRegistry = createFooterRegistry();
