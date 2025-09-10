// Re-export types that builders depend on
export type {
  AnyContainerEnvironment,
  DialogContainerEnvironment,
  StandaloneContainerEnvironment,
} from "../types/container";
export type { FooterEnvironment } from "../types/footer";

export type {
  AnyFormEnvironment,
  SimpleFormEnvironment,
  StepFormEnvironment,
  WizardFormEnvironment,
} from "../types/form";

export type {
  AnyNavigationEnvironment,
  HeaderContent,
  HeaderEnvironment,
  NoneNavigationEnvironment,
  StepNavigationEnvironment,
  WizardNavigationEnvironment,
} from "../types/header";

export type { StepEnvironment } from "../types/step";

// Object-Based Builder Pattern for Environment API
export { Environment } from "./builders";

export type {
  FooterEnvironmentBuilder,
  HeaderEnvironmentBuilder,
} from "./builders";
