import { BaseFooterProps } from "../types/footer";
import { BaseHeaderProps } from "../types/header";

export enum FooterType {
  ACTIONS = "actions",
  CUSTOM = "custom",
  DEFAULT = "default",
  FORM = "form",
  WIZARD_FORM = "wizard_form",
  STEP_FORM = "step_form",
}

export enum HeaderType {
  CUSTOM = "custom",
  DEFAULT = "default",
  FORM = "form",
  WIZARD = "wizard",
}

export type FooterComponent<T = any> = React.ComponentType<BaseFooterProps<T>>;
export type HeaderComponent<T = any> = React.ComponentType<BaseHeaderProps<T>>;
