import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Trash2,
  Eye,
  Award,
  Star,
  Calendar,
  BarChart3,
  UserCheck,
  Gift,
  Search,
  Filter,
  RefreshCw,
  Lock,
  Mail,
  Phone,
  Home
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

// Static Admin Credentials
const ADMIN_EMAIL = "admin@food4u.com";
const ADMIN_PASSWORD = "admin123";

interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
  points?: number;
  badge?: string;
  phone?: string;
  address?: string;
}

interface Donation {
  id: string;
  title: string;
  description: string;
  status: string;
  donor_id: string;
  volunteer_id?: string;
  created_at: string;
  pickup_city: string;
  urgency: string;
  food_type: string;
  quantity: string;
  delivered_at?: string;
}

interface DailyStats {
  donations: number;
  activeVolunteers: number;
  activeDonors: number;
}

interface MonthlyStats {
  donations: number;
  activeVolunteers: number;
  newAccounts: number;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Data state
  const [users, setUsers] = useState<User[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Filter state
  const [userSearch, setUserSearch] = useState("");
  const [userFilter, setUserFilter] = useState("all");
  const [donationFilter, setDonationFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  // Dialog state
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [badgeDialogOpen, setBadgeDialogOpen] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: "user" | "donation"; id: string } | null>(null);

  // Check for saved auth on mount
  useEffect(() => {
    const savedAuth = sessionStorage.getItem("adminAuth");
    if (savedAuth === "true") {
      setIsAuthenticated(true);
      fetchAllData();
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (loginEmail === ADMIN_EMAIL && loginPassword === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem("adminAuth", "true");
      fetchAllData();
      toast({
        title: "Welcome Admin",
        description: "Successfully logged into admin dashboard",
      });
    } else {
      setLoginError("Invalid admin credentials");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("adminAuth");
    setLoginEmail("");
    setLoginPassword("");
    navigate("/");
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Fetch all users with their donation stats
      const { data: usersData } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (usersData) {
        // Calculate points for each user
        const usersWithPoints = await Promise.all(
          usersData.map(async (user) => {
            const { count: donationCount } = await supabase
              .from("donations")
              .select("*", { count: "exact", head: true })
              .or(`donor_id.eq.${user.id},volunteer_id.eq.${user.id}`)
              .eq("status", "delivered");

            const points = (donationCount || 0) * 10;
            let badge = "Newcomer";
            if (points >= 100) badge = "Gold";
            else if (points >= 50) badge = "Silver";
            else if (points >= 20) badge = "Bronze";

            return { ...user, points, badge };
          })
        );
        setUsers(usersWithPoints);
      }

      // Fetch all donations
      const { data: donationsData } = await supabase
        .from("donations")
        .select("*")
        .order("created_at", { ascending: false });

      if (donationsData) {
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

  const handleDeleteUser = async (userId: string) => {
    try {
      // Delete user's donations first
      await supabase.from("donations").delete().eq("donor_id", userId);

      // Delete user profile
      const { error } = await supabase.from("profiles").delete().eq("id", userId);

      if (error) throw error;

      setUsers(users.filter(u => u.id !== userId));
      setDeleteDialogOpen(false);
      setItemToDelete(null);

      toast({
        title: "User Deleted",
        description: "User account has been removed",
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  const handleDeleteDonation = async (donationId: string) => {
    try {
      const { error } = await supabase.from("donations").delete().eq("id", donationId);

      if (error) throw error;

      setDonations(donations.filter(d => d.id !== donationId));
      setDeleteDialogOpen(false);
      setItemToDelete(null);

      toast({
        title: "Donation Deleted",
        description: "Donation has been removed",
      });
    } catch (error) {
      console.error("Error deleting donation:", error);
      toast({
        title: "Error",
        description: "Failed to delete donation",
        variant: "destructive",
      });
    }
  };

  const handleAssignBadge = async () => {
    if (!selectedUser || !selectedBadge) return;

    // In a real app, you'd update this in the database
    setUsers(users.map(u =>
      u.id === selectedUser.id ? { ...u, badge: selectedBadge } : u
    ));

    setBadgeDialogOpen(false);
    setSelectedUser(null);
    setSelectedBadge("");

    toast({
      title: "Badge Assigned",
      description: `${selectedBadge} badge assigned to ${selectedUser.full_name}`,
    });
  };

  // Calculate statistics
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const dailyStats: DailyStats = {
    donations: donations.filter(d => new Date(d.created_at) >= today).length,
    activeVolunteers: new Set(
      donations
        .filter(d => new Date(d.created_at) >= today && d.volunteer_id)
        .map(d => d.volunteer_id)
    ).size,
    activeDonors: new Set(
      donations
        .filter(d => new Date(d.created_at) >= today)
        .map(d => d.donor_id)
    ).size,
  };

  const monthlyStats: MonthlyStats = {
    donations: donations.filter(d => new Date(d.created_at) >= thisMonth).length,
    activeVolunteers: new Set(
      donations
        .filter(d => new Date(d.created_at) >= thisMonth && d.volunteer_id)
        .map(d => d.volunteer_id)
    ).size,
    newAccounts: users.filter(u => new Date(u.created_at) >= thisMonth).length,
  };

  const totalDonations = donations.length;
  const completedDonations = donations.filter(d => d.status === "delivered").length;
  const pendingDonations = donations.filter(d => d.status === "pending").length;
  const inTransitDonations = donations.filter(d => d.status === "in_transit").length;

  const totalVolunteers = users.filter(u => u.role === "volunteer").length;
  const totalDonors = users.filter(u => u.role === "donor").length;

  const topVolunteer = users
    .filter(u => u.role === "volunteer")
    .sort((a, b) => (b.points || 0) - (a.points || 0))[0];

  const topDonor = users
    .filter(u => u.role === "donor")
    .sort((a, b) => (b.points || 0) - (a.points || 0))[0];

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name.toLowerCase().includes(userSearch.toLowerCase()) ||
                         user.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchesFilter = userFilter === "all" || user.role === userFilter;
    return matchesSearch && matchesFilter;
  });

  // Filter donations
  const filteredDonations = donations.filter(donation => {
    const matchesStatus = donationFilter === "all" || donation.status === donationFilter;

    let matchesDate = true;
    if (dateFilter === "today") {
      matchesDate = new Date(donation.created_at) >= today;
    } else if (dateFilter === "week") {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      matchesDate = new Date(donation.created_at) >= weekAgo;
    } else if (dateFilter === "month") {
      matchesDate = new Date(donation.created_at) >= thisMonth;
    }

    return matchesStatus && matchesDate;
  });

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
        <Card className="w-full max-w-md p-8 bg-white/10 backdrop-blur-xl border-white/20">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] flex items-center justify-center mx-auto mb-4 shadow-xl shadow-orange-500/20">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Admin Login</h1>
            <p className="text-white/60 text-sm mt-1">Feed The Nation Dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/80">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input
                  id="email"
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="admin@food4u.com"
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/80">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input
                  id="password"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40"
                  required
                />
              </div>
            </div>

            {loginError && (
              <div className="text-red-400 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {loginError}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] hover:from-[#ff8c42] hover:to-[#ff6b35] text-white rounded-xl font-semibold"
            >
              Login to Dashboard
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Button variant="ghost" onClick={() => navigate("/")} className="text-white/60 hover:text-white">
              Back to Home
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] flex items-center justify-center mx-auto mb-4 animate-pulse shadow-xl shadow-orange-500/20">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <p className="text-muted-foreground font-medium">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] flex items-center justify-center shadow-lg shadow-orange-500/20">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold">Admin Dashboard</h1>
                <p className="text-xs text-muted-foreground">Feed The Nation</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchAllData}
                className="rounded-xl gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="rounded-xl"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 rounded-2xl bg-muted/50 p-1 h-12 mb-6">
            <TabsTrigger value="overview" className="rounded-xl text-xs font-medium data-[state=active]:bg-background">
              <BarChart3 className="w-4 h-4 mr-1" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="volunteers" className="rounded-xl text-xs font-medium data-[state=active]:bg-background">
              <UserCheck className="w-4 h-4 mr-1" />
              Volunteers
            </TabsTrigger>
            <TabsTrigger value="donors" className="rounded-xl text-xs font-medium data-[state=active]:bg-background">
              <Gift className="w-4 h-4 mr-1" />
              Donors
            </TabsTrigger>
            <TabsTrigger value="donations" className="rounded-xl text-xs font-medium data-[state=active]:bg-background">
              <Package className="w-4 h-4 mr-1" />
              Donations
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Daily Stats */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Today's Statistics
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <Card className="p-4 bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-200/50">
                  <div className="text-center">
                    <Package className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{dailyStats.donations}</p>
                    <p className="text-xs text-muted-foreground">Donations</p>
                  </div>
                </Card>
                <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-200/50">
                  <div className="text-center">
                    <UserCheck className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{dailyStats.activeVolunteers}</p>
                    <p className="text-xs text-muted-foreground">Volunteers</p>
                  </div>
                </Card>
                <Card className="p-4 bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-200/50">
                  <div className="text-center">
                    <Gift className="w-6 h-6 text-green-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{dailyStats.activeDonors}</p>
                    <p className="text-xs text-muted-foreground">Donors</p>
                  </div>
                </Card>
              </div>
            </div>

            {/* Monthly Stats */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Monthly Statistics
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <Card className="p-4 border-border/50">
                  <p className="text-2xl font-bold">{monthlyStats.donations}</p>
                  <p className="text-xs text-muted-foreground">Monthly Donations</p>
                </Card>
                <Card className="p-4 border-border/50">
                  <p className="text-2xl font-bold">{monthlyStats.activeVolunteers}</p>
                  <p className="text-xs text-muted-foreground">Active Volunteers</p>
                </Card>
                <Card className="p-4 border-border/50">
                  <p className="text-2xl font-bold">{monthlyStats.newAccounts}</p>
                  <p className="text-xs text-muted-foreground">New Accounts</p>
                </Card>
              </div>
            </div>

            {/* Overall Stats */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Overall Statistics
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Card className="p-4 border-border/50">
                  <p className="text-2xl font-bold">{totalDonations}</p>
                  <p className="text-xs text-muted-foreground">Total Donations</p>
                </Card>
                <Card className="p-4 border-border/50">
                  <p className="text-2xl font-bold">{totalVolunteers}</p>
                  <p className="text-xs text-muted-foreground">Total Volunteers</p>
                </Card>
                <Card className="p-4 border-border/50">
                  <p className="text-2xl font-bold">{totalDonors}</p>
                  <p className="text-xs text-muted-foreground">Total Donors</p>
                </Card>
                <Card className="p-4 border-border/50">
                  <p className="text-2xl font-bold">{completedDonations}</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </Card>
              </div>
            </div>

            {/* Top Performers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4 border-border/50">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Award className="w-4 h-4 text-yellow-500" />
                  Top Volunteer
                </h3>
                {topVolunteer ? (
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <span className="text-lg font-bold text-blue-500">
                        {topVolunteer.full_name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{topVolunteer.full_name}</p>
                      <p className="text-sm text-muted-foreground">{topVolunteer.points} points</p>
                    </div>
                    <Badge className="ml-auto">{topVolunteer.badge}</Badge>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No volunteers yet</p>
                )}
              </Card>

              <Card className="p-4 border-border/50">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  Top Donor
                </h3>
                {topDonor ? (
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                      <span className="text-lg font-bold text-orange-500">
                        {topDonor.full_name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{topDonor.full_name}</p>
                      <p className="text-sm text-muted-foreground">{topDonor.points} points</p>
                    </div>
                    <Badge className="ml-auto">{topDonor.badge}</Badge>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No donors yet</p>
                )}
              </Card>
            </div>

            {/* Status Overview */}
            <Card className="p-4 border-border/50">
              <h3 className="font-semibold mb-4">Donation Status Distribution</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Pending</span>
                  <span className="font-medium">{pendingDonations}</span>
                </div>
                <Progress value={totalDonations > 0 ? (pendingDonations / totalDonations) * 100 : 0} className="h-2" />

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">In Transit</span>
                  <span className="font-medium">{inTransitDonations}</span>
                </div>
                <Progress value={totalDonations > 0 ? (inTransitDonations / totalDonations) * 100 : 0} className="h-2 bg-blue-100 [&>div]:bg-blue-500" />

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Completed</span>
                  <span className="font-medium">{completedDonations}</span>
                </div>
                <Progress value={totalDonations > 0 ? (completedDonations / totalDonations) * 100 : 0} className="h-2 bg-green-100 [&>div]:bg-green-500" />
              </div>
            </Card>
          </TabsContent>

          {/* Volunteers Tab */}
          <TabsContent value="volunteers" className="space-y-4">
            <div className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search volunteers..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="pl-10 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-3">
              {filteredUsers
                .filter(u => u.role === "volunteer")
                .map((user) => (
                  <Card key={user.id} className="p-4 border-border/50 hover:shadow-lg transition-all">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                          <span className="text-lg font-bold text-blue-500">
                            {user.full_name.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">{user.full_name}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </p>
                          {user.phone && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3" />
                              {user.phone}
                            </p>
                          )}
                          {user.address && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Home className="w-3 h-3" />
                              {user.address}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">{user.points} pts</Badge>
                            <Badge className="text-xs">{user.badge}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setSelectedUser(user);
                            setSelectedBadge(user.badge || "");
                            setBadgeDialogOpen(true);
                          }}
                          className="rounded-xl h-8 w-8"
                        >
                          <Award className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setItemToDelete({ type: "user", id: user.id });
                            setDeleteDialogOpen(true);
                          }}
                          className="rounded-xl h-8 w-8 text-destructive hover:bg-destructive hover:text-white"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                      Joined: {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </Card>
                ))}
            </div>
          </TabsContent>

          {/* Donors Tab */}
          <TabsContent value="donors" className="space-y-4">
            <div className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search donors..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="pl-10 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-3">
              {filteredUsers
                .filter(u => u.role === "donor")
                .map((user) => (
                  <Card key={user.id} className="p-4 border-border/50 hover:shadow-lg transition-all">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                          <span className="text-lg font-bold text-orange-500">
                            {user.full_name.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">{user.full_name}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </p>
                          {user.phone && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3" />
                              {user.phone}
                            </p>
                          )}
                          {user.address && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Home className="w-3 h-3" />
                              {user.address}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">{user.points} pts</Badge>
                            <Badge className="text-xs">{user.badge}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setItemToDelete({ type: "user", id: user.id });
                            setDeleteDialogOpen(true);
                          }}
                          className="rounded-xl h-8 w-8 text-destructive hover:bg-destructive hover:text-white"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                      Joined: {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </Card>
                ))}
            </div>
          </TabsContent>

          {/* Donations Tab */}
          <TabsContent value="donations" className="space-y-4">
            <div className="flex flex-wrap gap-2 mb-4">
              <Select value={donationFilter} onValueChange={setDonationFilter}>
                <SelectTrigger className="w-[140px] rounded-xl">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="in_transit">In Transit</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-[140px] rounded-xl">
                  <SelectValue placeholder="Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              {filteredDonations.map((donation) => (
                <Card key={donation.id} className="p-4 border-border/50 hover:shadow-lg transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold">{donation.title}</p>
                        {donation.urgency === "urgent" && (
                          <Badge variant="destructive" className="text-xs">Urgent</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {donation.pickup_city}
                        </span>
                        <span className="flex items-center gap-1">
                          <Package className="w-3 h-3" />
                          {donation.food_type}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        donation.status === "delivered" ? "default" :
                        donation.status === "in_transit" ? "secondary" : "outline"
                      } className="text-xs">
                        {donation.status.replace("_", " ")}
                      </Badge>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => navigate(`/donation/${donation.id}`)}
                        className="rounded-xl h-8 w-8"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setItemToDelete({ type: "donation", id: donation.id });
                          setDeleteDialogOpen(true);
                        }}
                        className="rounded-xl h-8 w-8 text-destructive hover:bg-destructive hover:text-white"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Created: {new Date(donation.created_at).toLocaleDateString()}
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Badge Assignment Dialog */}
      <Dialog open={badgeDialogOpen} onOpenChange={setBadgeDialogOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Assign Badge to {selectedUser?.full_name}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Select value={selectedBadge} onValueChange={setSelectedBadge}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Select badge" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Newcomer">Newcomer</SelectItem>
                <SelectItem value="Bronze">Bronze</SelectItem>
                <SelectItem value="Silver">Silver</SelectItem>
                <SelectItem value="Gold">Gold</SelectItem>
                <SelectItem value="Platinum">Platinum</SelectItem>
                <SelectItem value="Diamond">Diamond</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBadgeDialogOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button onClick={handleAssignBadge} className="rounded-xl bg-gradient-to-r from-[#ff6b35] to-[#ff8c42]">
              Assign Badge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Are you sure you want to delete this {itemToDelete?.type}? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (itemToDelete?.type === "user") {
                  handleDeleteUser(itemToDelete.id);
                } else if (itemToDelete?.type === "donation") {
                  handleDeleteDonation(itemToDelete.id);
                }
              }}
              className="rounded-xl"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
