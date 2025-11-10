import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-glow hover:shadow-[0_8px_30px_hsla(262,83%,58%,0.4)] hover:scale-105",
        secondary: "border-transparent bg-secondary/80 text-secondary-foreground hover:bg-secondary backdrop-blur-sm",
        destructive: "border-transparent bg-gradient-to-r from-destructive to-red-600 text-destructive-foreground hover:shadow-[0_8px_30px_hsla(0,84%,60%,0.3)] hover:scale-105",
        outline: "text-foreground border-primary/30 hover:bg-primary/10 hover:border-primary backdrop-blur-sm",
        success: "border-transparent bg-success text-success-foreground hover:bg-success/80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
