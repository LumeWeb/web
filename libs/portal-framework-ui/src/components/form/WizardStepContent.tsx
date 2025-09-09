import React, { type ReactNode } from "react";
import { isElement, isValidElementType } from "react-is";

interface StepContentProps {
  children: ReactNode;
  className?: string;
  description?: string;
  icon?: ReactNode;
  isActive?: boolean;
  title?: string;
}

export function WizardStepContent({
  children,
  className = "",
  description,
  icon,
  isActive = true,
  title,
}: StepContentProps) {
  if (!isActive) {
    return null;
  }

  return (
    <div
      className={`space-y-6 transition-all duration-300 ease-in-out ${className}`}>
      {(title || description || icon) && (
        <div className="bg-muted flex items-start gap-4 rounded-lg p-4">
          {icon && (
            <div
              aria-hidden={!title}
              className="bg-primary/10 text-primary flex-shrink-0 rounded-lg p-2">
              {renderIcon(icon)}
            </div>
          )}
          {(title || description) && (
            <div>
              {title && (
                <h2
                  aria-label={description ? `${title}: ${description}` : title}
                  className="text-foreground text-xl font-semibold">
                  {title}
                </h2>
              )}
              {description && (
                <p
                  aria-label={title ? `${title}: ${description}` : description}
                  className="text-muted-foreground mt-1 text-sm">
                  {description}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      <div className="pt-2">{children}</div>
    </div>
  );
}

// Helper function to safely render icons
function renderIcon(icon: ReactNode): ReactNode {
  if (!icon) return null;

  // If icon is already a valid React element, return it directly
  if (isElement(icon)) {
    return icon;
  }

  // If icon is a valid React component type, instantiate it
  if (isValidElementType(icon)) {
    const IconComponent = icon as React.ComponentType;
    return <IconComponent />;
  }

  // For any other case, return null
  return null;
}
