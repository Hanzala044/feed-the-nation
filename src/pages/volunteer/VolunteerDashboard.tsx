import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Package, LogOut, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Database } from "@/integrations/supabase/types";

type Donation = Database["public"]["Tables"]["donations"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

const VolunteerDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

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
      const { error } = await supabase
        .from("donations")
        .update({ status })
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

  const pendingDonations = donations.filter(d => d.status === "pending");
  const myAcceptedDonations = donations.filter(
    d => d.volunteer_id === profile?.id && d.status !== "pending"
  );

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-6 py-8 max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">
              Welcome, {profile?.full_name?.split(" ")[0]}!
            </h1>
            <p className="text-muted-foreground">Volunteer Dashboard</p>
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

        {/* Available Donations */}
        <div className="space-y-4 mb-8">
          <h2 className="text-xl font-semibold">Available Donations</h2>
          {pendingDonations.length === 0 ? (
            <Card className="p-8 text-center">
              <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No pending donations</p>
            </Card>
          ) : (
            pendingDonations.map((donation) => (
              <Card key={donation.id} className="p-4">
                <div className="flex gap-4 mb-4">
                  <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Package className="w-8 h-8 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold mb-1">{donation.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {donation.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{donation.quantity}</span>
                      <span>•</span>
                      <span>{donation.pickup_city}</span>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => handleAccept(donation.id)}
                  className="w-full rounded-xl"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Accept Donation
                </Button>
              </Card>
            ))
          )}
        </div>

        {/* My Accepted Donations */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">My Accepted Donations</h2>
          {myAcceptedDonations.length === 0 ? (
            <Card className="p-8 text-center">
              <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No accepted donations yet</p>
            </Card>
          ) : (
            myAcceptedDonations.map((donation) => (
              <Card key={donation.id} className="p-4">
                <div className="flex gap-4 mb-4">
                  <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Package className="w-8 h-8 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold">{donation.title}</h3>
                      <Badge>{donation.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {donation.pickup_address}, {donation.pickup_city}
                    </p>
                  </div>
                </div>
                {donation.status === "accepted" && (
                  <Button
                    onClick={() => handleUpdateStatus(donation.id, "in_transit")}
                    variant="outline"
                    className="w-full rounded-xl"
                  >
                    Mark as In Transit
                  </Button>
                )}
                {donation.status === "in_transit" && (
                  <Button
                    onClick={() => handleUpdateStatus(donation.id, "delivered")}
                    className="w-full rounded-xl"
                  >
                    Mark as Delivered
                  </Button>
                )}
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default VolunteerDashboard;
