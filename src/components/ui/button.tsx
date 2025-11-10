import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-glow hover:shadow-[0_15px_50px_hsla(262,83%,58%,0.5)] hover:scale-105 hover:brightness-110",
        destructive: "bg-gradient-to-r from-destructive to-red-600 text-destructive-foreground hover:shadow-[0_10px_40px_hsla(0,84%,60%,0.4)] hover:scale-105 shadow-soft",
        outline: "border-2 border-primary/30 bg-transparent hover:bg-primary/10 hover:border-primary hover:shadow-glow backdrop-blur-sm",
        secondary: "bg-secondary/80 text-secondary-foreground hover:bg-secondary hover:shadow-soft backdrop-blur-sm",
        ghost: "hover:bg-primary/10 hover:text-primary backdrop-blur-sm hover:shadow-soft",
        link: "text-primary underline-offset-4 hover:underline hover:text-accent",
        glass: "glass-effect hover:bg-white/40 dark:hover:bg-white/10 hover:shadow-card hover:scale-105",
        gradient: "bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] animate-gradient text-primary-foreground shadow-glow hover:shadow-[0_20px_60px_hsla(262,83%,58%,0.6)] hover:scale-105",
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
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
