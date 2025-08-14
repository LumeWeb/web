import type { ComponentType, MouseEvent, ReactNode } from "react";
import { BaseRecord } from "@refinedev/core";

export enum ActionItemType {
  BUTTON = "button",
  CANCEL = "cancel",
  CUSTOM = "custom",
  CUSTOM_COMPONENT = "custom-component",
  DATE = "date",
  FILE = "file",
  LINK = "link",
  SUBMIT = "submit",
}

export type ActionItemConfig =
  | ButtonActionItemConfig
  | CancelActionItemConfig
  | CustomActionItemConfig
  | CustomComponentActionItemConfig
  | LinkActionItemConfig
  | SubmitActionItemConfig;

export interface ActionItemProps<
  T extends ActionItemConfig = ActionItemConfig,
> {
  closeDialog?: () => void;
  config: T;
  isSubmitting?: boolean;
}

export type ActionListLayout = "horizontal" | "vertical";

// Added ButtonActionItemConfig
export interface ButtonActionItemConfig extends BaseActionItemConfig {
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  type: ActionItemType.BUTTON;
}

export interface CancelActionItemConfig extends BaseActionItemConfig {
  onClick?: () => void;
  type: ActionItemType.CANCEL;
}

export interface CustomActionItemConfig extends BaseActionItemConfig {
  onClick: () => void;
  type: ActionItemType.CUSTOM;
}

export interface CustomComponentActionItemConfig extends BaseActionItemConfig {
  component: ComponentType<any>;
  props?: Record<string, any>;
  type: ActionItemType.CUSTOM_COMPONENT;
}

export interface LinkActionItemConfig extends BaseActionItemConfig {
  reloadDocument?: boolean;
  target?: string;
  to: string;
  type: ActionItemType.LINK;
}

export interface SubmitActionItemConfig extends BaseActionItemConfig {
  type: ActionItemType.SUBMIT;
}

interface BaseActionItemConfig {
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
  key?: number | string;
  label?: string;
  type: ActionItemType;
}
