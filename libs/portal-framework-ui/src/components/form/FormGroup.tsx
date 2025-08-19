import { cn } from "@lumeweb/portal-framework-ui-core";
import React from "react";

interface FormGroupProps {
  children: React.ReactNode;
  className?: string;
  description?: string;
  title?: string;
}

export const FormGroup = ({
  children,
  className,
  description,
  title,
}: FormGroupProps) => {
  return (
    <div className={cn(className)}>
      {title || description ? (
        <>
          {title && <h3 className="text-lg font-medium">{title}</h3>}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
          <div className="space-y-4">{children}</div>
        </>
      ) : (
        children
      )}
    </div>
  );
};
