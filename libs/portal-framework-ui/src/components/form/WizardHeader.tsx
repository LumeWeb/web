"use client";

import { cn } from "@lumeweb/portal-framework-ui-core";
import { Check } from "lucide-react";
import React from "react";
import { isElement, isValidElementType } from "react-is";

import { ComponentSize, getComponentSizeClass } from "../sizing";

interface StepDefinition {
  description?: string;
  icon?: React.ReactNode;
  shortTitle?: string;
  title: string;
}

interface StepHeaderProps {
  allowNavigation?: boolean;
  currentStep: number;
  descriptionMaxWidth?: ComponentSize;
  disabledSteps?: number[];
  onStepClick?: (stepIndex: number) => void;
  showDescriptions?: boolean;
  showTitles?: boolean;
  steps: StepDefinition[];
  iconSize?: "sm" | "md" | "lg";
}

export function WizardHeader({
  allowNavigation = true,
  currentStep,
  descriptionMaxWidth = "xs" as ComponentSize,
  disabledSteps = [],
  onStepClick,
  showDescriptions = true,
  showTitles = true,
  steps,
  iconSize = "sm",
}: StepHeaderProps) {
  const isStepDisabled = (index: number) => {
    return disabledSteps.includes(index) || index >= currentStep;
  };

  const isStepCompleted = (index: number) => {
    return index < currentStep;
  };

  const isStepActive = (index: number) => {
    return index === currentStep;
  };

  const handleStepClick = (index: number) => {
    if (!allowNavigation) return;
    const isDisabled = isStepDisabled(index);
    if (!isDisabled && onStepClick) {
      onStepClick(index);
    }
  };

  // Mobile Instagram-style progress bars
  const renderMobileProgressBars = () => (
    <div className="mb-6 w-full px-4 md:hidden">
      <div className="flex h-1 w-full overflow-hidden rounded-full bg-muted">
        {steps.map((_, index) => {
          const isActive = isStepActive(index);
          const isCompleted = isStepCompleted(index);
          const isDisabled = isStepDisabled(index);
          const canNavigate = allowNavigation && !isDisabled && index < currentStep;
          
          return (
            <div 
              key={index}
              className={cn(
                "h-full transition-all duration-300 flex-1",
                {
                  "bg-accent": isCompleted,
                  "bg-primary": isActive && !isCompleted,
                  "bg-muted": !isCompleted && !isActive,
                  "cursor-pointer": canNavigate,
                }
              )}
              onClick={canNavigate ? () => handleStepClick(index) : undefined}
              onKeyDown={
                canNavigate
                  ? (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        handleStepClick(index);
                      }
                    }
                  : undefined
              }
              role={canNavigate ? "button" : undefined}
              tabIndex={canNavigate ? 0 : -1}
            />
          );
        })}
      </div>
      {steps[currentStep] && (
        <div className="mt-4 text-center">
          <div className="mb-2 flex items-center justify-center gap-2">
            {renderIcon(steps[currentStep].icon, iconSize) && (
              <div className="flex items-center">
                {renderIcon(steps[currentStep].icon, iconSize)}
              </div>
            )}
            <span className="text-primary text-sm font-medium">
              {steps[currentStep].shortTitle || steps[currentStep].title}
            </span>
          </div>
          <div className="text-muted-foreground text-xs">
            Step {currentStep + 1} of {steps.length}
          </div>
        </div>
      )}
    </div>
  );

  // Desktop circular timeline
  const renderDesktopTimeline = () => (
    <div className="mb-6 hidden items-center justify-center gap-4 px-4 md:flex">
      {steps.map((step, index) => {
        const isActive = isStepActive(index);
        const isCompleted = isStepCompleted(index);
        const isDisabled = isStepDisabled(index);
        const canNavigate =
          allowNavigation && !isDisabled && index < currentStep;

        return (
          <div className="flex items-center" key={index}>
            <div className="flex flex-col items-center justify-center">
              <div
                aria-current={isActive ? "step" : undefined}
                aria-disabled={isDisabled}
                className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 ${
                  isCompleted
                    ? "bg-accent text-white"
                    : isActive
                      ? "bg-primary text-primary-foreground ring-primary/20 ring-4"
                      : "bg-muted text-muted-foreground"
                } ${canNavigate ? "cursor-pointer hover:scale-110 hover:shadow-lg" : ""}`}
                onClick={canNavigate ? () => handleStepClick(index) : undefined}
                onKeyDown={
                  canNavigate
                    ? (e) => {
                        if (
                          canNavigate &&
                          (e.key === "Enter" || e.key === " ")
                        ) {
                          handleStepClick(index);
                        }
                      }
                    : undefined
                }
                role={canNavigate ? "button" : undefined}
                tabIndex={canNavigate ? 0 : -1}>
                {isCompleted ? (
                  <Check className="h-5 w-5" />
                ) : (
                  renderIcon(step.icon, "md") || <div className="h-5 w-5" />
                )}
              </div>
              {showTitles && (
                <span
                  className={`mt-3 text-center text-sm font-medium ${
                    isActive
                      ? "text-primary"
                      : isCompleted
                        ? "text-accent-foreground"
                        : "text-muted-foreground"
                  } ${canNavigate ? "cursor-pointer" : ""}`}
                  onClick={
                    canNavigate ? () => handleStepClick(index) : undefined
                  }>
                  {step.shortTitle || step.title}
                </span>
              )}
              {showDescriptions && step.description && (
                <span
                  className={cn(
                    "text-muted-foreground mt-2 text-center text-xs",
                    getComponentSizeClass(descriptionMaxWidth),
                  )}>
                  {step.description}
                </span>
              )}
            </div>
            {index < steps.length - 1 && (
              <div
                className={`mx-2 h-0.5 w-6 transition-all duration-200 ${
                  isCompleted ? "bg-accent" : "bg-muted"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <>
      {renderMobileProgressBars()}
      {renderDesktopTimeline()}
    </>
  );
}

// Helper function to safely render icons
function renderIcon(icon: React.ReactNode, size: "sm" | "md" | "lg" = "sm"): React.ReactNode {
  if (!icon) return null;

  // Define size classes
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  // If icon is already a valid React element, clone it with size classes
  if (isElement(icon)) {
    return React.cloneElement(icon as React.ReactElement, {
      className: cn((icon as React.ReactElement).props.className, sizeClasses[size]),
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
