import * as React from "react"
import { cn } from "@/src/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          `
          w-full h-[44px] rounded-lg border !border-[#2f2f2f]
          px-4 text-sm
          placeholder:text-muted-foreground
          transition-colors duration-200
          focus:outline-none focus:!border-[#f3c200]
          disabled:opacity-50 disabled:cursor-not-allowed
          `,
          error
            ? "border-red-500 focus:ring-red-200 focus:border-red-500"
            : "border-gray-300 hover:border-gray-400",
          className
        )}
        {...props}
      />
    )
  }
)

Input.displayName = "Input"

export { Input }
