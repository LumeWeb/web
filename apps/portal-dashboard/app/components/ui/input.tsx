import * as React from "react"

import { cn } from "~/utils"
import { EyeOpenIcon, EyeNoneIcon } from "@radix-ui/react-icons"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  fullWidth?: boolean,
  leftIcon?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, fullWidth, leftIcon, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState<boolean>(false)
    const [mask, setMask] = React.useState<boolean>(false)
    const toggleShowPassword = () => {
      setShowPassword((show) => !show)
      setMask((mask) => !mask)
    }
    return (
      <div className={`relative ${fullWidth ? "w-full" : ""}`}>
        {leftIcon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            {leftIcon}
          </div>
        )}
        <input
          type={type && !mask ? type : "text"}
          className={cn(
            "flex h-14 w-full rounded-md border border-input px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-input-placeholder focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
            className,
            leftIcon && "pl-10"
          )}
          ref={ref}
          {...props}
        />
        {type === "password" ? <button
          type="button"
          className="absolute right-4 top-5 text-ring"
          onClick={toggleShowPassword}
          onKeyDown={toggleShowPassword}
        >
          {showPassword ? <EyeOpenIcon /> : <EyeNoneIcon />}
        </button> : null}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
