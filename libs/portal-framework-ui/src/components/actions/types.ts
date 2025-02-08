export enum ActionItemType {
  CANCEL = "cancel",
  CUSTOM = "custom",
  CUSTOM_COMPONENT = "custom-component",
  DATE = "date",
  FILE = "file", 
  LINK = "link",
  SUBMIT = "submit",
  BUTTON = "button",
}

export type ActionItemConfig =
  | CancelActionItemConfig
  | CustomActionItemConfig
  | CustomComponentActionItemConfig
  | LinkActionItemConfig
  | SubmitActionItemConfig
  | ButtonActionItemConfig;

export interface ActionItemProps<
  T extends ActionItemConfig = ActionItemConfig,
> {
  closeDialog?: () => void;
  config: T;
  isSubmitting?: boolean;
}

export type ActionListLayout = "horizontal" | "vertical";

export interface CancelActionItemConfig extends BaseActionItemConfig {
  onClick?: () => void;
  type: ActionItemType.CANCEL;
}

export interface CustomActionItemConfig extends BaseActionItemConfig {
  onClick: () => void;
  type: ActionItemType.CUSTOM;
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

// Added ButtonActionItemConfig
export interface ButtonActionItemConfig extends BaseActionItemConfig {
  onClick?: () => void; // Buttons might have an onClick handler
  type: ActionItemType.BUTTON;
}


interface BaseActionItemConfig {
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  key?: number | string;
  label?: string;
  type: ActionItemType;
}

export interface CustomComponentActionItemConfig extends BaseActionItemConfig {
  component: React.ComponentType<any>;
  props?: Record<string, any>;
  type: ActionItemType.CUSTOM_COMPONENT;
}
