import { EyeNoneIcon, EyeOpenIcon } from "@radix-ui/react-icons";
import * as React from "react";

import { cn } from "../../lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  after?: React.ReactNode;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, fullWidth, leftIcon, type, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState<boolean>(false);
    const [mask, setMask] = React.useState<boolean>(false);
    const toggleShowPassword = (e: React.KeyboardEvent | React.MouseEvent) => {
      // Handle keyboard events
      if ('key' in e) {
        if (![" ", "Enter"].includes(e.key)) {
          return;
        }
        // For keyboard events, toggle the state
        setShowPassword((show) => !show);
        setMask((mask) => !mask);
        return;
      }
      // For mouse events, we always toggle (no condition needed)
      setShowPassword((show) => !show);
      setMask((mask) => !mask);
    };
    return (
      <div className={`relative ${fullWidth ? "w-full" : ""}`}>
        {leftIcon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            {leftIcon}
          </div>
        )}
        <input
          className={cn(
            "bg-secondary border-input placeholder:text-input-placeholder focus-visible:ring-ring flex h-14 w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50",
            className,
            leftIcon && "pl-10",
          )}
          ref={ref}
          type={type && !mask ? type : "text"}
          {...props}
        />
        {type === "password" ? (
          <button
            className="text-ring absolute right-4 top-5"
            onClick={toggleShowPassword}
            onKeyDown={toggleShowPassword}
            type="button"
            aria-pressed={showPassword}
            aria-label={showPassword ? "Hide password" : "Show password"}>
            {showPassword ? <EyeOpenIcon /> : <EyeNoneIcon />}
          </button>
        ) : null}
        {props.after}
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input };
