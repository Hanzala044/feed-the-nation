import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BadgeIcon } from "@/components/BadgeIcon";
import { Progress } from "@/components/ui/progress";
import {
  LucideIcon,
  Lock,
  Star,
  Award,
  Gift,
  Heart,
  Medal,
  Crown,
  Scale,
  TrendingUp,
  Mountain,
  Users,
  Shield,
  Flame,
  Zap,
  Package,
  Truck,
  CheckCircle,
  Target,
  Trophy,
  Rocket,
  Clock,
  AlertTriangle,
  Utensils,
  Sparkles,
  Gem,
  BadgeCheck,
  Handshake,
  Calendar,
  Sun,
  Moon,
  MapPin,
  Building,
  Route,
  Layers,
  Leaf,
  Package2,
  Timer
} from "lucide-react";
import { cn } from "@/lib/utils";

type BadgeTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

interface Achievement {
  id: string;
  code: string;
  name: string;
  description: string;
  tier: BadgeTier;
  icon: string;
  points_required: number;
  category: string;
  unlocked?: boolean;
  unlocked_at?: string;
  progress?: number;
  current_value?: number;
  target_value?: number;
}

interface AchievementCardProps {
  achievement: Achievement;
  size?: 'compact' | 'full';
  showProgress?: boolean;
}

const iconMap: Record<string, LucideIcon> = {
  Award,
  Gift,
  Heart,
  Medal,
  Crown,
  Scale,
  TrendingUp,
  Mountain,
  Users,
  Shield,
  Flame,
  Zap,
  Star,
  Package,
  Truck,
  CheckCircle,
  Target,
  Trophy,
  Rocket,
  Clock,
  AlertTriangle,
  Utensils,
  Sparkles,
  Gem,
  BadgeCheck,
  Handshake,
  Calendar,
  Sun,
  Moon,
  MapPin,
  Building,
  Route,
  Layers,
  Leaf,
  Package2,
  Timer
};

const tierColors: Record<BadgeTier, string> = {
  bronze: "text-orange-600 dark:text-orange-400",
  silver: "text-slate-500 dark:text-slate-300",
  gold: "text-yellow-600 dark:text-yellow-400",
  platinum: "text-purple-600 dark:text-purple-400",
  diamond: "text-pink-600 dark:text-pink-400",
};

const tierLabels: Record<BadgeTier, string> = {
  bronze: "Bronze",
  silver: "Silver",
  gold: "Gold",
  platinum: "Platinum",
  diamond: "Diamond",
};

export const AchievementCard = ({
  achievement,
  size = 'full',
  showProgress = true,
}: AchievementCardProps) => {
  const Icon = iconMap[achievement.icon] || Star;
  const progress = achievement.progress || 0;
  const isUnlocked = achievement.unlocked || false;

  if (size === 'compact') {
    return (
      <div
        className={cn(
          "relative p-3 rounded-2xl border-2 transition-all duration-300",
          isUnlocked
            ? "bg-white/95 dark:bg-slate-800/95 border-slate-200 dark:border-slate-700 hover:shadow-lg"
            : "bg-slate-50/50 dark:bg-slate-900/50 border-slate-300/50 dark:border-slate-800/50 opacity-60"
        )}
      >
        <div className="flex items-center gap-3">
          <BadgeIcon
            icon={Icon}
            tier={achievement.tier}
            size="sm"
            unlocked={isUnlocked}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {achievement.name}
              </h4>
              {!isUnlocked && <Lock className="w-3 h-3 text-slate-400" />}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {achievement.points_required} pts
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card
      className={cn(
        "relative overflow-hidden rounded-3xl border-2 transition-all duration-500",
        isUnlocked
          ? "bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-slate-200/60 dark:border-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/20"
          : "bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-sm border-slate-300/60 dark:border-slate-700/50 hover:shadow-lg"
      )}
    >
      {/* Decorative gradient overlay */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 h-24 opacity-10",
          isUnlocked
            ? "bg-gradient-to-br from-purple-400 via-purple-300 to-transparent"
            : "bg-gradient-to-br from-slate-400 via-slate-300 to-transparent"
        )}
      />

      {/* Unlocked date badge */}
      {isUnlocked && achievement.unlocked_at && (
        <div className="absolute top-4 right-4 z-10">
          <Badge className="bg-green-500/90 text-white border-0 px-3 py-1 text-xs font-bold">
            ✓ Unlocked
          </Badge>
        </div>
      )}

      {/* Locked indicator */}
      {!isUnlocked && (
        <div className="absolute top-4 right-4 z-10">
          <div className="w-8 h-8 rounded-full bg-slate-300 dark:bg-slate-700 flex items-center justify-center">
            <Lock className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          </div>
        </div>
      )}

      <div className="relative p-6">
        {/* Badge Icon */}
        <div className="flex justify-center mb-4">
          <BadgeIcon
            icon={Icon}
            tier={achievement.tier}
            size="lg"
            unlocked={isUnlocked}
          />
        </div>

        {/* Title and Tier */}
        <div className="text-center mb-3">
          <Badge
            variant="outline"
            className={cn(
              "mb-2 text-xs font-bold uppercase tracking-wider",
              tierColors[achievement.tier]
            )}
          >
            {tierLabels[achievement.tier]}
          </Badge>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            {achievement.name}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {achievement.description}
          </p>
        </div>

        {/* Points */}
        <div className="flex items-center justify-center gap-1 mb-4">
          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          <span className="text-lg font-bold text-slate-900 dark:text-white">
            {achievement.points_required}
          </span>
          <span className="text-sm text-slate-500 dark:text-slate-400">points</span>
        </div>

        {/* Progress Bar */}
        {showProgress && !isUnlocked && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
              <span>Progress</span>
              <span className="font-bold">
                {achievement.current_value || 0} / {achievement.target_value || 100}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-center text-slate-500 dark:text-slate-400">
              {100 - progress}% remaining
            </p>
          </div>
        )}

        {/* Unlocked date */}
        {isUnlocked && achievement.unlocked_at && (
          <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-4">
            Unlocked on {new Date(achievement.unlocked_at).toLocaleDateString()}
          </p>
        )}
      </div>
    </Card>
  );
};
