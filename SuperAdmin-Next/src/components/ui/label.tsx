import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/src/lib/utils"

const labelVariants = cva(
  "text-sm font-medium leading-none text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
  {
    variants: {
      error: {
        true: "text-red-500",
      },
    },
    defaultVariants: {
      error: false,
    },
  }
)

export interface LabelProps
  extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>,
    VariantProps<typeof labelVariants> {
  required?: boolean
}

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  LabelProps
>(({ className, error, required, children, ...props }, ref) => {
  return (
    <LabelPrimitive.Root
      ref={ref}
      className={cn(labelVariants({ error }), className)}
      {...props}
    >
      <span className="inline-flex items-center gap-1">
        {children}
        {required && (
          <span className="text-red-500" aria-hidden="true">
            *
          </span>
        )}
      </span>
    </LabelPrimitive.Root>
  )
})

Label.displayName = LabelPrimitive.Root.displayName

export { Label }
