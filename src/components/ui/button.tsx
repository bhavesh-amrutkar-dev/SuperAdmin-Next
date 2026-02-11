import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/src/lib/utils";


// Updated button variants to match visual styles in image
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Primary: Solid blue button
        default: "bg-blue-600 text-white hover:bg-blue-700",

        // Secondary: Outline blue button
        secondary: "border border-blue-600 text-blue-600 hover:bg-blue-50",

        // Ghost: Text-only button with hover underline
        ghost: "text-blue-600 hover:underline",

        // Destructive: Solid red button
        destructive: "bg-red-500 text-white hover:bg-red-600",

        // Outline destructive: Red border only
        destructiveOutline:
          "border border-red-500 text-red-500 hover:bg-red-50",

        // Icon (used in combination with default/secondary)
        outline: "border border-blue-600 text-blue-600 hover:bg-blue-50",

        // Link: like ghost but underlined
        link: "text-blue-600 underline hover:text-blue-800",
        // Ghost: Text-only 
        onlyText: "text-blue-600",


      },
      size: {
        sm: "h-8 px-3 text-sm",      // Small
        default: "h-10 px-4 text-sm", // Default
        lg: "h-12 px-6 text-base",    // Large
        icon: "h-10 w-10",            // Icon-only
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };