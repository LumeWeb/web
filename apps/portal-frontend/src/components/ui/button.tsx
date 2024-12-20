import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Define buttonVariants outside the component to ensure consistency across HMR
const buttonVariants = cva(
  "inline-flex rounded-full border border-transparent  text-[13px] lg:text-lg font-medium transition ease-in-out duration-300",
  {
    variants: {
      style: {
        default: "text-[#F8F8F8] bg-[#0D2D2A] hover:bg-white hover:text-[#0D1D1C]",
        outline: "border !border-[#F8F8F8] text-[#f8f8f8] bg-transparent hover:!bg-[#0D2D2A] hover:text-[#F8F8F8] hover:!border-[#0D2D2A]",
        "outline-dark": "border !border-[#0D1D1C] !text-[#0D1D1C] bg-transparent hover:!bg-[#0D1D1C] hover:!text-white hover:!border-[#0D1D1C]",
        "btn-light": "!bg-white !text-[#0D1D1C] hover:!bg-transparent hover:!text-white !border-white",
        gray: "bg-[#E4E0D4] !text-[#0D1D1C] hover:!bg-[#0D2D2A] hover:!text-white",
        light: "bg-white text-[#0D1D1C] hover:bg-[#0D2D2A] hover:text-white",
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