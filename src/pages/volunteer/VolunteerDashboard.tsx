import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { authClient } from "@/integrations/supabase/authClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useNotifications } from "@/hooks/useNotifications";
import {
  Package, LogOut, CheckCircle, BarChart3, MessageCircle, Bell, Eye, Check, Upload,
  Home, Newspaper, MapPin, Clock, ChevronRight, Sparkles, Trophy, TrendingUp,
  Calendar, Filter, Search, User, Settings
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SwipeableCard } from "@/components/SwipeableCard";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { Leaderboard } from "@/components/Leaderboard";
import { DonationTimeline } from "@/components/DonationTimeline";
import { DonationMessaging } from "@/components/DonationMessaging";
import { DonationFilters } from "@/components/DonationFilters";
import { AchievementBadges } from "@/components/AchievementBadges";
import { DeliveryProofUpload } from "@/components/DeliveryProofUpload";
import type { Database } from "@/integrations/supabase/types";
import logo from "@/assets/logo.svg";

type Donation = Database["public"]["Tables"]["donations"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

const VolunteerDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [filteredDonations, setFilteredDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [uploadProofDonation, setUploadProofDonation] = useState<Donation | null>(null);
  const [activeTab, setActiveTab] = useState("available");
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    foodType: "all",
    status: "all",
    urgency: "all",
    sortBy: "newest",
  });
  const [lastDonationCount, setLastDonationCount] = useState(0);

  const { notificationsEnabled, requestPermission, sendNotification } = useNotifications(profile?.id);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { session } } = await authClient.auth.getSession();
        if (!session) {
          navigate("/auth");
          return;
        }

        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (profileData?.role !== "volunteer") {
          navigate("/donor/dashboard");
          return;
        }

        setProfile(profileData);

        const { data: donationsData } = await supabase
          .from("donations")
          .select("*")
          .order("created_at", { ascending: false });

        if (donationsData) {
          // Check for new donations and send notification
          const pendingDonations = donationsData.filter(d => d.status === "pending");
          if (lastDonationCount > 0 && pendingDonations.length > lastDonationCount) {
            const newDonation = pendingDonations[0];
            sendNotification(
              "🍽️ New Donation Available!",
              `${newDonation.title} needs pickup - ${newDonation.urgency === "urgent" ? "⚡ URGENT" : "📦"}`
            );
          }
          setLastDonationCount(pendingDonations.length);
          setDonations(donationsData);
          setFilteredDonations(donationsData);
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Poll for new donations every 30 seconds instead of realtime
    const pollInterval = setInterval(() => {
      fetchData();
    }, 30000);

    return () => {
      clearInterval(pollInterval);
    };
  }, [navigate, toast]);

  useEffect(() => {
    let result = [...donations];

    if (filters.search || searchQuery) {
      const query = (filters.search || searchQuery).toLowerCase();
      result = result.filter(
        (d) =>
          d.title.toLowerCase().includes(query) ||
          d.description.toLowerCase().includes(query) ||
          d.pickup_city.toLowerCase().includes(query)
      );
    }

    if (filters.foodType !== "all") {
      result = result.filter((d) => d.food_type === filters.foodType);
    }

    if (filters.status !== "all") {
      result = result.filter((d) => d.status === filters.status);
    }

    if (filters.urgency !== "all") {
      result = result.filter((d) => d.urgency === filters.urgency);
    }

    switch (filters.sortBy) {
      case "newest":
        result.sort((a, b) => new Date(b.created_at || "").getTime() - new Date(a.created_at || "").getTime());
        break;
      case "oldest":
        result.sort((a, b) => new Date(a.created_at || "").getTime() - new Date(b.created_at || "").getTime());
        break;
      case "expiry":
        result.sort((a, b) => new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime());
        break;
      case "quantity":
        result.sort((a, b) => parseInt(b.quantity) - parseInt(a.quantity));
        break;
    }

    setFilteredDonations(result);
  }, [donations, filters, searchQuery]);

  const handleSignOut = async () => {
    await authClient.auth.signOut();
    navigate("/");
  };

  const handleAccept = async (id: string) => {
    try {
      const { data: { session } } = await authClient.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from("donations")
        .update({ status: "accepted", volunteer_id: session.user.id })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Donation accepted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const updates: any = { status };
      if (status === "in_transit") {
        updates.picked_up_at = new Date().toISOString();
      } else if (status === "delivered") {
        updates.delivered_at = new Date().toISOString();
      }

      const { error } = await supabase.from("donations").update(updates).eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Status updated to ${status.replace("_", " ")}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const pendingDonations = filteredDonations.filter(d => d.status === "pending");
  const myAcceptedDonations = filteredDonations.filter(
    d => d.volunteer_id === profile?.id && d.status !== "pending" && d.status !== "delivered"
  );
  const completedDonations = filteredDonations.filter(
    d => d.volunteer_id === profile?.id && d.status === "delivered"
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 pb-24">
      {/* Premium Header */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
        <div className="px-6 py-4 max-w-lg mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img src={logo} alt="Logo" className="w-12 h-12 rounded-2xl shadow-lg" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-slate-950" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                  Hey, {profile?.full_name?.split(" ")[0]}!
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Volunteer
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!notificationsEnabled && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={requestPermission}
                  className="rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Bell className="w-5 h-5" />
                </Button>
              )}
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/volunteer/edit-profile")}
                className="rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <User className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                className="rounded-xl hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6 max-w-lg mx-auto">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/50 dark:to-blue-900/30 border-blue-200/50 dark:border-blue-800/50">
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-2">
                <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                {pendingDonations.length}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Available</span>
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/50 dark:to-amber-900/30 border-amber-200/50 dark:border-amber-800/50">
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center mb-2">
                <TrendingUp className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                {myAcceptedDonations.length}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Active</span>
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/50 dark:to-green-900/30 border-green-200/50 dark:border-green-800/50">
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center mb-2">
                <Trophy className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                {completedDonations.length}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Completed</span>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-5 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-2xl">
            <TabsTrigger value="available" className="rounded-xl text-xs font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm">
              Available
            </TabsTrigger>
            <TabsTrigger value="my-donations" className="rounded-xl text-xs font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm">
              Active
            </TabsTrigger>
            <TabsTrigger value="completed" className="rounded-xl text-xs font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm">
              Past
            </TabsTrigger>
            <TabsTrigger value="analytics" className="rounded-xl text-xs font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm">
              <BarChart3 className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="community" className="rounded-xl text-xs font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm">
              Community
            </TabsTrigger>
          </TabsList>

          {/* Available Donations Tab */}
          <TabsContent value="available" className="space-y-4 mt-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search donations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 h-12 bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <DonationFilters filters={filters} onFiltersChange={setFilters} />

            {pendingDonations.length === 0 ? (
              <Card className="p-12 text-center bg-white dark:bg-slate-800/50 border-dashed border-2 border-slate-200 dark:border-slate-700 rounded-3xl">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">No donations available</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {donations.filter(d => d.status === "pending").length === 0
                    ? "Check back later for new donations"
                    : "Try adjusting your filters"}
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                {pendingDonations.map((donation) => (
                  <SwipeableCard
                    key={donation.id}
                    onSwipeRight={() => handleAccept(donation.id)}
                    rightAction={<Check className="w-6 h-6" />}
                    leftAction={null}
                  >
                    <Card className="p-4 bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-primary/50 hover:shadow-lg transition-all duration-300 rounded-2xl cursor-pointer group">
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                          <Package className="w-7 h-7 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                                {donation.title}
                              </h3>
                              <div className="flex items-center gap-2 mt-1">
                                {donation.urgency === "urgent" && (
                                  <Badge variant="destructive" className="text-[10px] px-2 py-0 rounded-full">
                                    Urgent
                                  </Badge>
                                )}
                                <Badge variant="secondary" className="text-[10px] px-2 py-0 rounded-full bg-slate-100 dark:bg-slate-700">
                                  {donation.food_type}
                                </Badge>
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                          </div>
                          <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1 mb-3">
                            {donation.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-slate-400">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {donation.pickup_city}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {donation.pickup_time}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                        <Button
                          onClick={() => navigate(`/donation/${donation.id}`)}
                          variant="outline"
                          size="sm"
                          className="flex-1 rounded-xl h-10 text-sm"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Details
                        </Button>
                        <Button
                          onClick={() => handleAccept(donation.id)}
                          size="sm"
                          className="flex-1 rounded-xl h-10 text-sm bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Accept
                        </Button>
                      </div>
                    </Card>
                  </SwipeableCard>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Active Donations Tab */}
          <TabsContent value="my-donations" className="space-y-3 mt-4">
            {myAcceptedDonations.length === 0 ? (
              <Card className="p-12 text-center bg-white dark:bg-slate-800/50 border-dashed border-2 border-slate-200 dark:border-slate-700 rounded-3xl">
                <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-amber-500" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">No active pickups</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Accept a donation to get started
                </p>
              </Card>
            ) : (
              myAcceptedDonations.map((donation) => (
                <SwipeableCard
                  key={donation.id}
                  onSwipeRight={() => {
                    if (donation.status === "accepted") {
                      handleUpdateStatus(donation.id, "in_transit");
                    } else if (donation.status === "in_transit") {
                      handleUpdateStatus(donation.id, "delivered");
                    }
                  }}
                  rightAction={<Check className="w-6 h-6" />}
                  leftAction={null}
                  disabled={donation.status === "delivered"}
                >
                  <Card className="p-4 bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 rounded-2xl">
                    <div className="flex gap-4 mb-4">
                      <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/30 dark:to-amber-800/20 flex items-center justify-center">
                        <Package className="w-7 h-7 text-amber-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <h3 className="font-semibold text-slate-900 dark:text-white">{donation.title}</h3>
                          <Badge className="rounded-full text-[10px] px-2">
                            {donation.status.replace("_", " ")}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {donation.pickup_city}
                        </p>
                      </div>
                    </div>

                    <DonationTimeline
                      status={donation.status}
                      createdAt={donation.created_at || ""}
                      pickedUpAt={donation.picked_up_at}
                      deliveredAt={donation.delivered_at}
                    />

                    <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                      {donation.status === "accepted" && (
                        <Button
                          onClick={() => handleUpdateStatus(donation.id, "in_transit")}
                          variant="outline"
                          size="sm"
                          className="flex-1 rounded-xl h-10"
                        >
                          Start Pickup
                        </Button>
                      )}
                      {donation.status === "in_transit" && (
                        <>
                          <Button
                            onClick={() => setUploadProofDonation(donation)}
                            variant="outline"
                            size="sm"
                            className="flex-1 rounded-xl h-10"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Photo
                          </Button>
                          <Button
                            onClick={() => handleUpdateStatus(donation.id, "delivered")}
                            size="sm"
                            className="flex-1 rounded-xl h-10"
                          >
                            Complete
                          </Button>
                        </>
                      )}
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => navigate(`/donation/${donation.id}`)}
                        className="rounded-xl h-10 w-10"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setSelectedDonation(donation)}
                        className="rounded-xl h-10 w-10"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                </SwipeableCard>
              ))
            )}
          </TabsContent>

          {/* Completed Tab */}
          <TabsContent value="completed" className="space-y-3 mt-4">
            {completedDonations.length === 0 ? (
              <Card className="p-12 text-center bg-white dark:bg-slate-800/50 border-dashed border-2 border-slate-200 dark:border-slate-700 rounded-3xl">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">No completed deliveries</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Your completed pickups will appear here
                </p>
              </Card>
            ) : (
              completedDonations.map((donation) => (
                <Card
                  key={donation.id}
                  className="p-4 bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-2xl hover:shadow-md transition-all cursor-pointer group"
                  onClick={() => navigate(`/donation/${donation.id}`)}
                >
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                          {donation.title}
                        </h3>
                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {donation.pickup_city}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(donation.delivered_at || "").toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6 mt-4">
            <AnalyticsDashboard userId={profile?.id || ""} role="volunteer" />
            <AchievementBadges userId={profile?.id || ""} />
          </TabsContent>

          {/* Community Tab */}
          <TabsContent value="community" className="space-y-6 mt-4">
            <Leaderboard type="volunteer" />
            <Leaderboard type="donor" />
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <Dialog open={!!selectedDonation} onOpenChange={() => setSelectedDonation(null)}>
        <DialogContent className="max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle>Message Donor</DialogTitle>
          </DialogHeader>
          {selectedDonation && (
            <DonationMessaging
              donationId={selectedDonation.id}
              currentUserId={profile?.id || ""}
              otherUserId={selectedDonation.donor_id}
              otherUserName="Donor"
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!uploadProofDonation} onOpenChange={() => setUploadProofDonation(null)}>
        <DialogContent className="max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle>Upload Delivery Proof</DialogTitle>
          </DialogHeader>
          {uploadProofDonation && (
            <DeliveryProofUpload
              donationId={uploadProofDonation.id}
              userId={profile?.id || ""}
              onSuccess={() => {
                setUploadProofDonation(null);
                toast({
                  title: "Success!",
                  description: "Delivery proof uploaded successfully",
                });
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Modern Bottom Navigation */}
      <div className="fixed bottom-0 inset-x-0 z-50 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 safe-area-pb">
        <div className="mx-auto max-w-lg px-6 py-3">
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: "available", icon: Home, label: "Browse" },
              { id: "my-donations", icon: CheckCircle, label: "Active" },
              { id: "feed", icon: Newspaper, label: "Feed", isNavigation: true },
              { id: "analytics", icon: BarChart3, label: "Stats" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => item.isNavigation ? navigate("/feed") : setActiveTab(item.id)}
                className={`flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-all ${
                  activeTab === item.id && !item.isNavigation
                    ? "bg-primary text-white shadow-lg shadow-primary/30"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolunteerDashboard;
