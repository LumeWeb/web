import { ComponentType } from "react";

import type { ActionItemProps, ActionItemType } from "./types";

const actionItemRegistry = new Map<
  ActionItemType,
  ComponentType<ActionItemProps<any>>
>();

export function getActionItemComponent(
  type: ActionItemType,
): ComponentType<ActionItemProps<any>> | undefined {
  return actionItemRegistry.get(type);
}

export function registerActionItemComponent(
  type: ActionItemType,
  component: ComponentType<ActionItemProps<any>>,
) {
  if (actionItemRegistry.has(type)) {
    console.warn(
      `ActionItemComponent type "${type}" is already registered. Overwriting.`,
    );
  }
  actionItemRegistry.set(type, component);
}

/**
 * Clears the action item registry.
 * Use ONLY for testing purposes.
 */
export function resetRegistryForTesting() {
  actionItemRegistry.clear();
}
