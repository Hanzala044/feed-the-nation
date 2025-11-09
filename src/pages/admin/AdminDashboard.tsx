import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  Package,
  TrendingUp,
  MapPin,
  LogOut,
  Shield,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface AnalyticsData {
  area: string;
  total_donations: number;
  completed_donations: number;
  in_transit_donations: number;
  pending_donations: number;
  unique_donors: number;
  unique_volunteers: number;
}

interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
}

interface Donation {
  id: string;
  title: string;
  status: string;
  donor_id: string;
  volunteer_id?: string;
  created_at: string;
  pickup_city: string;
  urgency: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      // Check if user has admin role
      const { data: roleData, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .single();

      if (error || !roleData) {
        toast({
          title: "Access Denied",
          description: "You don't have admin privileges",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setIsAdmin(true);
      await fetchAllData();
    } catch (error) {
      console.error("Error checking admin access:", error);
      toast({
        title: "Error",
        description: "Failed to verify admin access",
        variant: "destructive",
      });
      navigate("/");
    }
  };

  const fetchAllData = async () => {
    try {
      // Fetch analytics using RPC
      const { data: analyticsData, error: analyticsError } = await supabase.rpc("get_donation_analytics");
      if (analyticsError) {
        console.error("Analytics error:", analyticsError);
      } else if (analyticsData) {
        setAnalytics(analyticsData);
      }

      // Fetch all users
      const { data: usersData, error: usersError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (usersError) {
        console.error("Users error:", usersError);
      } else if (usersData) {
        setUsers(usersData);
      }

      // Fetch all donations
      const { data: donationsData, error: donationsError } = await supabase
        .from("donations")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (donationsError) {
        console.error("Donations error:", donationsError);
      } else if (donationsData) {
        setDonations(donationsData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const totalDonations = donations.length;
  const completedDonations = donations.filter((d) => d.status === "completed").length;
  const inTransitDonations = donations.filter((d) => d.status === "in_transit").length;
  const pendingDonations = donations.filter((d) => d.status === "pending").length;
  const urgentDonations = donations.filter((d) => d.urgency === "urgent").length;
  
  const totalUsers = users.length;
  const totalDonors = users.filter((u) => u.role === "donor").length;
  const totalVolunteers = users.filter((u) => u.role === "volunteer").length;

  const completionRate = totalDonations > 0 ? (completedDonations / totalDonations) * 100 : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-warm flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-16 h-16 text-primary mx-auto mb-4 animate-spin" />
          <p className="text-foreground/60 text-lg">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gradient-warm">
      {/* Header */}
      <header className="bg-gradient-to-br from-primary/10 via-cream/30 to-primary/5 backdrop-blur-xl border-b border-primary/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-2xl">
                <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Admin Dashboard</h1>
                <p className="text-sm text-foreground/60">FOOD 4 U Management</p>
              </div>
            </div>
            <Button variant="glass" onClick={handleLogout} className="w-full sm:w-auto">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="glass-card p-4 sm:p-6 hover:shadow-glass transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-foreground/60 text-xs sm:text-sm font-medium">Total Users</p>
                <p className="text-2xl sm:text-3xl font-bold text-foreground mt-1">{totalUsers}</p>
                <div className="flex gap-2 mt-2 text-xs">
                  <span className="text-primary">Donors: {totalDonors}</span>
                  <span className="text-blue-500">Volunteers: {totalVolunteers}</span>
                </div>
              </div>
              <Users className="w-10 h-10 sm:w-12 sm:h-12 text-primary/40" />
            </div>
          </Card>

          <Card className="glass-card p-4 sm:p-6 hover:shadow-glass transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-foreground/60 text-xs sm:text-sm font-medium">Total Donations</p>
                <p className="text-2xl sm:text-3xl font-bold text-foreground mt-1">{totalDonations}</p>
                <div className="flex gap-2 mt-2 text-xs">
                  <span className="text-orange-500">Urgent: {urgentDonations}</span>
                </div>
              </div>
              <Package className="w-10 h-10 sm:w-12 sm:h-12 text-primary/40" />
            </div>
          </Card>

          <Card className="glass-card p-4 sm:p-6 hover:shadow-glass transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-foreground/60 text-xs sm:text-sm font-medium">Completion Rate</p>
                <p className="text-2xl sm:text-3xl font-bold text-green-600 mt-1">{completionRate.toFixed(1)}%</p>
                <Progress value={completionRate} className="mt-2 h-2" />
              </div>
              <TrendingUp className="w-10 h-10 sm:w-12 sm:h-12 text-green-500/40" />
            </div>
          </Card>

          <Card className="glass-card p-4 sm:p-6 hover:shadow-glass transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-foreground/60 text-xs sm:text-sm font-medium">Active Status</p>
                <div className="space-y-1 mt-2">
                  <div className="flex items-center gap-2 text-xs">
                    <Clock className="w-3 h-3 text-orange-500" />
                    <span>Pending: {pendingDonations}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Activity className="w-3 h-3 text-blue-500" />
                    <span>In Transit: {inTransitDonations}</span>
                  </div>
                </div>
              </div>
              <Activity className="w-10 h-10 sm:w-12 sm:h-12 text-blue-500/40" />
            </div>
          </Card>
        </div>

        {/* Detailed Tabs */}
        <Tabs defaultValue="analytics" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white/40 backdrop-blur-sm mb-6">
            <TabsTrigger value="analytics" className="text-xs sm:text-sm">
              <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Area </span>Analytics
            </TabsTrigger>
            <TabsTrigger value="users" className="text-xs sm:text-sm">
              <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="donations" className="text-xs sm:text-sm">
              <Package className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Donations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-4">
            <Card className="glass-card p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                Area-wise Analytics Report
              </h3>
              {analytics.length === 0 ? (
                <div className="text-center py-8 text-foreground/60">
                  <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-40" />
                  <p>No analytics data available yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {analytics.map((area) => (
                    <div
                      key={area.area}
                      className="bg-white/50 rounded-xl p-4 border border-primary/10 hover:bg-white/70 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-foreground text-base sm:text-lg">{area.area}</h4>
                        <Badge variant="secondary" className="rounded-xl">
                          {area.total_donations} Total
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 text-sm">
                        <div className="bg-white/50 p-3 rounded-lg">
                          <p className="text-foreground/60 text-xs mb-1">Total</p>
                          <p className="font-bold text-foreground text-lg">{area.total_donations}</p>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg">
                          <p className="text-green-600/60 text-xs mb-1 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Completed
                          </p>
                          <p className="font-bold text-green-600 text-lg">{area.completed_donations}</p>
                        </div>
                        <div className="bg-orange-50 p-3 rounded-lg">
                          <p className="text-orange-600/60 text-xs mb-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Pending
                          </p>
                          <p className="font-bold text-orange-600 text-lg">{area.pending_donations}</p>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-blue-600/60 text-xs mb-1 flex items-center gap-1">
                            <Activity className="w-3 h-3" />
                            In Transit
                          </p>
                          <p className="font-bold text-blue-600 text-lg">{area.in_transit_donations}</p>
                        </div>
                        <div className="bg-purple-50 p-3 rounded-lg">
                          <p className="text-purple-600/60 text-xs mb-1">Donors</p>
                          <p className="font-bold text-purple-600 text-lg">{area.unique_donors}</p>
                        </div>
                        <div className="bg-indigo-50 p-3 rounded-lg">
                          <p className="text-indigo-600/60 text-xs mb-1">Volunteers</p>
                          <p className="font-bold text-indigo-600 text-lg">{area.unique_volunteers}</p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-foreground/60 mb-1">
                          <span>Completion Progress</span>
                          <span>{area.total_donations > 0 ? ((area.completed_donations / area.total_donations) * 100).toFixed(0) : 0}%</span>
                        </div>
                        <Progress 
                          value={area.total_donations > 0 ? (area.completed_donations / area.total_donations) * 100 : 0} 
                          className="h-2"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card className="glass-card p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold text-foreground mb-4">All Users ({totalUsers})</h3>
              {users.length === 0 ? (
                <div className="text-center py-8 text-foreground/60">
                  <Users className="w-12 h-12 mx-auto mb-2 opacity-40" />
                  <p>No users found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="bg-white/50 rounded-xl p-4 border border-primary/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:bg-white/70 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">{user.full_name}</p>
                        <p className="text-sm text-foreground/60">{user.email}</p>
                        <p className="text-xs text-foreground/40 mt-1">
                          Joined: {new Date(user.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="secondary" className="rounded-xl capitalize">
                        {user.role}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="donations" className="space-y-4">
            <Card className="glass-card p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold text-foreground mb-4">All Donations ({totalDonations})</h3>
              {donations.length === 0 ? (
                <div className="text-center py-8 text-foreground/60">
                  <Package className="w-12 h-12 mx-auto mb-2 opacity-40" />
                  <p>No donations found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {donations.map((donation) => (
                    <div
                      key={donation.id}
                      className="bg-white/50 rounded-xl p-4 border border-primary/10 cursor-pointer hover:bg-white/70 transition-colors"
                      onClick={() => navigate(`/donation/${donation.id}`)}
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-foreground">{donation.title}</p>
                            {donation.urgency === "urgent" && (
                              <Badge variant="destructive" className="rounded-xl text-xs">
                                Urgent
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-foreground/60">
                            <MapPin className="w-3 h-3" />
                            <span>{donation.pickup_city}</span>
                          </div>
                          <p className="text-xs text-foreground/40 mt-1">
                            Created: {new Date(donation.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Badge 
                            variant={
                              donation.status === "completed" ? "default" : 
                              donation.status === "in_transit" ? "secondary" : 
                              "outline"
                            } 
                            className="rounded-xl capitalize"
                          >
                            {donation.status === "completed" && <CheckCircle className="w-3 h-3 mr-1" />}
                            {donation.status === "in_transit" && <Activity className="w-3 h-3 mr-1" />}
                            {donation.status === "pending" && <Clock className="w-3 h-3 mr-1" />}
                            {donation.status.replace("_", " ")}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
