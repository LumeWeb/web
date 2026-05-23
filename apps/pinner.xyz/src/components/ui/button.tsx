import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { appendUTMsToURL } from "@/lib/utm";
import { config } from "@/lib/config";

// Define buttonVariants outside the component to ensure consistency across HMR
const buttonVariants = cva(
  "inline-flex rounded-full border border-transparent  text-[13px] lg:text-lg font-medium transition ease-in-out duration-300",
  {
    variants: {
      buttonStyle: {
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
      buttonStyle: "default",
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
  ({ label, url, buttonStyle, size, className, target, ...props }, ref) => {
    const finalUrl = React.useMemo(() => {
      try {
        const parsed = new URL(url, window.location.origin);
        if (parsed.hostname === new URL(config.portalApiUrl).hostname) {
          return appendUTMsToURL(url);
        }
      } catch {}
      return url;
    }, [url]);

    return (
      <a
        href={finalUrl}
        className={cn(buttonVariants({ buttonStyle, size, className }))}
        ref={ref}
        target={target}
        rel={target === "_blank" ? "noopener noreferrer" : undefined}
        {...props}
      >
        {label}
      </a>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };