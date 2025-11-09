import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, Package, ArrowRight, Heart } from "lucide-react";

interface Donation {
  id: string;
  title: string;
  description: string;
  food_type: string;
  quantity: string;
  pickup_address: string;
  pickup_city: string;
  status: string;
  urgency: string;
  created_at: string;
  image_url?: string;
}

const PublicFeed = () => {
  const navigate = useNavigate();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublicDonations();
  }, []);

  const fetchPublicDonations = async () => {
    const { data, error } = await supabase
      .from("donations")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (data) {
      setDonations(data);
    }
    setLoading(false);
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "urgent":
        return "bg-red-100 text-red-700 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-700 border-orange-200";
      default:
        return "bg-green-100 text-green-700 border-green-200";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-warm flex items-center justify-center">
        <p className="text-foreground/60">Loading donations...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-warm">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/10 via-cream/30 to-primary/5 backdrop-blur-xl border-b border-primary/10">
        <div className="max-w-6xl mx-auto px-4 py-12 md:py-20 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
            Available Food Donations
          </h1>
          <p className="text-lg md:text-xl text-foreground/70 mb-8 max-w-2xl mx-auto">
            Join our community of volunteers and help reduce food waste while feeding those in need
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate("/auth")}
              className="shadow-glow"
            >
              <Heart className="w-5 h-5 mr-2" />
              Become a Volunteer
            </Button>
            <Button
              variant="glass"
              size="lg"
              onClick={() => navigate("/auth")}
            >
              Donate Food
            </Button>
          </div>
        </div>
      </div>

      {/* Donations Grid */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {donations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {donations.map((donation) => (
              <Card
                key={donation.id}
                className="glass-card overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
                onClick={() => navigate(`/donation/${donation.id}`)}
              >
                {donation.image_url && (
                  <div className="h-48 overflow-hidden bg-primary/5">
                    <img
                      src={donation.image_url}
                      alt={donation.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                )}
                
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                      {donation.title}
                    </h3>
                    <Badge
                      variant="outline"
                      className={`rounded-xl ${getUrgencyColor(donation.urgency)}`}
                    >
                      {donation.urgency}
                    </Badge>
                  </div>

                  <p className="text-foreground/70 text-sm mb-4 line-clamp-2">
                    {donation.description}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-foreground/60">
                      <Package className="w-4 h-4 mr-2 text-primary" />
                      {donation.food_type} • {donation.quantity}
                    </div>
                    <div className="flex items-center text-sm text-foreground/60">
                      <MapPin className="w-4 h-4 mr-2 text-primary" />
                      {donation.pickup_city}
                    </div>
                    <div className="flex items-center text-sm text-foreground/60">
                      <Clock className="w-4 h-4 mr-2 text-primary" />
                      {new Date(donation.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <Button
                    variant="glass"
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all"
                  >
                    View Details
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="glass-card p-12 text-center">
            <Heart className="w-16 h-16 mx-auto mb-4 text-primary/40" />
            <h3 className="text-2xl font-bold text-foreground mb-2">
              No donations available right now
            </h3>
            <p className="text-foreground/60 mb-6">
              Check back soon or sign up to be notified of new donations
            </p>
            <Button onClick={() => navigate("/auth")}>
              Join as Volunteer
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PublicFeed;
