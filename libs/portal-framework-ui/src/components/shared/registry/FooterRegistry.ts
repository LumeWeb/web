import { BaseRecord } from "@refinedev/core";

import {
  ActionsFooter,
  ContainerType,
  DefaultFooter,
  DialogType,
  DialogTypes,
  FooterEnvironment,
  FormFooter,
  FormType,
  StepFormFooter,
  WizardFooter,
} from "@/components";
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
        config.type === DialogTypes.FORM &&
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
