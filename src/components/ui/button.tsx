import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "rounded-lg hover:cursor-pointer inline-flex flex-nowrap flex-row justify-center items-center min-w-fit gap-2 transition-colors [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 disabled:bg-background disabled:text-text-dark-gray disabled:opacity-70 disabled:cursor-not-allowed disabled:border-gray",
  {
    variants: {
      variant: {
        default: "border border-primary bg-primary text-accent hover:bg-dark-primary",
        primary: "border border-primary bg-primary text-accent hover:bg-dark-primary",
        primaryOutline:
          "border border-primary text-dark-primary hover:bg-primary hover:text-accent",
        destructive: "bg-destructive text-destructive-foreground hover:opacity-90",
        outline: "border border-subtle text-gray-700 hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-gray-600 text-white hover:bg-gray-700",
        green: "border border-highlight-green bg-light-green text-dark-green",
        transparent: "bg-transparent text-dark-primary hover:bg-accent",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "px-5 py-3 font-semibold",
        md: "px-5 py-3 font-semibold",
        sm: "px-3 py-2 text-sm font-semibold",
        lg: "px-8 py-3 rounded-xl font-bold",
        icon: "size-10 p-0",
        "icon-sm": "size-8 p-0",
        "icon-lg": "size-12 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
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
