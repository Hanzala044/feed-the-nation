import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:translate-y-px",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground font-semibold shadow-lg",
        destructive: "bg-destructive text-destructive-foreground",
        outline: "border border-border text-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        ghost: "hover:bg-primary/10 hover:text-primary backdrop-blur-sm hover:shadow-soft",
        link: "text-primary underline-offset-4 hover:underline hover:text-accent",
        glass: "glass-effect hover:bg-white/40 dark:hover:bg-white/10 hover:shadow-card",
        gradient: "bg-gradient-to-r from-primary via-accent to-primary text-primary-foreground shadow-glow",
        shiny: "shiny-button backdrop-blur-md font-bold text-base leading-tight text-black dark:text-white [&::before]:bg-white dark:[&::before]:bg-black",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-9 rounded-xl px-4 text-xs",
        lg: "h-16 rounded-3xl px-10 text-lg font-bold",
        icon: "h-12 w-12 rounded-2xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    const isShiny = variant === "shiny";
    return (
      <Comp 
        className={cn(buttonVariants({ variant, size, className }))} 
        ref={ref} 
        {...props}
      >
        {isShiny && !asChild ? <span className="relative z-10">{children}</span> : children}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
