import { cn, lazyIcon } from "@lumeweb/portal-framework-ui-core";

import React, { useMemo } from "react";
import { isElement, isValidElementType } from "react-is";

import { ComponentSize, getComponentSizeClass } from "../../sizing";
import { useHeaderContext } from "../context/HeaderContext";
import { BaseHeaderProps, isWizardNavigation } from "../types/header";
import {
  calculateStepState,
  createStepClickHandler,
  createStepKeyHandler,
} from "../utils/stepState";
const Check = lazyIcon("Check");


export function WizardHeader<T = any>({ className }: BaseHeaderProps<T>) {
  const context = useHeaderContext<T>();

  // Wizard header requires wizard navigation context
  if (!isWizardNavigation(context.navigation)) {
    console.warn("WizardHeader rendered without wizard navigation context");
    return null;
  }

  const {
    allowNavigation,
    current,
    descriptionMaxWidth = "xs" as ComponentSize,
    disabledSteps = [],
    iconSize = "sm",
    onStepClick,
    showStepDescriptions = true,
    showStepTitles = true,
    steps = [],
    total,
  } = context.navigation;

  // Resolve allowNavigation value (it's already pre-resolved)
  const resolvedAllowNavigation = useMemo(() => {
    if (typeof allowNavigation === "function") {
      return allowNavigation();
    }
    return allowNavigation;
  }, [allowNavigation]);

  // Mobile Instagram-style progress bars
  const renderMobileProgressBars = () => (
    <div className="mb-6 w-full px-4 md:hidden">
      <div className="bg-muted flex h-1 w-full overflow-hidden rounded-full">
        {Array.from({ length: total }, (_, index) => {
          const stepState = calculateStepState(
            index,
            current,
            total,
            resolvedAllowNavigation,
            disabledSteps,
            steps,
          );

          return (
            <div
              className={cn("h-full flex-1 transition-all duration-300", {
                "bg-accent": stepState.isCompleted,
                "bg-muted": !stepState.isCompleted && !stepState.isActive,
                "bg-primary": stepState.isActive && !stepState.isCompleted,
                "cursor-pointer": stepState.canNavigate,
              })}
              key={index}
              onClick={
                stepState.canNavigate
                  ? createStepClickHandler(
                      index,
                      resolvedAllowNavigation,
                      disabledSteps,
                      current,
                      onStepClick,
                    )
                  : undefined
              }
              onKeyDown={
                stepState.canNavigate
                  ? createStepKeyHandler(
                      index,
                      resolvedAllowNavigation,
                      disabledSteps,
                      current,
                      onStepClick,
                    )
                  : undefined
              }
              role={stepState.canNavigate ? "button" : undefined}
              tabIndex={stepState.canNavigate ? 0 : -1}
            />
          );
        })}
      </div>
      {steps[current] && (
        <div className="mt-4 text-center">
          <div className="mb-2 flex items-center justify-center gap-2">
            {renderIcon(steps[current].icon, iconSize) && (
              <div className="flex items-center">
                {renderIcon(steps[current].icon, iconSize)}
              </div>
            )}
            <span className="text-primary text-sm font-medium">
              {steps[current].shortTitle ||
                steps[current].title ||
                `Step ${current}`}
            </span>
          </div>
          <div className="text-muted-foreground text-xs">
            Step {current} of {total}
          </div>
        </div>
      )}
    </div>
  );

  // Desktop circular timeline
  const renderDesktopTimeline = () => (
    <div className="mb-6 hidden items-center justify-center gap-4 px-4 md:flex">
      {Array.from({ length: total }, (_, index) => {
        const stepState = calculateStepState(
          index,
          current,
          total,
          resolvedAllowNavigation,
          disabledSteps,
          steps,
        );

        return (
          <div className="flex items-center" key={index}>
            <div className="flex flex-col items-center justify-center">
              <div
                aria-current={stepState.isActive ? "step" : undefined}
                aria-disabled={stepState.isDisabled}
                className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 ${
                  stepState.isCompleted
                    ? "bg-accent text-white"
                    : stepState.isActive
                      ? "bg-primary text-primary-foreground ring-primary/20 ring-4"
                      : "bg-muted text-muted-foreground"
                } ${stepState.canNavigate ? "cursor-pointer hover:scale-110 hover:shadow-lg" : ""}`}
                onClick={
                  stepState.canNavigate
                    ? createStepClickHandler(
                        index,
                        resolvedAllowNavigation,
                        disabledSteps,
                        current,
                        onStepClick,
                      )
                    : undefined
                }
                onKeyDown={
                  stepState.canNavigate
                    ? createStepKeyHandler(
                        index,
                        resolvedAllowNavigation,
                        disabledSteps,
                        current,
                        onStepClick,
                      )
                    : undefined
                }
                role={stepState.canNavigate ? "button" : undefined}
                tabIndex={stepState.canNavigate ? 0 : -1}>
                {stepState.isCompleted ? (
                  <Check className="h-5 w-5" />
                ) : (
                  renderIcon(stepState.step.icon, "md") || (
                    <div className="h-5 w-5" />
                  )
                )}
              </div>
              {showStepTitles && (
                <span
                  className={`mt-3 text-center text-sm font-medium ${
                    stepState.isActive
                      ? "text-primary"
                      : stepState.isCompleted
                        ? "text-accent-foreground"
                        : "text-muted-foreground"
                  } ${stepState.canNavigate ? "cursor-pointer" : ""}`}
                  onClick={
                    stepState.canNavigate
                      ? createStepClickHandler(
                          index,
                          resolvedAllowNavigation,
                          disabledSteps,
                          current,
                          onStepClick,
                        )
                      : undefined
                  }>
                  {stepState.step.shortTitle || stepState.step.title}
                </span>
              )}
              {showStepDescriptions && stepState.step.description && (
                <span
                  className={cn(
                    "text-muted-foreground mt-2 text-center text-xs",
                    getComponentSizeClass(descriptionMaxWidth),
                  )}>
                  {stepState.step.description}
                </span>
              )}
            </div>
            {index < total - 1 && (
              <div
                className={`mx-2 h-0.5 w-6 transition-all duration-200 ${
                  stepState.isCompleted ? "bg-accent" : "bg-muted"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className={cn("space-y-6", className)}>
      {renderMobileProgressBars()}
      {renderDesktopTimeline()}
    </div>
  );
}

// Helper function to safely render icons
function renderIcon(
  icon: React.ReactNode,
  size: "lg" | "md" | "sm" = "sm",
): React.ReactNode {
  if (!icon) return null;

  // Define size classes
  const sizeClasses = {
    lg: "h-6 w-6",
    md: "h-5 w-5",
    sm: "h-4 w-4",
  };

  // If icon is already a valid React element, clone it with size classes
  if (isElement(icon)) {
    return React.cloneElement(icon as React.ReactElement, {
      className: cn(
        (icon as React.ReactElement).props.className,
        sizeClasses[size],
      ),
    });
  }

  // If icon is a valid React component type, instantiate it with size classes
  if (isValidElementType(icon)) {
    const IconComponent = icon as React.ComponentType<{ className?: string }>;
    return <IconComponent className={sizeClasses[size]} />;
  }

  // For any other case, return null
  return null;
}
