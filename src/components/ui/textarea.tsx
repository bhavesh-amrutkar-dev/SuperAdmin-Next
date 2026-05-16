import * as React from "react"
import { cn } from "@/src/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          `
          w-full rounded-lg border bg-background
          px-4 py-2 text-sm
          transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-yellow-200 focus:border-[#f3c200]
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

Textarea.displayName = "Textarea"

export { Textarea }
