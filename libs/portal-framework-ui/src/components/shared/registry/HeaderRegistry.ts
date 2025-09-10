import { BaseRecord } from "@refinedev/core";

import { DefaultHeader } from "../headers/DefaultHeader";
import { FormHeader } from "../headers/FormHeader";
import { WizardHeader } from "../headers/WizardHeader";
import { HeaderEnvironment, NavigationType } from "../types/header";
import { HeaderComponent, HeaderType } from "./types";

export interface HeaderRegistry {
  get: (type: HeaderType) => HeaderComponent;
  register: (type: HeaderType, component: HeaderComponent) => void;
  resolveType: <T extends BaseRecord>(
    config: any,
    context: HeaderEnvironment<T>,
  ) => HeaderType;
}

export function createHeaderRegistry(): HeaderRegistry {
  const components = new Map<HeaderType, HeaderComponent>();

  // Register default components

  components.set(HeaderType.DEFAULT, DefaultHeader);
  components.set(HeaderType.FORM, FormHeader);
  components.set(HeaderType.WIZARD, WizardHeader);

  return {
    get(type: HeaderType): HeaderComponent {
      const component = components.get(type);
      if (!component) {
        console.warn(
          `Header component not found for type: ${type}, falling back to DEFAULT`,
        );
        return components.get(HeaderType.DEFAULT)!;
      }
      return component;
    },

    register(type: HeaderType, component: HeaderComponent): void {
      components.set(type, component);
    },

    resolveType<T extends BaseRecord>(
      config: any,
      context: HeaderEnvironment<T>,
    ): HeaderType {
      // Priority 1: Explicit header configuration
      if ("header" in config && config.header === false) {
        return HeaderType.CUSTOM;
      }

      // Priority 2: Navigation type based on context
      switch (context.navigation.type) {
        case NavigationType.WIZARD:
          return HeaderType.WIZARD;
        case NavigationType.NONE:
        case NavigationType.STEP:
        default:
          return HeaderType.FORM;
      }
    },
  };
}

// Create singleton instance
export const headerRegistry = createHeaderRegistry();
