import { r as reactExports, j as jsxRuntimeExports } from "./jsx-runtime-IZdvEyt_.js";
import { P as Primitive, k as EyeOpenIcon, l as EyeNoneIcon } from "./index-DiXcXsr5.js";
import { c as cn } from "./button-CzfLTIHt.js";
var NAME = "Label";
var Label = reactExports.forwardRef((props, forwardedRef) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Primitive.label,
    {
      ...props,
      ref: forwardedRef,
      onMouseDown: (event) => {
        var _a;
        const target = event.target;
        if (target.closest("button, input, select, textarea")) return;
        (_a = props.onMouseDown) == null ? void 0 : _a.call(props, event);
        if (!event.defaultPrevented && event.detail > 1) event.preventDefault();
      }
    }
  );
});
Label.displayName = NAME;
var Root = Label;
const Input = reactExports.forwardRef(
  ({ className, type, fullWidth, leftIcon, ...props }, ref) => {
    const [showPassword, setShowPassword] = reactExports.useState(false);
    const [mask, setMask] = reactExports.useState(false);
    const toggleShowPassword = () => {
      setShowPassword((show) => !show);
      setMask((mask2) => !mask2);
    };
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `relative ${fullWidth ? "w-full" : ""}`, children: [
      leftIcon && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute left-4 top-1/2 -translate-y-1/2", children: leftIcon }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          type: type && !mask ? type : "text",
          className: cn(
            "flex h-14 w-full bg-secondary rounded-md border border-input px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-input-placeholder focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
            className,
            leftIcon && "pl-10"
          ),
          ref,
          ...props
        }
      ),
      type === "password" ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          className: "absolute right-4 top-5 text-ring",
          onClick: toggleShowPassword,
          onKeyDown: toggleShowPassword,
          children: showPassword ? /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOpenIcon, {}) : /* @__PURE__ */ jsxRuntimeExports.jsx(EyeNoneIcon, {})
        }
      ) : null,
      props.after
    ] });
  }
);
Input.displayName = "Input";
export {
  Input as I,
  Label as L,
  Root as R
};
