import { r as reactExports, j as jsxRuntimeExports } from "./index-DVnsepjX.js";
import { c as cn, a as cva, b as $5e63c961fc1ce211$export$8c6ed5c666ac1360 } from "./utils-C-v9UY8N.js";
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/50",
        // TODO: name it better
        accent: "bg-ring text-primary-1-foreground hover:bg-ring/75 font-bold",
        destructive: "bg-destructive text-white shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-background shadow-sm hover:bg-primary-2/5",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-secondary-1 hover:text-secondary-1-foreground text-primary-2",
        link: "text-primary-1 underline-offset-4 hover:underline"
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-16 rounded-md",
        icon: "h-9 w-9"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
const Button = reactExports.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? $5e63c961fc1ce211$export$8c6ed5c666ac1360 : "button";
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Comp,
      {
        className: cn(buttonVariants({ variant, size, className })),
        ref,
        ...props
      }
    );
  }
);
Button.displayName = "Button";
export {
  Button as B
};
