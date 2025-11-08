import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useNotifications } from "@/hooks/useNotifications";
import { Package, LogOut, CheckCircle, BarChart3, MessageCircle, Bell, Eye, X, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SwipeableCard } from "@/components/SwipeableCard";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { Leaderboard } from "@/components/Leaderboard";
import { DonationTimeline } from "@/components/DonationTimeline";
import { DonationMessaging } from "@/components/DonationMessaging";
import { DonationFilters } from "@/components/DonationFilters";
import { AchievementBadges } from "@/components/AchievementBadges";
import type { Database } from "@/integrations/supabase/types";

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
  const [filters, setFilters] = useState({
    search: "",
    foodType: "all",
    status: "all",
    urgency: "all",
    sortBy: "newest",
  });

  const { notificationsEnabled, requestPermission, sendNotification } = useNotifications(profile?.id);

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

    const channel = supabase
      .channel("donations-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "donations",
        },
        (payload) => {
          if (payload.new && (payload.new as any).status === "pending") {
            sendNotification(
              "New Donation Available!",
              `${(payload.new as any).title} is available for pickup`
            );
          }
          fetchData();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
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
  }, [navigate, toast, sendNotification]);

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

  const handleAccept = async (id: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from("donations")
        .update({ 
          status: "accepted",
          volunteer_id: session.user.id 
        })
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

      const { error } = await supabase
        .from("donations")
        .update(updates)
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Status updated to ${status}`,
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
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
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
    <div className="min-h-screen bg-background pb-24">
      <div className="px-6 py-8 max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">
              Welcome, {profile?.full_name?.split(" ")[0]}!
            </h1>
            <p className="text-muted-foreground">Volunteer Dashboard</p>
          </div>
          <div className="flex gap-2">
            {!notificationsEnabled && (
              <Button
                variant="ghost"
                size="icon"
                onClick={requestPermission}
                className="rounded-xl"
              >
                <Bell className="w-5 h-5" />
              </Button>
            )}
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              className="rounded-xl"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <Tabs defaultValue="available" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 rounded-xl text-xs">
            <TabsTrigger value="available">Available</TabsTrigger>
            <TabsTrigger value="my-donations">Active</TabsTrigger>
            <TabsTrigger value="completed">Past</TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3 className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="space-y-4">
            <DonationFilters filters={filters} onFiltersChange={setFilters} />
            
            {pendingDonations.length === 0 ? (
              <Card className="p-8 text-center">
                <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {donations.filter(d => d.status === "pending").length === 0 
                    ? "No pending donations" 
                    : "No donations match your filters"}
                </p>
              </Card>
            ) : (
              pendingDonations.map((donation) => (
                <SwipeableCard
                  key={donation.id}
                  onSwipeRight={() => handleAccept(donation.id)}
                  rightAction={<Check className="w-6 h-6" />}
                  leftAction={null}
                >
                  <Card className="p-4 bg-gradient-to-br from-card via-card to-accent/5">
                    <div className="flex gap-4 mb-4">
                      <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center">
                        <Package className="w-8 h-8 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{donation.title}</h3>
                          {donation.urgency === "urgent" && (
                            <Badge variant="destructive" className="text-xs rounded-full">Urgent</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {donation.description}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{donation.food_type}</span>
                          <span>•</span>
                          <span>{donation.quantity}</span>
                          <span>•</span>
                          <span>{donation.pickup_city}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => navigate(`/donation/${donation.id}`)}
                        variant="outline"
                        className="flex-1 rounded-xl"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                      <Button
                        onClick={() => handleAccept(donation.id)}
                        className="flex-1 rounded-xl"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Accept
                      </Button>
                    </div>
                  </Card>
                </SwipeableCard>
              ))
            )}
          </TabsContent>

          <TabsContent value="my-donations" className="space-y-4">
            {myAcceptedDonations.length === 0 ? (
              <Card className="p-8 text-center">
                <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No active donations</p>
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
                  <Card className="p-4">
                    <div className="flex gap-4 mb-4">
                      <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center">
                        <Package className="w-8 h-8 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold">{donation.title}</h3>
                          <Badge className="rounded-full">{donation.status.replace("_", " ")}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {donation.pickup_address}, {donation.pickup_city}
                        </p>
                      </div>
                    </div>

                    <DonationTimeline
                      status={donation.status}
                      createdAt={donation.created_at || ""}
                      pickedUpAt={donation.picked_up_at}
                      deliveredAt={donation.delivered_at}
                    />

                    <div className="flex gap-2 mt-4">
                      {donation.status === "accepted" && (
                        <Button
                          onClick={() => handleUpdateStatus(donation.id, "in_transit")}
                          variant="outline"
                          className="flex-1 rounded-xl"
                        >
                          Mark as In Transit
                        </Button>
                      )}
                      {donation.status === "in_transit" && (
                        <Button
                          onClick={() => handleUpdateStatus(donation.id, "delivered")}
                          className="flex-1 rounded-xl"
                        >
                          Mark as Delivered
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => navigate(`/donation/${donation.id}`)}
                        className="rounded-xl"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setSelectedDonation(donation)}
                        className="rounded-xl"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                </SwipeableCard>
              ))
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedDonations.length === 0 ? (
              <Card className="p-8 text-center">
                <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No completed donations yet</p>
              </Card>
            ) : (
              completedDonations.map((donation) => (
                <Card key={donation.id} className="p-4 opacity-75">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{donation.title}</h3>
                        <Badge variant="secondary" className="rounded-full">Completed</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {donation.pickup_address}, {donation.pickup_city}
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
            <AnalyticsDashboard userId={profile?.id || ""} role="volunteer" />
            <AchievementBadges userId={profile?.id || ""} />
          </TabsContent>

          <TabsContent value="community" className="space-y-6">
            <Leaderboard type="volunteer" />
            <Leaderboard type="donor" />
          </TabsContent>
        </Tabs>

        <Dialog open={!!selectedDonation} onOpenChange={() => setSelectedDonation(null)}>
          <DialogContent className="max-w-md">
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
      </div>
    </div>
  );
};

export default VolunteerDashboard;
