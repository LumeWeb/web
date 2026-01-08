import type { BaseRecord } from "@refinedev/core";

import type { WizardStepDefinition } from "../../form/types";

import { ActionItemConfig } from "../../actions";
import { AnyContainerEnvironment } from "./container";
import type { AllowStepNavigation } from "./navigation";

export enum NavigationType {
  NONE = "none",
  STEP = "step",
  WIZARD = "wizard",
}

export enum ProgressStyleType {
  DOTS = "dots",
  STEPPER = "stepper",
  TIMELINE = "timeline",
}

export type AnyNavigationEnvironment =
  | NoneNavigationEnvironment
  | StepNavigationEnvironment
  | WizardNavigationEnvironment;

export interface BaseHeaderProps<T extends BaseRecord = any> {
  actionButtons?: ActionItemConfig[];
  className?: string;
  description?: string;
  environment: HeaderEnvironment<T>;
  title?: string;
}

export interface HeaderContent {
  actionButtons?: ActionItemConfig[];
  description?: string;
  title?: string;
}

export interface HeaderEnvironment<T extends BaseRecord = any> {
  container: AnyContainerEnvironment;
  content: HeaderContent;
  navigation: AnyNavigationEnvironment;
}

export interface NavigationEnvironment {
  current?: number;
  progressStyle?: ProgressStyleType;
  showStepDescriptions?: boolean;
  showStepTitles?: boolean;
  total?: number;
  type: NavigationType;
}

export interface NoneNavigationEnvironment extends NavigationEnvironment {
  type: NavigationType.NONE;
}

export interface StepNavigationEnvironment extends NavigationEnvironment {
  current?: number;
  total?: number;
  type: NavigationType.STEP;
}

// createHeaderContext function is now in context/builders.ts

export interface WizardNavigationEnvironment extends NavigationEnvironment {
  allowNavigation?: AllowStepNavigation;
  current: number;
  descriptionMaxWidth?: string;
  disabledSteps?: number[];
  iconSize?: string;
  onStepClick?: (stepIndex: number) => void;
  progressStyle: ProgressStyleType;
  showStepDescriptions: boolean;
  showStepTitles: boolean;
  steps?: WizardStepDefinition[];
  total: number;
  type: NavigationType.WIZARD;
}

// Combined type guards for header environment
export function hasNavigation(
  ctx: HeaderEnvironment,
): ctx is HeaderEnvironment & {
  navigation: StepNavigationEnvironment | WizardNavigationEnvironment;
} {
  return ctx.navigation.type !== NavigationType.NONE;
}

export function isNoneNavigation(
  ctx: AnyNavigationEnvironment,
): ctx is NoneNavigationEnvironment {
  return ctx.type === NavigationType.NONE;
}

export function isStepHeaderEnvironment<T extends BaseRecord = any>(
  ctx: HeaderEnvironment<T>,
): ctx is HeaderEnvironment<T> & { navigation: StepNavigationEnvironment } {
  return ctx.navigation.type === NavigationType.STEP;
}

export function isStepNavigation(
  ctx: AnyNavigationEnvironment,
): ctx is StepNavigationEnvironment {
  return ctx.type === NavigationType.STEP;
}

export function isWizardHeaderEnvironment<T extends BaseRecord = any>(
  ctx: HeaderEnvironment<T>,
): ctx is HeaderEnvironment<T> & { navigation: WizardNavigationEnvironment } {
  return ctx.navigation.type === NavigationType.WIZARD;
}

// Helper function to determine effective allowNavigation for wizard
export function getEffectiveAllowNavigation(
  wizardEnv: WizardNavigationEnvironment
): boolean | (() => boolean) {
  return wizardEnv.allowNavigation ?? true;
}

// Type guards for navigation environment
export function isWizardNavigation(
  ctx: AnyNavigationEnvironment,
): ctx is WizardNavigationEnvironment {
  return ctx.type === NavigationType.WIZARD;
}
