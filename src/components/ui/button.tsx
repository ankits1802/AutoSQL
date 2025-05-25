
'use client';

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  // Base classes: REMOVED rounded-lg from here
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95 shadow-sm hover:shadow-md [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: // Mapped from user's "primary"
          "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg",
        destructive: // Mapped from user's "danger"
          "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 dark:bg-red-500 dark:hover:bg-red-600 rounded-lg",
          outline:
          "bg-transparent border border-gray-500 text-gray-800 hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 dark:text-gray-300 dark:border-gray-400 dark:hover:bg-gray-700/50 dark:focus:ring-gray-400 rounded-lg",
        
        secondary:
          "bg-gray-100/40 border border-gray-500 text-black hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 dark:bg-white/20 dark:hover:bg-white/30 dark:text-white dark:border-white/30 rounded-lg",
        
        ghost: "hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring shadow-none hover:shadow-none rounded-lg",
        link: "text-primary underline-offset-4 hover:underline focus-visible:ring-ring shadow-none hover:shadow-none rounded-lg", // Links typically don't have rounding, but for consistency with other buttons if used as such.
        success:
          "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 dark:bg-green-500 dark:hover:bg-green-600 rounded-lg",
        warning:
          "bg-yellow-500 text-black hover:bg-yellow-600 focus:ring-yellow-400 dark:bg-yellow-400 dark:text-black dark:hover:bg-yellow-500 rounded-lg",
        info:
          "bg-cyan-600 text-white hover:bg-cyan-700 focus:ring-cyan-500 dark:bg-cyan-500 dark:hover:bg-cyan-600 rounded-lg",
      },
      size: {
        default: "h-10 px-4 py-2.5 rounded-lg", // Explicitly add rounded-lg here too
        sm: "h-9 px-3 rounded-lg",
        lg: "h-11 px-8 rounded-lg",
        icon: "h-10 w-10 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
