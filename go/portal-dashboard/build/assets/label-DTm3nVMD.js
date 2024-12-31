import { r as reactExports, j as jsxRuntimeExports } from "./jsx-runtime-CzXAEjbZ.js";
import { R as Root } from "./input-Sza_mO8a.js";
import { b as cn, a as cva } from "./button-jedbwRXf.js";
const labelVariants = cva(
  "text-sm font-medium text-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
);
const Label = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Root,
  {
    ref,
    className: cn(labelVariants(), className),
    ...props
  }
));
Label.displayName = Root.displayName;
export {
  Label as L
};
