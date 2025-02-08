import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import PropTypes from "prop-types";

import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    defaultVariants: {
      size: "default",
      variant: "default",
    },
    variants: {
      size: {
        default: "h-9 px-4 py-2",
        icon: "h-9 w-9",
        lg: "h-16 rounded-md",
        sm: "h-8 rounded-md px-3 text-xs",
      },
      variant: {
        // TODO: name it better
        accent: "bg-ring text-primary-1-foreground hover:bg-ring/75 font-bold",
        default: "bg-secondary text-foreground hover:bg-secondary/60",
        destructive:
          "bg-destructive text-white shadow-sm hover:bg-destructive/90",
        ghost:
          "hover:bg-secondary hover:text-secondary-foreground text-muted-foreground",
        link: "text-secondary underline-offset-4 hover:underline",
        outline:
          "border border-secondary bg-background shadow-sm hover:bg-muted/20",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
      },
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ asChild = false, className, size, variant, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ className, size, variant }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

Button.propTypes = {
  asChild: PropTypes.bool,
  className: PropTypes.string,
  size: PropTypes.string,
  variant: PropTypes.string,
};

export { Button, buttonVariants };
