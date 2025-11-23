import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type BadgeTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

interface BadgeIconProps {
  icon: LucideIcon;
  tier: BadgeTier;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  unlocked?: boolean;
  className?: string;
}

const tierConfig: Record<BadgeTier, {
  gradient: string;
  shadow: string;
  glow: string;
  border: string;
}> = {
  bronze: {
    gradient: "from-orange-700 via-orange-600 to-orange-500",
    shadow: "shadow-orange-700/50",
    glow: "bg-orange-500/20",
    border: "border-orange-400",
  },
  silver: {
    gradient: "from-slate-400 via-slate-300 to-slate-200",
    shadow: "shadow-slate-400/50",
    glow: "bg-slate-300/20",
    border: "border-slate-300",
  },
  gold: {
    gradient: "from-yellow-600 via-yellow-500 to-yellow-400",
    shadow: "shadow-yellow-500/50",
    glow: "bg-yellow-500/20",
    border: "border-yellow-400",
  },
  platinum: {
    gradient: "from-cyan-400 via-blue-400 to-purple-500",
    shadow: "shadow-purple-500/50",
    glow: "bg-purple-500/20",
    border: "border-purple-400",
  },
  diamond: {
    gradient: "from-pink-400 via-purple-500 to-blue-600",
    shadow: "shadow-purple-600/60",
    glow: "bg-purple-500/30",
    border: "border-purple-500",
  },
};

const sizeConfig = {
  sm: {
    container: "w-12 h-12",
    icon: "w-6 h-6",
    glow: "-inset-1",
  },
  md: {
    container: "w-16 h-16",
    icon: "w-8 h-8",
    glow: "-inset-1.5",
  },
  lg: {
    container: "w-20 h-20",
    icon: "w-10 h-10",
    glow: "-inset-2",
  },
  xl: {
    container: "w-24 h-24",
    icon: "w-12 h-12",
    glow: "-inset-3",
  },
};

export const BadgeIcon = ({
  icon: Icon,
  tier,
  size = 'md',
  unlocked = true,
  className,
}: BadgeIconProps) => {
  const config = tierConfig[tier];
  const sizes = sizeConfig[size];

  if (!unlocked) {
    return (
      <div
        className={cn(
          "relative rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex items-center justify-center opacity-40",
          sizes.container,
          className
        )}
      >
        <Icon className={cn(sizes.icon, "text-slate-400 dark:text-slate-600")} />
      </div>
    );
  }

  return (
    <div className={cn("relative group", className)}>
      {/* Outer glow effect */}
      <div
        className={cn(
          "absolute rounded-2xl blur-xl opacity-60 group-hover:opacity-80 transition-opacity duration-300",
          sizes.glow,
          config.glow
        )}
      />

      {/* Badge container */}
      <div
        className={cn(
          "relative rounded-2xl border-2 flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-all duration-300 bg-gradient-to-br",
          sizes.container,
          config.gradient,
          config.shadow,
          config.border
        )}
      >
        {/* Inner shine effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/30 via-transparent to-transparent opacity-50" />

        {/* Icon */}
        <Icon
          className={cn(
            sizes.icon,
            "relative z-10 text-white drop-shadow-lg"
          )}
        />
      </div>

      {/* Sparkle animation for diamond tier */}
      {tier === 'diamond' && unlocked && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-ping opacity-75" />
      )}
    </div>
  );
};
