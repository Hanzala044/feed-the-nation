import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useNotifications } from "@/hooks/useNotifications";
import { Plus, LogOut, Edit, Trash2, BarChart3, Bell, Eye, MessageCircle, Package } from "lucide-react";
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
import logo from "@/assets/logo.png";

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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const DonationCard = ({ donation }: { donation: Donation }) => (
    <Card className="p-5 bg-gradient-card backdrop-blur-xl border-2 border-glassBorder shadow-soft hover:shadow-glass transition-all duration-300">
      <div className="flex gap-4 mb-4">
        <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center">
          <Package className="w-8 h-8 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg">{donation.title}</h3>
              {donation.urgency === "urgent" && (
                <Badge variant="destructive" className="text-xs rounded-full">Urgent</Badge>
              )}
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {donation.description}
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className="rounded-full">{donation.status.replace("_", " ")}</Badge>
            <span className="text-xs text-muted-foreground">{donation.food_type}</span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground">{donation.quantity}</span>
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
          className="flex-1"
        >
          <Eye className="w-4 h-4 mr-2" />
          View
        </Button>
        {donation.volunteer_id && (
          <Button
            variant="outline"
            onClick={() => setSelectedDonation(donation)}
            className="flex-1"
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
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleDelete(donation.id)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-cream/10 to-background pb-24">
      <div className="px-6 py-8 max-w-md mx-auto">
        {/* Modern Header with Logo */}
        <Card className="p-6 mb-6 bg-gradient-glass backdrop-blur-xl border-2 border-glassBorder shadow-glass">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={logo} alt="Logo" className="w-14 h-14 rounded-2xl" />
              <div>
                <h1 className="text-2xl font-bold">
                  Hey, {profile?.full_name?.split(" ")[0]}! 👋
                </h1>
                <p className="text-sm text-muted-foreground">Your donations dashboard</p>
              </div>
            </div>
            <div className="flex gap-2">
              {!notificationsEnabled && (
                <Button
                  variant="glass"
                  size="icon"
                  onClick={requestPermission}
                >
                  <Bell className="w-5 h-5" />
                </Button>
              )}
              <ThemeToggle />
              <Button
                variant="glass"
                size="icon"
                onClick={handleSignOut}
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </Card>

        <Button
          onClick={() => navigate("/donor/create-donation")}
          className="w-full mb-6"
          size="lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create New Donation
        </Button>

        <Tabs defaultValue="active" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 rounded-xl">
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3 className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
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
    </div>
  );
};

export default DonorDashboard;
