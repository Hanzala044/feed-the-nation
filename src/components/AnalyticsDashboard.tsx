import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Users, Package, Award } from "lucide-react";

interface AnalyticsData {
  totalDonations: number;
  totalMeals: number;
  peopleHelped: number;
  wasteReduced: number;
  weeklyData: Array<{ name: string; donations: number }>;
  foodTypeData: Array<{ name: string; value: number }>;
}

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

export const AnalyticsDashboard = ({ userId, role }: { userId: string; role: string }) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const query = supabase
          .from("donations")
          .select("*");
        
        if (role === "donor") {
          query.eq("donor_id", userId);
        } else {
          query.eq("volunteer_id", userId);
        }

        const { data: donations } = await query;

        if (donations) {
          // Calculate total meals (assuming quantity represents meals)
          const totalMeals = donations.reduce((sum, d) => {
            const qty = parseInt(d.quantity) || 0;
            return sum + qty;
          }, 0);

          // Calculate weekly data (last 7 days)
          const weeklyData = Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i));
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            const dayStart = new Date(date.setHours(0, 0, 0, 0));
            const dayEnd = new Date(date.setHours(23, 59, 59, 999));
            
            const count = donations.filter(d => {
              const createdAt = new Date(d.created_at || '');
              return createdAt >= dayStart && createdAt <= dayEnd;
            }).length;

            return { name: dayName, donations: count };
          });

          // Calculate food type distribution
          const foodTypes: Record<string, number> = {};
          donations.forEach(d => {
            foodTypes[d.food_type] = (foodTypes[d.food_type] || 0) + 1;
          });

          const foodTypeData = Object.entries(foodTypes).map(([name, value]) => ({
            name,
            value
          }));

          setAnalytics({
            totalDonations: donations.length,
            totalMeals,
            peopleHelped: Math.floor(totalMeals * 1.5), // Estimate
            wasteReduced: Math.floor(totalMeals * 0.5), // kg estimate
            weeklyData,
            foodTypeData
          });
        }
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [userId, role]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
          <TrendingUp className="w-6 h-6 text-primary" />
        </div>
        <p className="text-muted-foreground font-medium">Loading analytics...</p>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4 bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-200/50 dark:border-orange-800/30 hover:shadow-lg hover:shadow-orange-500/10 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold">{analytics.totalDonations}</p>
              <p className="text-xs text-muted-foreground">Donations</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-200/50 dark:border-blue-800/30 hover:shadow-lg hover:shadow-blue-500/10 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold">{analytics.peopleHelped}</p>
              <p className="text-xs text-muted-foreground">People Fed</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-200/50 dark:border-green-800/30 hover:shadow-lg hover:shadow-green-500/10 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/30">
              <Award className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold">{analytics.totalMeals}</p>
              <p className="text-xs text-muted-foreground">Meals</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-200/50 dark:border-purple-800/30 hover:shadow-lg hover:shadow-purple-500/10 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold">{analytics.wasteReduced}kg</p>
              <p className="text-xs text-muted-foreground">Waste Saved</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Weekly Trend Chart */}
      <Card className="p-5 border-border/50 hover:shadow-lg transition-shadow">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-primary" />
          </div>
          <h3 className="font-semibold">Weekly Activity</h3>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={analytics.weeklyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '12px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
            />
            <Bar dataKey="donations" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ff6b35" />
                <stop offset="100%" stopColor="#ff8c42" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Food Type Distribution */}
      {analytics.foodTypeData.length > 0 && (
        <Card className="p-5 border-border/50 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Package className="w-4 h-4 text-primary" />
            </div>
            <h3 className="font-semibold">Food Types</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={analytics.foodTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={70}
                innerRadius={40}
                fill="#8884d8"
                dataKey="value"
                paddingAngle={3}
              >
                {analytics.foodTypeData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  );
};
