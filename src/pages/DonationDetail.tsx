import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DonationTimeline } from "@/components/DonationTimeline";
import { DonationMessaging } from "@/components/DonationMessaging";
import { RatingSystem } from "@/components/RatingSystem";
import { ArrowLeft, Clock, MapPin, Package, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type Donation = Database["public"]["Tables"]["donations"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Rating = Database["public"]["Tables"]["ratings"]["Row"];

const DonationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [donation, setDonation] = useState<Donation | null>(null);
  const [donorProfile, setDonorProfile] = useState<Profile | null>(null);
  const [volunteerProfile, setVolunteerProfile] = useState<Profile | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [showRating, setShowRating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      setCurrentUser(user);

      const { data: donationData } = await supabase
        .from("donations")
        .select("*")
        .eq("id", id)
        .single();

      if (donationData) {
        setDonation(donationData);

        const { data: donor } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", donationData.donor_id)
          .single();
        setDonorProfile(donor);

        if (donationData.volunteer_id) {
          const { data: volunteer } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", donationData.volunteer_id)
            .single();
          setVolunteerProfile(volunteer);
        }

        const { data: ratingsData } = await supabase
          .from("ratings")
          .select("*")
          .eq("donation_id", id);
        if (ratingsData) setRatings(ratingsData);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Package className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading donation details...</p>
        </div>
      </div>
    );
  }

  if (!donation) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Donation not found</p>
          <Button onClick={() => navigate(-1)} className="mt-4 rounded-xl">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const otherUser = donation.donor_id === currentUser?.id ? volunteerProfile : donorProfile;
  const otherUserId = donation.donor_id === currentUser?.id ? donation.volunteer_id : donation.donor_id;
  const canRate = donation.status === "delivered" && otherUserId && !ratings.some(r => r.rated_by === currentUser?.id);

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b px-6 py-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-xl"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">Donation Details</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Header Card with gradient background inspired by the reference image */}
        <Card className="p-6 bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 border-none">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">{donation.title}</h2>
              <Badge variant={
                donation.status === "delivered" ? "default" :
                donation.status === "in_transit" ? "secondary" :
                donation.status === "accepted" ? "outline" : "secondary"
              } className="rounded-full">
                {donation.status.replace("_", " ").toUpperCase()}
              </Badge>
            </div>
            <Badge variant={
              donation.urgency === "urgent" ? "destructive" :
              donation.urgency === "normal" ? "default" : "secondary"
            } className="rounded-full">
              {donation.urgency}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="flex items-center gap-2 text-sm">
              <Package className="w-4 h-4 text-primary" />
              <span className="font-medium">{donation.food_type}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-primary" />
              <span>{donation.pickup_time}</span>
            </div>
            <div className="flex items-center gap-2 text-sm col-span-2">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-xs">{donation.pickup_address}, {donation.pickup_city}</span>
            </div>
          </div>
        </Card>

        {/* Timeline */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Delivery Timeline</h3>
          <DonationTimeline
            status={donation.status}
            createdAt={donation.created_at || ""}
            pickedUpAt={donation.picked_up_at}
            deliveredAt={donation.delivered_at}
          />
        </Card>

        {/* Tabs for Details, Chat, Ratings */}
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3 rounded-xl">
            <TabsTrigger value="details" className="rounded-xl">Details</TabsTrigger>
            <TabsTrigger value="chat" className="rounded-xl">Chat</TabsTrigger>
            <TabsTrigger value="ratings" className="rounded-xl">Ratings</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 mt-4">
            <Card className="p-6">
              <h3 className="font-semibold mb-3">Description</h3>
              <p className="text-muted-foreground">{donation.description}</p>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-3">Additional Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quantity:</span>
                  <span className="font-medium">{donation.quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Expiry Date:</span>
                  <span className="font-medium">{new Date(donation.expiry_date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Donor:</span>
                  <span className="font-medium">{donorProfile?.full_name}</span>
                </div>
                {volunteerProfile && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Volunteer:</span>
                    <span className="font-medium">{volunteerProfile.full_name}</span>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="chat" className="mt-4">
            {otherUser && otherUserId ? (
              <DonationMessaging
                donationId={donation.id}
                currentUserId={currentUser.id}
                otherUserId={otherUserId}
                otherUserName={otherUser.full_name}
              />
            ) : (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">
                  Chat will be available once a volunteer accepts this donation
                </p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="ratings" className="mt-4">
            <Card className="p-6">
              {canRate && (
                <div className="mb-6">
                  <Button
                    onClick={() => setShowRating(true)}
                    className="w-full rounded-xl"
                  >
                    <Star className="w-4 h-4 mr-2" />
                    Rate {otherUser?.full_name}
                  </Button>
                </div>
              )}

              <h3 className="font-semibold mb-4">Reviews</h3>
              {ratings.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No ratings yet
                </p>
              ) : (
                <div className="space-y-4">
                  {ratings.map((rating) => (
                    <div key={rating.id} className="border rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < rating.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground"
                            }`}
                          />
                        ))}
                      </div>
                      {rating.feedback && (
                        <p className="text-sm text-muted-foreground">{rating.feedback}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(rating.created_at || "").toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {otherUser && otherUserId && (
        <RatingSystem
          open={showRating}
          onOpenChange={setShowRating}
          donationId={donation.id}
          ratedUserId={otherUserId}
          ratedUserName={otherUser.full_name}
          currentUserId={currentUser.id}
        />
      )}
    </div>
  );
};

export default DonationDetail;
