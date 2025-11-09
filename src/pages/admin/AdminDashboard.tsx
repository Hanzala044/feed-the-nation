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
} from "lucide-react";

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
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate("/auth");
      return;
    }

    // Check if user has admin role
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (!roleData) {
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
  };

  const fetchAllData = async () => {
    try {
      // Fetch analytics
      const { data: analyticsData } = await supabase.rpc("get_donation_analytics");
      if (analyticsData) setAnalytics(analyticsData);

      // Fetch all users
      const { data: usersData } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (usersData) setUsers(usersData);

      // Fetch all donations
      const { data: donationsData } = await supabase
        .from("donations")
        .select("*")
        .order("created_at", { ascending: false });
      if (donationsData) setDonations(donationsData);
    } catch (error) {
      console.error("Error fetching data:", error);
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
  const totalUsers = users.length;
  const totalDonors = users.filter((u) => u.role === "donor").length;
  const totalVolunteers = users.filter((u) => u.role === "volunteer").length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-warm flex items-center justify-center">
        <p className="text-foreground/60">Loading admin dashboard...</p>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gradient-warm">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/10 via-cream/30 to-primary/5 backdrop-blur-xl border-b border-primary/10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            </div>
            <Button variant="glass" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-foreground/60 text-sm">Total Users</p>
                <p className="text-3xl font-bold text-foreground">{totalUsers}</p>
              </div>
              <Users className="w-12 h-12 text-primary/40" />
            </div>
          </Card>

          <Card className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-foreground/60 text-sm">Total Donations</p>
                <p className="text-3xl font-bold text-foreground">{totalDonations}</p>
              </div>
              <Package className="w-12 h-12 text-primary/40" />
            </div>
          </Card>

          <Card className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-foreground/60 text-sm">Completed</p>
                <p className="text-3xl font-bold text-foreground">{completedDonations}</p>
              </div>
              <TrendingUp className="w-12 h-12 text-green-500/40" />
            </div>
          </Card>

          <Card className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-foreground/60 text-sm">Volunteers</p>
                <p className="text-3xl font-bold text-foreground">{totalVolunteers}</p>
              </div>
              <Users className="w-12 h-12 text-blue-500/40" />
            </div>
          </Card>
        </div>

        {/* Detailed Tabs */}
        <Tabs defaultValue="analytics" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white/40 backdrop-blur-sm">
            <TabsTrigger value="analytics">Area Analytics</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="donations">Donations</TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-4">
            <Card className="glass-card p-6">
              <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Area-wise Report
              </h3>
              <div className="space-y-4">
                {analytics.map((area) => (
                  <div
                    key={area.area}
                    className="bg-white/50 rounded-xl p-4 border border-primary/10"
                  >
                    <h4 className="font-semibold text-foreground mb-2">{area.area}</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-foreground/60">Total</p>
                        <p className="font-bold text-foreground">{area.total_donations}</p>
                      </div>
                      <div>
                        <p className="text-foreground/60">Completed</p>
                        <p className="font-bold text-green-600">{area.completed_donations}</p>
                      </div>
                      <div>
                        <p className="text-foreground/60">Pending</p>
                        <p className="font-bold text-orange-600">{area.pending_donations}</p>
                      </div>
                      <div>
                        <p className="text-foreground/60">In Transit</p>
                        <p className="font-bold text-blue-600">{area.in_transit_donations}</p>
                      </div>
                      <div>
                        <p className="text-foreground/60">Donors</p>
                        <p className="font-bold text-foreground">{area.unique_donors}</p>
                      </div>
                      <div>
                        <p className="text-foreground/60">Volunteers</p>
                        <p className="font-bold text-foreground">{area.unique_volunteers}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card className="glass-card p-6">
              <h3 className="text-xl font-bold text-foreground mb-4">All Users</h3>
              <div className="space-y-3">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="bg-white/50 rounded-xl p-4 border border-primary/10 flex justify-between items-center"
                  >
                    <div>
                      <p className="font-semibold text-foreground">{user.full_name}</p>
                      <p className="text-sm text-foreground/60">{user.email}</p>
                    </div>
                    <Badge variant="secondary" className="rounded-xl">
                      {user.role}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="donations" className="space-y-4">
            <Card className="glass-card p-6">
              <h3 className="text-xl font-bold text-foreground mb-4">All Donations</h3>
              <div className="space-y-3">
                {donations.map((donation) => (
                  <div
                    key={donation.id}
                    className="bg-white/50 rounded-xl p-4 border border-primary/10 cursor-pointer hover:bg-white/70 transition-colors"
                    onClick={() => navigate(`/donation/${donation.id}`)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-foreground">{donation.title}</p>
                        <p className="text-sm text-foreground/60">{donation.pickup_city}</p>
                      </div>
                      <Badge variant="secondary" className="rounded-xl">
                        {donation.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
