import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/src/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-all duration-200 ease-in-out cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-r from-[#FECB02] to-[#FFD84D] text-black shadow-md hover:from-[#FFD84D] hover:to-[#FECB02] hover:shadow-lg active:scale-[0.98]",

        dark:
          "bg-white/10 text-white backdrop-blur-sm border border-white/10 hover:bg-[#FECB02] hover:text-black hover:border-[#FECB02]",

        outline:
          "border border-[#FECB02] text-[#FECB02] hover:bg-[#FECB02] hover:text-black",

        ghost:
          "text-gray-600 hover:bg-[#FECB02]/10 hover:text-black",

        destructive:
          "bg-red-600 text-white hover:bg-red-700",

        destructiveOutline:
          "border border-red-600 text-red-600 hover:bg-red-50",

        logout:
          "w-full justify-start text-red-500 hover:bg-[#FECB02] hover:text-black",

        dropdown:
          "w-full justify-start text-gray-800 hover:bg-[#FECB02] hover:text-black",

      },
      size: {
        sm: "h-8 px-3 text-sm",
        default: "h-10 px-4",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
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