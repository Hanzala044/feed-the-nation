import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, LogOut, Edit, Trash2, BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { Leaderboard } from "@/components/Leaderboard";
import { DonationTimeline } from "@/components/DonationTimeline";
import { DonationFilters } from "@/components/DonationFilters";
import { AchievementBadges } from "@/components/AchievementBadges";
import type { Database } from "@/integrations/supabase/types";

type Donation = Database["public"]["Tables"]["donations"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

const DonorDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [filteredDonations, setFilteredDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    foodType: "all",
    status: "all",
    urgency: "all",
    sortBy: "newest",
  });

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

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-6 py-8 max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">
              Welcome, {profile?.full_name?.split(" ")[0]}!
            </h1>
            <p className="text-muted-foreground">Donor Dashboard</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSignOut}
            className="rounded-xl"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>

        <Button
          onClick={() => navigate("/donor/create-donation")}
          className="w-full rounded-xl mb-6"
          size="lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create New Donation
        </Button>

        <Tabs defaultValue="donations" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 rounded-xl">
            <TabsTrigger value="donations">Donations</TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3 className="w-4 h-4 mr-1" />
              Stats
            </TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
          </TabsList>

          <TabsContent value="donations" className="space-y-4">
            <DonationFilters filters={filters} onFiltersChange={setFilters} />

            {filteredDonations.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">
                  {donations.length === 0 ? "No donations yet" : "No donations match your filters"}
                </p>
              </Card>
            ) : (
              filteredDonations.map((donation) => (
                <Card key={donation.id} className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{donation.title}</h3>
                        {donation.urgency === "urgent" && (
                          <Badge variant="destructive" className="text-xs">Urgent</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {donation.description}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap mb-3">
                        <Badge>{donation.status}</Badge>
                        <span className="text-xs text-muted-foreground">{donation.food_type}</span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">{donation.quantity}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/donor/edit-donation/${donation.id}`)}
                        className="rounded-xl"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(donation.id)}
                        className="rounded-xl text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <DonationTimeline
                    status={donation.status}
                    createdAt={donation.created_at || ""}
                    pickedUpAt={donation.picked_up_at}
                    deliveredAt={donation.delivered_at}
                  />
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
      </div>
    </div>
  );
};

export default DonorDashboard;
