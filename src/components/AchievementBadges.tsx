import { memo, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Zap, Heart, Star, Award, Target } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Achievement = Database["public"]["Tables"]["achievements"]["Row"];

const ACHIEVEMENT_ICONS: Record<string, any> = {
  first_donation: Trophy,
  streak_7: Zap,
  donations_10: Heart,
  donations_50: Star,
  donations_100: Award,
  impact_milestone: Target,
};

export const AchievementBadges = memo(({ userId }: { userId: string }) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const { data } = await supabase
          .from("achievements")
          .select("*")
          .eq("user_id", userId)
          .order("earned_at", { ascending: false });

        if (data) {
          setAchievements(data);
        }
      } catch (error) {
        console.error("Error fetching achievements:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, [userId]);

  if (loading) {
    return <div className="text-center text-muted-foreground">Loading achievements...</div>;
  }

  if (achievements.length === 0) {
    return (
      <Card className="p-6 text-center">
        <Trophy className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
        <p className="text-muted-foreground">No achievements yet</p>
        <p className="text-xs text-muted-foreground mt-1">
          Keep contributing to unlock badges!
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Achievements</h3>
        <Badge variant="secondary" className="ml-auto">
          {achievements.length}
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {achievements.map((achievement) => {
          const Icon = ACHIEVEMENT_ICONS[achievement.achievement_type] || Award;
          
          return (
            <div
              key={achievement.id}
              className="flex flex-col items-center p-3 rounded-xl bg-primary/10 border border-primary/20"
            >
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-2">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <p className="text-xs font-medium text-center leading-tight">
                {achievement.achievement_name}
              </p>
            </div>
          );
        })}
      </div>
    </Card>
  );
});
AchievementBadges.displayName = "AchievementBadges";
