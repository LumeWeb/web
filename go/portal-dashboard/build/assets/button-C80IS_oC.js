import { r as reactExports, j as jsxRuntimeExports } from "./index-D_nKaDFf.js";
import { c as cn, a as cva, S as Slot } from "./utils-Cugm_gHJ.js";
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-secondary text-foreground hover:bg-secondary/60",
        // TODO: name it better
        accent: "bg-ring text-primary-1-foreground hover:bg-ring/75 font-bold",
        destructive: "bg-destructive text-white shadow-sm hover:bg-destructive/90",
        outline: "border border-secondary bg-background shadow-sm hover:bg-muted/20",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-secondary hover:text-secondary-foreground text-muted-foreground",
        link: "text-secondary underline-offset-4 hover:underline"
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
    const Comp = asChild ? Slot : "button";
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
