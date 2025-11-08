import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, Package, TrendingUp, Users, LogOut, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Database } from "@/integrations/supabase/types";

type Donation = Database["public"]["Tables"]["donations"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

const DonorDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    delivered: 0,
    pending: 0,
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
          setStats({
            total: donationsData.length,
            delivered: donationsData.filter((d) => d.status === "delivered").length,
            pending: donationsData.filter((d) => d.status === "pending").length,
          });
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
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
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

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <StatCard icon={<Package />} value={stats.total} label="Total" />
          <StatCard icon={<TrendingUp />} value={stats.delivered} label="Delivered" />
          <StatCard icon={<Users />} value={stats.pending} label="Pending" />
        </div>

        {/* Quick Actions */}
        <Button
          onClick={() => navigate("/donor/create-donation")}
          className="w-full h-14 rounded-2xl text-base font-semibold mb-8 shadow-[0_8px_32px_hsla(16,100%,66%,0.25)]"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create New Donation
        </Button>

        {/* Donations List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">My Donations</h2>
            <span className="text-sm text-muted-foreground">{donations.length} items</span>
          </div>

          {donations.length === 0 ? (
            <Card className="p-8 text-center">
              <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No donations yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Start making a difference by creating your first donation
              </p>
            </Card>
          ) : (
            donations.map((donation) => (
              <Card
                key={donation.id}
                className="p-4 cursor-pointer hover:border-primary/50 transition-all"
              >
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Package className="w-8 h-8 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold truncate">{donation.title}</h3>
                      <Badge variant={getStatusVariant(donation.status)}>
                        {donation.status}
                      </Badge>
                    </div>
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
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/donor/edit-donation/${donation.id}`)}
                    className="flex-1 rounded-xl"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(donation.id)}
                    className="flex-1 rounded-xl border-destructive/50 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) => (
  <Card className="p-4 text-center">
    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary mx-auto mb-2">
      {icon}
    </div>
    <div className="text-2xl font-bold text-primary mb-1">{value}</div>
    <div className="text-xs text-muted-foreground">{label}</div>
  </Card>
);

const getStatusVariant = (status: string) => {
  switch (status) {
    case "delivered":
      return "default";
    case "in_transit":
      return "secondary";
    case "accepted":
      return "outline";
    default:
      return "outline";
  }
};

export default DonorDashboard;
