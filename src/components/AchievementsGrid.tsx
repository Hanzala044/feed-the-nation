import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AchievementCard } from "@/components/AchievementCard";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, TrendingUp, Zap, Sparkles, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  user_type: string;
  unlocked?: boolean;
  unlocked_at?: string;
  progress?: number;
  current_value?: number;
  target_value?: number;
}

interface UserStats {
  total_points: number;
  donations_completed: number;
  deliveries_completed: number;
  current_streak: number;
  longest_streak: number;
  lives_impacted: number;
  total_food_donated_kg?: number;
}

interface AchievementsGridProps {
  userId: string;
  userRole: 'donor' | 'volunteer';
}

export const AchievementsGrid = ({ userId, userRole }: AchievementsGridProps) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      const stats = await fetchUserStats();
      if (stats) {
        await fetchAchievements(stats);
      }
    };
    loadData();
  }, [userId, userRole]);

  const fetchUserStats = async (): Promise<UserStats | null> => {
    try {
      // Calculate stats directly from donations table
      let donations_completed = 0;
      let deliveries_completed = 0;
      let total_food_donated_kg = 0;

      // Count donations created by this user (for donors)
      if (userRole === 'donor') {
        const { count, error: donorError } = await supabase
          .from("donations")
          .select("*", { count: 'exact', head: true })
          .eq("donor_id", userId);

        if (!donorError && count !== null) {
          donations_completed = count;
        }

        // Sum total food donated
        const { data: donationsData } = await supabase
          .from("donations")
          .select("quantity")
          .eq("donor_id", userId);

        if (donationsData) {
          total_food_donated_kg = donationsData.reduce((sum, d) => sum + (d.quantity || 0), 0);
        }
      }

      // Count deliveries completed by this user (for volunteers)
      if (userRole === 'volunteer') {
        const { count, error: volunteerError } = await supabase
          .from("donations")
          .select("*", { count: 'exact', head: true })
          .eq("volunteer_id", userId)
          .eq("status", "delivered");

        if (!volunteerError && count !== null) {
          deliveries_completed = count;
        }
      }

      // Calculate total points: 10 per donation + 15 per delivery
      const total_points = (donations_completed * 10) + (deliveries_completed * 15);

      // Calculate lives impacted (1 person per 5kg of food)
      const lives_impacted = Math.max(1, Math.floor(total_food_donated_kg / 5));

      // Create stats object
      const stats: UserStats = {
        total_points,
        donations_completed,
        deliveries_completed,
        current_streak: 0,
        longest_streak: 0,
        total_food_donated_kg,
        lives_impacted,
      };

      // Set calculated stats
      setUserStats(stats);

      console.log('📊 Stats calculated:', {
        donations_completed,
        deliveries_completed,
        total_points,
        total_food_donated_kg,
        lives_impacted
      });

      return stats;

    } catch (error: any) {
      console.error("Error fetching user stats:", error);
      return null;
    }
  };

  const fetchAchievements = async (stats: UserStats) => {
    try {
      setLoading(true);

      // Fetch all achievements for the user's role
      const { data: allAchievements, error: achievementsError } = await supabase
        .from("achievements")
        .select("*")
        .in("user_type", [userRole, "both"])
        .order("points_required", { ascending: true });

      if (achievementsError) throw achievementsError;

      // Fetch user's unlocked achievements
      const { data: userAchievements, error: userAchievementsError } = await supabase
        .from("user_achievements")
        .select("achievement_id, unlocked_at, progress")
        .eq("user_id", userId);

      if (userAchievementsError) throw userAchievementsError;

      // Merge data and auto-unlock achievements
      const enrichedAchievements = allAchievements?.map((achievement) => {
        const userAchievement = userAchievements?.find(
          (ua) => ua.achievement_id === achievement.id
        );

        // Calculate progress based on achievement type
        let progress = 0;
        let current_value = 0;
        let target_value = achievement.points_required / 10; // Simplified calculation
        let shouldUnlock = false;

        if (stats) {
          if (achievement.category === "donation") {
            current_value = stats.donations_completed;
            target_value = achievement.points_required / 10;
            progress = Math.min(100, (current_value / target_value) * 100);
            shouldUnlock = current_value >= target_value;
          } else if (achievement.category === "delivery") {
            current_value = stats.deliveries_completed;
            target_value = achievement.points_required / 10;
            progress = Math.min(100, (current_value / target_value) * 100);
            shouldUnlock = current_value >= target_value;
          } else if (achievement.category === "special") {
            current_value = stats.total_points;
            target_value = achievement.points_required;
            progress = Math.min(100, (current_value / target_value) * 100);
            shouldUnlock = current_value >= target_value;
          } else if (achievement.category === "impact") {
            current_value = stats.lives_impacted;
            target_value = achievement.points_required / 2;
            progress = Math.min(100, (current_value / target_value) * 100);
            shouldUnlock = current_value >= target_value;
          }
        }

        // Auto-unlock achievement if criteria met and not already unlocked
        if (shouldUnlock && !userAchievement) {
          supabase
            .from("user_achievements")
            .insert({
              user_id: userId,
              achievement_id: achievement.id,
              progress: 100,
            })
            .then(() => {
              console.log('🏆 Achievement unlocked:', achievement.name);
            });
        }

        return {
          ...achievement,
          unlocked: !!userAchievement || shouldUnlock,
          unlocked_at: userAchievement?.unlocked_at || (shouldUnlock ? new Date().toISOString() : undefined),
          progress: (userAchievement || shouldUnlock) ? 100 : progress,
          current_value,
          target_value,
        };
      }) || [];

      setAchievements(enrichedAchievements);
    } catch (error: any) {
      toast({
        title: "Error loading achievements",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalPoints = userStats?.total_points || 0;

  const categories = [
    { id: "all", label: "All", icon: Trophy },
    { id: "donation", label: "Donations", icon: Star },
    { id: "delivery", label: "Deliveries", icon: TrendingUp },
    { id: "streak", label: "Streaks", icon: Zap },
    { id: "impact", label: "Impact", icon: Sparkles },
    { id: "special", label: "Special", icon: Trophy },
  ];

  const filteredAchievements =
    activeCategory === "all"
      ? achievements
      : achievements.filter((a) => a.category === activeCategory);

  const unlockedAchievements = filteredAchievements.filter((a) => a.unlocked);
  const lockedAchievements = filteredAchievements.filter((a) => !a.unlocked);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Trophy className="w-12 h-12 mx-auto mb-3 text-purple-500 animate-pulse" />
          <p className="text-slate-600 dark:text-slate-400">Loading achievements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4 bg-gradient-to-br from-purple-500/15 via-purple-400/10 to-transparent border-2 border-purple-200/60 dark:border-purple-500/40 backdrop-blur-sm">
          <div className="text-center">
            <Trophy className="w-8 h-8 mx-auto mb-2 text-purple-600 dark:text-purple-400" />
            <p className="text-2xl font-extrabold text-purple-600 dark:text-purple-400">
              {unlockedCount}
            </p>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
              Unlocked
            </p>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-yellow-500/15 via-yellow-400/10 to-transparent border-2 border-yellow-200/60 dark:border-yellow-500/40 backdrop-blur-sm">
          <div className="text-center">
            <Star className="w-8 h-8 mx-auto mb-2 text-yellow-600 dark:text-yellow-400 fill-yellow-600 dark:fill-yellow-400" />
            <p className="text-2xl font-extrabold text-yellow-600 dark:text-yellow-400">
              {totalPoints}
            </p>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
              Points
            </p>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-slate-500/15 via-slate-400/10 to-transparent border-2 border-slate-200/60 dark:border-slate-500/40 backdrop-blur-sm">
          <div className="text-center">
            <Lock className="w-8 h-8 mx-auto mb-2 text-slate-600 dark:text-slate-400" />
            <p className="text-2xl font-extrabold text-slate-600 dark:text-slate-400">
              {achievements.length - unlockedCount}
            </p>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
              Locked
            </p>
          </div>
        </Card>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((category) => {
          const Icon = category.icon;
          const isActive = activeCategory === category.id;
          return (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 font-semibold text-sm transition-all whitespace-nowrap ${
                isActive
                  ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white border-transparent shadow-lg"
                  : "bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-600"
              }`}
            >
              <Icon className="w-4 h-4" />
              {category.label}
            </button>
          );
        })}
      </div>

      {/* Achievements Tabs */}
      <Tabs defaultValue="unlocked" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-1.5 h-12 border border-slate-200/50 dark:border-slate-800/50">
          <TabsTrigger
            value="unlocked"
            className="rounded-xl text-sm font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
          >
            Unlocked ({unlockedAchievements.length})
          </TabsTrigger>
          <TabsTrigger
            value="locked"
            className="rounded-xl text-sm font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-500 data-[state=active]:to-slate-600 data-[state=active]:text-white"
          >
            Locked ({lockedAchievements.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="unlocked" className="space-y-4">
          {unlockedAchievements.length === 0 ? (
            <Card className="p-12 text-center border-2 border-dashed border-purple-300/60 dark:border-purple-500/50 bg-gradient-to-br from-purple-50/50 to-white dark:from-purple-950/20 dark:to-slate-800/80">
              <Trophy className="w-16 h-16 mx-auto mb-3 text-purple-400" />
              <p className="text-slate-600 dark:text-slate-300 font-semibold">
                No achievements unlocked yet
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                Start donating or delivering to unlock your first achievement!
              </p>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {unlockedAchievements.map((achievement) => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  showProgress={false}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="locked" className="space-y-4">
          {lockedAchievements.length === 0 ? (
            <Card className="p-12 text-center border-2 border-dashed border-yellow-300/60 dark:border-yellow-500/50 bg-gradient-to-br from-yellow-50/50 to-white dark:from-yellow-950/20 dark:to-slate-800/80">
              <Star className="w-16 h-16 mx-auto mb-3 text-yellow-500 fill-yellow-500" />
              <p className="text-slate-600 dark:text-slate-300 font-semibold">
                Amazing! You've unlocked everything! 🎉
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                You're a true champion of the community!
              </p>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {lockedAchievements.map((achievement) => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  showProgress={true}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
