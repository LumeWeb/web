import {
  Button,
  cn,
  buttonVariants,
} from "@lumeweb/portal-framework-ui-core";
import { type VariantProps } from "class-variance-authority";
import { ArrowRight } from "lucide-react";
import React, { type ButtonHTMLAttributes, type ReactNode } from "react";

export interface ReportButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  showArrow?: boolean;
  children?: ReactNode;
}

const ReportButton = React.forwardRef<HTMLButtonElement, ReportButtonProps>(
  (
    { className, showArrow = true, children, size = "default", variant = "default", ...props }: ReportButtonProps,
    ref,
  ) => {
    return (
      <Button
        className={cn(
          "group rounded-full bg-button hover:bg-button-hover text-foreground h-14 px-8",
          className,
        )}
        ref={ref}
        size={size}
        variant={variant}
        {...props}>
        {children}
        {showArrow && (
          <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
        )}
      </Button>
    );
  },
);


ReportButton.displayName = "ReportButton";

export { ReportButton };
