import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface LeaderboardEntry {
  id: string;
  full_name: string;
  count: number;
  role: string;
}

export const Leaderboard = ({ type }: { type: "donor" | "volunteer" }) => {
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data: donations } = await supabase
          .from("donations")
          .select(`
            id,
            donor_id,
            volunteer_id,
            status,
            profiles!donations_donor_id_fkey (id, full_name, role),
            volunteer:profiles!donations_volunteer_id_fkey (id, full_name, role)
          `);

        if (donations) {
          const userCounts: Record<string, { name: string; count: number; role: string }> = {};

          donations.forEach((donation: any) => {
            if (type === "donor") {
              const profile = donation.profiles;
              if (profile) {
                const userId = profile.id;
                if (!userCounts[userId]) {
                  userCounts[userId] = { name: profile.full_name, count: 0, role: profile.role };
                }
                userCounts[userId].count++;
              }
            } else {
              const volunteer = donation.volunteer;
              if (volunteer && donation.status === "delivered") {
                const userId = volunteer.id;
                if (!userCounts[userId]) {
                  userCounts[userId] = { name: volunteer.full_name, count: 0, role: volunteer.role };
                }
                userCounts[userId].count++;
              }
            }
          });

          const leaderboardData = Object.entries(userCounts)
            .map(([id, data]) => ({
              id,
              full_name: data.name,
              count: data.count,
              role: data.role
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 3);

          setLeaders(leaderboardData);
        }
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [type]);

  const getIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 1:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 2:
        return <Award className="w-6 h-6 text-amber-700" />;
      default:
        return null;
    }
  };

  const getRankBadge = (index: number) => {
    const variants = ["default", "secondary", "outline"] as const;
    return variants[index] || "outline";
  };

  if (loading) {
    return <Card className="p-6 text-center text-muted-foreground">Loading leaderboard...</Card>;
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">
          Top {type === "donor" ? "Donors" : "Volunteers"}
        </h3>
      </div>

      <div className="space-y-4">
        {leaders.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">No data yet</p>
        ) : (
          leaders.map((leader, index) => (
            <div
              key={leader.id}
              className="flex items-center gap-4 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className="flex-shrink-0">
                {getIcon(index)}
              </div>
              
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                  {leader.full_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{leader.full_name}</p>
                <p className="text-xs text-muted-foreground">
                  {leader.count} {type === "donor" ? "donations" : "deliveries"}
                </p>
              </div>

              <Badge variant={getRankBadge(index)} className="flex-shrink-0">
                #{index + 1}
              </Badge>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};
