import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BadgeIcon } from "@/components/BadgeIcon";
import { Trophy } from "lucide-react";

interface Achievement {
  id: string;
  name: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
}

interface UserAchievement {
  achievement_id: string;
  achievements: Achievement | null;
}

interface UnlockedBadgesProps {
  userId: string;
  userRole: 'donor' | 'volunteer';
  maxDisplay?: number;
}

export const UnlockedBadges = ({ userId, userRole, maxDisplay = 3 }: UnlockedBadgesProps) => {
  const [unlockedAchievements, setUnlockedAchievements] = useState<Achievement[]>([]);

  const fetchUnlockedBadges = useCallback(async () => {
    try {
      // Fetch user's unlocked achievements
      const { data: userAchievements } = await supabase
        .from("user_achievements")
        .select(`
          achievement_id,
          achievements (
            id,
            name,
            icon,
            tier
          )
        `)
        .eq("user_id", userId)
        .order("unlocked_at", { ascending: false });

      if (userAchievements) {
        const achievements = (userAchievements as UserAchievement[])
          .map((ua) => ua.achievements)
          .filter((a): a is Achievement => a !== null)
          .slice(0, maxDisplay);

        setUnlockedAchievements(achievements);
      }
    } catch (error) {
      console.error("Error fetching unlocked badges:", error);
    }
  }, [userId, maxDisplay]);

  useEffect(() => {
    fetchUnlockedBadges();
  }, [fetchUnlockedBadges]);

  if (unlockedAchievements.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-1">
      {unlockedAchievements.map((achievement, index) => (
        <div
          key={achievement.id}
          className="relative group"
          style={{ zIndex: unlockedAchievements.length - index }}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 dark:from-yellow-500 dark:to-yellow-700 flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-900 transform transition-transform hover:scale-110 hover:-translate-y-1">
            <BadgeIcon icon={achievement.icon} tier={achievement.tier} className="w-4 h-4" />
          </div>

          {/* Tooltip */}
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
            <div className="bg-slate-900 dark:bg-slate-800 text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap shadow-xl border border-slate-700">
              {achievement.name}
            </div>
          </div>
        </div>
      ))}

      {unlockedAchievements.length >= maxDisplay && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 dark:from-purple-500 dark:to-purple-700 flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-900">
          <Trophy className="w-4 h-4 text-white" />
        </div>
      )}
    </div>
  );
};
