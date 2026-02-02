import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Define buttonVariants outside the component to ensure consistency across HMR
const buttonVariants = cva(
  "inline-flex rounded-full border border-transparent  text-[13px] lg:text-lg font-medium transition ease-in-out duration-300",
  {
    variants: {
      style: {
        default: "text-home-text bg-home-card-bg hover:bg-white hover:text-content-text",
        outline: "border border-home-text! text-home-text bg-transparent hover:bg-home-card-bg! hover:text-home-text hover:border-home-card-bg!",
        "outline-dark": "border border-content-text! text-content-text! bg-transparent hover:bg-content-text! hover:text-white! hover:border-content-text!",
        "btn-light": "bg-white! text-content-text! hover:bg-transparent! hover:text-white! border-white!",
        gray: "bg-content-section-gray text-content-text! hover:bg-home-card-bg! hover:text-white!",
        light: "bg-white text-content-text hover:bg-home-card-bg hover:text-white",
      },
      size: {
        sm: "py-2 px-6 text-[13px] leading-none",
        md: "py-[11px] px-4 lg:py-4 lg:px-6",
        lg: "text-xl",
      },
    },
    defaultVariants: {
      style: "default",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof buttonVariants> {
  label: string;
  url: string;
}

const Button = React.forwardRef<HTMLAnchorElement, ButtonProps>(
  ({ label, url, style, size, className, ...props }, ref) => {
    return (
      <a
        href={url}
        className={cn(buttonVariants({ style, size, className }))}
        ref={ref}
        {...props}
      >
        {label}
      </a>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };