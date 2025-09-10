import type { DialogConfig } from "../../dialog/Dialog.types";

/**
 * Enum representing the different types of containers
 */
export enum ContainerType {
  /**
   * Dialog container type
   */
  DIALOG = "dialog",
  /**
   * Standalone container type
   */
  STANDALONE = "standalone",
}

/**
 * Union type representing any container environment
 */
export type AnyContainerEnvironment =
  | DialogContainerEnvironment
  | StandaloneContainerEnvironment;

/**
 * Base interface for container environment
 */
export interface ContainerEnvironment {
  /**
   * The type of container
   */
  type: ContainerType;
}

/**
 * Interface representing a dialog container environment
 */
export interface DialogContainerEnvironment extends ContainerEnvironment {
  /**
   * Configuration for the dialog
   */
  dialogConfig: DialogConfig<any>;
  /**
   * Function to close the dialog
   */
  onClose: () => void;
  /**
   * The type of container (dialog)
   */
  type: ContainerType.DIALOG;
}

/**
 * Interface representing a standalone container environment
 */
export interface StandaloneContainerEnvironment extends ContainerEnvironment {
  /**
   * The type of container (standalone)
   */
  type: ContainerType.STANDALONE;
}

/**
 * Type guard to check if a container environment is a dialog container
 * @param ctx - The container environment to check
 * @returns True if the container is a dialog container, false otherwise
 */
export function isDialogContainer(
  ctx: AnyContainerEnvironment,
): ctx is DialogContainerEnvironment {
  return ctx.type === ContainerType.DIALOG;
}

/**
 * Type guard to check if a container environment is a standalone container
 * @param ctx - The container environment to check
 * @returns True if the container is a standalone container, false otherwise
 */
export function isStandaloneContainer(
  ctx: AnyContainerEnvironment,
): ctx is StandaloneContainerEnvironment {
  return ctx.type === ContainerType.STANDALONE;
}
