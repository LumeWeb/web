import { r as reactExports, j as jsxRuntimeExports } from "./jsx-runtime-IZdvEyt_.js";
import { R as Root } from "./input-B6UnxZyR.js";
import { c as cn, a as cva } from "./button-CzfLTIHt.js";
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
