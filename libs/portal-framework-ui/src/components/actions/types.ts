import type { ComponentType, MouseEvent, ReactNode } from "react";

/**
 * Enum defining the types of action items available
 */
export enum ActionItemType {
  /** Standard button action */
  BUTTON = "button",
  /** Cancel action button */
  CANCEL = "cancel",
  /** Custom action button */
  CUSTOM = "custom",
  /** Custom component action */
  CUSTOM_COMPONENT = "custom-component",
  /** Date picker action */
  DATE = "date",
  /** File upload action */
  FILE = "file",
  /** Link action button */
  LINK = "link",
  /** Submit action button */
  SUBMIT = "submit",
  /** Retry action button */
  RETRY = "retry",
}

/**
 * Union type of all possible action item configurations
 */
export type ActionItemConfig =
  | ButtonActionItemConfig
  | CancelActionItemConfig
  | CustomActionItemConfig
  | CustomComponentActionItemConfig
  | LinkActionItemConfig
  | SubmitActionItemConfig
  | RetryActionItemConfig;

/**
 * Props for ActionItem components
 */
export interface ActionItemProps<
  T extends ActionItemConfig = ActionItemConfig,
> {
  /** Function to close the parent dialog */
  closeDialog?: () => void;
  /** Configuration object for the action item */
  config: T;
  /** Whether the action is currently submitting */
  isSubmitting?: boolean;
}

/**
 * Layout options for action lists
 */
export type ActionListLayout = "horizontal" | "vertical";

/**
 * Configuration for a standard button action item
 */
export interface ButtonActionItemConfig extends BaseActionItemConfig {
  /** Click handler for the button */
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  /** Type identifier for button actions */
  type: ActionItemType.BUTTON;
}

/**
 * Configuration for a cancel action item
 */
export interface CancelActionItemConfig extends BaseActionItemConfig {
  /** Click handler for the cancel action */
  onClick?: () => void;
  /** Type identifier for cancel actions */
  type: ActionItemType.CANCEL;
}

/**
 * Configuration for a custom action item
 */
export interface CustomActionItemConfig extends BaseActionItemConfig {
  /** Required click handler for custom actions */
  onClick: () => void;
  /** Type identifier for custom actions */
  type: ActionItemType.CUSTOM;
}

/**
 * Configuration for a custom component action item
 */
export interface CustomComponentActionItemConfig extends BaseActionItemConfig {
  /** Component to render for this action */
  component: ComponentType<any>;
  /** Props to pass to the custom component */
  props?: Record<string, any>;
  /** Type identifier for custom component actions */
  type: ActionItemType.CUSTOM_COMPONENT;
}

/**
 * Configuration for a link action item
 */
export interface LinkActionItemConfig extends BaseActionItemConfig {
  /** Whether to reload the document when following the link */
  reloadDocument?: boolean;
  /** Target attribute for the link */
  target?: string;
  /** URL to navigate to */
  to: string;
  /** Type identifier for link actions */
  type: ActionItemType.LINK;
}

/**
 * Configuration for a submit action item
 */
export interface SubmitActionItemConfig extends BaseActionItemConfig {
  /** Type identifier for submit actions */
  type: ActionItemType.SUBMIT;
}

/**
 * Configuration for a retry action item
 */
export interface RetryActionItemConfig extends BaseActionItemConfig {
  /** Click handler for the retry action */
  onClick?: () => void;
  /** Type identifier for retry actions */
  type: ActionItemType.RETRY;
}

/**
 * Base configuration interface for all action items
 */
interface BaseActionItemConfig {
  /** Child elements to render inside the action item */
  children?: ReactNode;
  /** CSS class name for styling */
  className?: string;
  /** Whether the action item is disabled */
  disabled?: boolean;
  /** Unique key for the action item */
  key?: number | string;
  /** Label text for the action item */
  label?: string;
  /** Type of action item */
  type: ActionItemType;
}
