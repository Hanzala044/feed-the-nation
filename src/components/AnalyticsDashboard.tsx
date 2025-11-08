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
    return <div className="text-center py-8 text-muted-foreground">Loading analytics...</div>;
  }

  if (!analytics) return null;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{analytics.totalDonations}</p>
              <p className="text-xs text-muted-foreground">Donations</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-chart-2/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-chart-2" />
            </div>
            <div>
              <p className="text-2xl font-bold">{analytics.peopleHelped}</p>
              <p className="text-xs text-muted-foreground">People Fed</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-chart-3/20 flex items-center justify-center">
              <Award className="w-5 h-5 text-chart-3" />
            </div>
            <div>
              <p className="text-2xl font-bold">{analytics.totalMeals}</p>
              <p className="text-xs text-muted-foreground">Meals</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-chart-4/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-chart-4" />
            </div>
            <div>
              <p className="text-2xl font-bold">{analytics.wasteReduced}kg</p>
              <p className="text-xs text-muted-foreground">Waste Saved</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Weekly Trend Chart */}
      <Card className="p-4">
        <h3 className="text-sm font-semibold mb-4">Weekly Activity</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={analytics.weeklyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Bar dataKey="donations" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Food Type Distribution */}
      {analytics.foodTypeData.length > 0 && (
        <Card className="p-4">
          <h3 className="text-sm font-semibold mb-4">Food Types</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={analytics.foodTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {analytics.foodTypeData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  );
};
