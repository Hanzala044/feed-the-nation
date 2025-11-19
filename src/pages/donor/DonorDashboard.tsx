import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useNotifications } from "@/hooks/useNotifications";
import {
  Plus,
  LogOut,
  Edit,
  Trash2,
  BarChart3,
  Bell,
  Eye,
  MessageCircle,
  Package,
  Home,
  Newspaper,
  Clock,
  MapPin,
  CheckCircle,
  Users
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SwipeableCard } from "@/components/SwipeableCard";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { Leaderboard } from "@/components/Leaderboard";
import { DonationTimeline } from "@/components/DonationTimeline";
import { DonationFilters } from "@/components/DonationFilters";
import { AchievementBadges } from "@/components/AchievementBadges";
import { DonationMessaging } from "@/components/DonationMessaging";
import type { Database } from "@/integrations/supabase/types";
import logo from "@/assets/logo.svg";

type Donation = Database["public"]["Tables"]["donations"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

const DonorDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [filteredDonations, setFilteredDonations] = useState<Donation[]>([]);
  const [pastDonations, setPastDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [activeTab, setActiveTab] = useState("active");
  const [filters, setFilters] = useState({
    search: "",
    foodType: "all",
    status: "all",
    urgency: "all",
    sortBy: "newest",
  });

  const { notificationsEnabled, requestPermission } = useNotifications(profile?.id);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate("/auth");
          return;
        }

        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (profileData?.role !== "donor") {
          navigate("/volunteer/dashboard");
          return;
        }

        setProfile(profileData);

        const { data: donationsData } = await supabase
          .from("donations")
          .select("*")
          .eq("donor_id", session.user.id)
          .order("created_at", { ascending: false });

        if (donationsData) {
          const active = donationsData.filter(d => d.status !== "delivered");
          const past = donationsData.filter(d => d.status === "delivered");
          setDonations(active);
          setFilteredDonations(active);
          setPastDonations(past);
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

    const channel = supabase
      .channel("donations-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "donations",
        },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [navigate, toast]);

  useEffect(() => {
    let result = [...donations];

    if (filters.search) {
      result = result.filter(
        (d) =>
          d.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          d.description.toLowerCase().includes(filters.search.toLowerCase()) ||
          d.pickup_city.toLowerCase().includes(filters.search.toLowerCase())
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
  }, [donations, filters]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("donations")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Donation deleted successfully",
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
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] flex items-center justify-center mx-auto mb-4 animate-pulse shadow-xl shadow-orange-500/20">
            <Package className="w-8 h-8 text-white" />
          </div>
          <p className="text-muted-foreground font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const DonationCard = ({ donation }: { donation: Donation }) => (
    <Card className="p-5 border-border/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 bg-card/50 backdrop-blur-sm group">
      <div className="flex gap-4 mb-4">
        <div className={`flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
          donation.urgency === "urgent"
            ? "bg-gradient-to-br from-red-500 to-red-600 shadow-red-500/30"
            : donation.status === "in_transit"
              ? "bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/30"
              : donation.status === "accepted"
                ? "bg-gradient-to-br from-purple-500 to-purple-600 shadow-purple-500/30"
                : "bg-gradient-to-br from-[#ff6b35] to-[#ff8c42] shadow-orange-500/30"
        }`}>
          <Package className="w-7 h-7 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <h3 className="font-bold text-base group-hover:text-primary transition-colors">{donation.title}</h3>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant={
              donation.status === "pending" ? "secondary" :
              donation.status === "accepted" ? "outline" :
              donation.status === "in_transit" ? "default" : "default"
            } className="rounded-full text-xs">
              {donation.status.replace("_", " ")}
            </Badge>
            {donation.urgency === "urgent" && (
              <Badge variant="destructive" className="text-xs rounded-full">Urgent</Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
            {donation.description}
          </p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Package className="w-3 h-3 text-orange-500" />
              {donation.food_type}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-blue-500" />
              {donation.pickup_city}
            </span>
          </div>
        </div>
      </div>

      <DonationTimeline
        status={donation.status}
        createdAt={donation.created_at || ""}
        pickedUpAt={donation.picked_up_at}
        deliveredAt={donation.delivered_at}
      />

      <div className="flex gap-2 mt-4">
        <Button
          variant="outline"
          onClick={() => navigate(`/donation/${donation.id}`)}
          className="flex-1 rounded-xl h-10 hover:bg-primary hover:text-white hover:border-primary transition-all"
        >
          <Eye className="w-4 h-4 mr-2" />
          View
        </Button>
        {donation.volunteer_id && (
          <Button
            variant="outline"
            onClick={() => setSelectedDonation(donation)}
            className="flex-1 rounded-xl h-10 hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Chat
          </Button>
        )}
        {donation.status === "pending" && (
          <>
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate(`/donor/edit-donation/${donation.id}`)}
              className="rounded-xl h-10 w-10 hover:bg-purple-500 hover:text-white hover:border-purple-500 transition-all"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleDelete(donation.id)}
              className="rounded-xl h-10 w-10 text-destructive hover:bg-destructive hover:text-white hover:border-destructive transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 pb-24">
      {/* Premium Sticky Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="px-4 py-3 max-w-md mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] p-0.5 shadow-lg shadow-orange-500/20">
                <div className="w-full h-full rounded-[10px] bg-background flex items-center justify-center">
                  <img src={logo} alt="Logo" className="w-6 h-6" />
                </div>
              </div>
              <div>
                <h1 className="text-base font-bold">
                  Hey, {profile?.full_name?.split(" ")[0]}!
                </h1>
                <p className="text-xs text-muted-foreground">Donor Dashboard</p>
              </div>
            </div>
            <div className="flex gap-1">
              {!notificationsEnabled && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={requestPermission}
                  className="rounded-xl h-9 w-9 hover:bg-muted/80"
                >
                  <Bell className="w-4 h-4" />
                </Button>
              )}
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                className="rounded-xl h-9 w-9 hover:bg-muted/80"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 max-w-md mx-auto">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <Card className="p-3 bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-200/50 dark:border-orange-800/30">
            <div className="text-center">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mx-auto mb-2 shadow-lg shadow-orange-500/30">
                <Package className="w-4 h-4 text-white" />
              </div>
              <p className="text-lg font-bold">{donations.length}</p>
              <p className="text-[10px] text-muted-foreground">Active</p>
            </div>
          </Card>
          <Card className="p-3 bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-200/50 dark:border-green-800/30">
            <div className="text-center">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mx-auto mb-2 shadow-lg shadow-green-500/30">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
              <p className="text-lg font-bold">{pastDonations.length}</p>
              <p className="text-[10px] text-muted-foreground">Completed</p>
            </div>
          </Card>
          <Card className="p-3 bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-200/50 dark:border-blue-800/30">
            <div className="text-center">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mx-auto mb-2 shadow-lg shadow-blue-500/30">
                <Users className="w-4 h-4 text-white" />
              </div>
              <p className="text-lg font-bold">{donations.filter(d => d.volunteer_id).length}</p>
              <p className="text-[10px] text-muted-foreground">With Volunteers</p>
            </div>
          </Card>
        </div>

        {/* Create Button */}
        <Button
          onClick={() => navigate("/donor/create-donation")}
          className="w-full mb-4 h-12 rounded-xl bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] hover:from-[#ff8c42] hover:to-[#ff6b35] text-white shadow-lg shadow-orange-500/20 font-semibold"
          size="lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create New Donation
        </Button>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 rounded-2xl bg-muted/50 p-1 h-11">
            <TabsTrigger value="active" className="rounded-xl text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm">
              Active
            </TabsTrigger>
            <TabsTrigger value="past" className="rounded-xl text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm">
              Past
            </TabsTrigger>
            <TabsTrigger value="analytics" className="rounded-xl text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <BarChart3 className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="community" className="rounded-xl text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm">
              Community
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            <DonationFilters filters={filters} onFiltersChange={setFilters} />

            {filteredDonations.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">
                  {donations.length === 0 ? "No active donations" : "No donations match your filters"}
                </p>
              </Card>
            ) : (
              filteredDonations.map((donation) => (
                <SwipeableCard
                  key={donation.id}
                  onSwipeLeft={() => handleDelete(donation.id)}
                  disabled={donation.status !== "pending"}
                >
                  <DonationCard donation={donation} />
                </SwipeableCard>
              ))
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            {pastDonations.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No past donations yet</p>
              </Card>
            ) : (
              pastDonations.map((donation) => (
                <Card key={donation.id} className="p-4 opacity-75">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{donation.title}</h3>
                        <Badge variant="secondary" className="rounded-full">Completed</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {donation.description}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-muted-foreground">{donation.food_type}</span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">{donation.quantity}</span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(donation.delivered_at || "").toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigate(`/donation/${donation.id}`)}
                      className="rounded-xl"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsDashboard userId={profile?.id || ""} role="donor" />
            <AchievementBadges userId={profile?.id || ""} />
          </TabsContent>

          <TabsContent value="community" className="space-y-6">
            <Leaderboard type="donor" />
            <Leaderboard type="volunteer" />
          </TabsContent>
        </Tabs>

        {/* Messaging Dialog */}
        <Dialog open={!!selectedDonation} onOpenChange={() => setSelectedDonation(null)}>
          <DialogContent className="max-w-md bg-gradient-card backdrop-blur-xl border-2 border-glassBorder">
            <DialogHeader>
              <DialogTitle>Message Volunteer</DialogTitle>
            </DialogHeader>
            {selectedDonation && selectedDonation.volunteer_id && (
              <DonationMessaging
                donationId={selectedDonation.id}
                currentUserId={profile?.id || ""}
                otherUserId={selectedDonation.volunteer_id}
                otherUserName="Volunteer"
              />
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Modern Bottom Navigation */}
      <div className="fixed bottom-0 inset-x-0 z-50 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 safe-area-pb">
        <div className="mx-auto max-w-md px-6 py-3">
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: "active", icon: Home, label: "Home" },
              { id: "new", icon: Plus, label: "New", isNavigation: true },
              { id: "feed", icon: Newspaper, label: "Feed", isNavigation: true },
              { id: "analytics", icon: BarChart3, label: "Stats" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === "new") {
                    navigate("/donor/create-donation");
                  } else if (item.id === "feed") {
                    navigate("/feed");
                  } else {
                    setActiveTab(item.id);
                  }
                }}
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

export default DonorDashboard;
