import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { authClient } from "@/integrations/supabase/authClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DonationTimeline } from "@/components/DonationTimeline";
import { DonationMessaging } from "@/components/DonationMessaging";
import { RatingSystem } from "@/components/RatingSystem";
import { EmbeddedMap } from "@/components/EmbeddedMap";
import {
  ArrowLeft,
  Clock,
  MapPin,
  Package,
  Star,
  Share2,
  MoreHorizontal,
  Calendar,
  User,
  CheckCircle2,
  Circle,
  Truck,
  Gift,
  MessageCircle,
  Image as ImageIcon,
  AlertCircle,
  Phone,
  Download
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { shareDonationPDF } from "@/utils/pdfGenerator";
import type { Database } from "@/integrations/supabase/types";
import logo from "@/assets/logo.png";

type Donation = Database["public"]["Tables"]["donations"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Rating = Database["public"]["Tables"]["ratings"]["Row"];
type DeliveryProof = Database["public"]["Tables"]["delivery_proofs"]["Row"];

const DonationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [donation, setDonation] = useState<Donation | null>(null);
  const [donorProfile, setDonorProfile] = useState<Profile | null>(null);
  const [volunteerProfile, setVolunteerProfile] = useState<Profile | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [deliveryProofs, setDeliveryProofs] = useState<DeliveryProof[]>([]);
  const [showRating, setShowRating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const { data: { user } } = await authClient.auth.getUser();
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

        const { data: proofsData } = await supabase
          .from("delivery_proofs")
          .select("*")
          .eq("donation_id", id);
        if (proofsData) setDeliveryProofs(proofsData);
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

  // Horizontal Timeline Stepper Component
  const HorizontalStepper = ({ status, createdAt, pickedUpAt, deliveredAt }: {
    status: string;
    createdAt: string;
    pickedUpAt: string | null;
    deliveredAt: string | null;
  }) => {
    const steps = [
      {
        key: 'created',
        label: 'Created',
        icon: Gift,
        completed: true,
        date: createdAt ? new Date(createdAt).toLocaleDateString() : null
      },
      {
        key: 'accepted',
        label: 'Accepted',
        icon: CheckCircle2,
        completed: ['accepted', 'in_transit', 'delivered'].includes(status),
        date: null
      },
      {
        key: 'in_transit',
        label: 'In Transit',
        icon: Truck,
        completed: ['in_transit', 'delivered'].includes(status),
        date: pickedUpAt ? new Date(pickedUpAt).toLocaleDateString() : null
      },
      {
        key: 'delivered',
        label: 'Delivered',
        icon: CheckCircle2,
        completed: status === 'delivered',
        date: deliveredAt ? new Date(deliveredAt).toLocaleDateString() : null
      },
    ];

    const currentStepIndex = steps.findIndex(step => step.key === status);

    return (
      <div className="w-full py-4">
        <div className="flex items-center justify-between relative">
          {/* Progress Line */}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted mx-8">
            <div
              className="h-full bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] transition-all duration-500"
              style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
            />
          </div>

          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStepIndex;
            const isCompleted = step.completed;

            return (
              <div key={step.key} className="flex flex-col items-center relative z-10">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                  ${isCompleted
                    ? 'bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] text-white shadow-lg shadow-orange-500/30'
                    : isActive
                      ? 'bg-primary/20 text-primary border-2 border-primary'
                      : 'bg-muted text-muted-foreground'
                  }
                `}>
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <span className={`
                  mt-2 text-xs font-medium transition-colors
                  ${isCompleted || isActive ? 'text-foreground' : 'text-muted-foreground'}
                `}>
                  {step.label}
                </span>
                {step.date && (
                  <span className="text-[10px] text-muted-foreground mt-0.5">
                    {step.date}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] flex items-center justify-center mx-auto mb-4 animate-pulse shadow-xl shadow-orange-500/20">
              <Package className="w-8 h-8 text-white" />
            </div>
          </div>
          <p className="text-muted-foreground font-medium">Loading donation details...</p>
        </div>
      </div>
    );
  }

  if (!donation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center px-6">
        <Card className="p-8 text-center max-w-sm border-2 border-dashed">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">Donation Not Found</h3>
          <p className="text-muted-foreground text-sm mb-6">
            This donation may have been removed or doesn't exist.
          </p>
          <Button onClick={() => navigate(-1)} className="rounded-xl bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] hover:from-[#ff8c42] hover:to-[#ff6b35]">
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  const otherUser = donation.donor_id === currentUser?.id ? volunteerProfile : donorProfile;
  const otherUserId = donation.donor_id === currentUser?.id ? donation.volunteer_id : donation.donor_id;
  const canRate = donation.status === "delivered" && otherUserId && !ratings.some(r => r.rated_by === currentUser?.id);

  const handleShare = async () => {
    try {
      await navigator.share({
        title: donation.title,
        text: `Check out this donation: ${donation.title}`,
        url: window.location.href,
      });
    } catch {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Donation link copied to clipboard",
      });
    }
  };

  const handleDownloadPDF = async () => {
    if (!donation) return;

    try {
      toast({
        title: "Generating PDF...",
        description: "Please wait while we prepare your donation receipt.",
      });

      const userType = donation.donor_id === currentUser?.id ? "donor" : "volunteer";
      const userName = userType === "donor" ? donorProfile?.full_name : volunteerProfile?.full_name;

      await shareDonationPDF({
        userType,
        userName: userName || "User",
        donations: [{
          id: donation.id,
          title: donation.title,
          description: donation.description || "",
          food_type: donation.food_type,
          quantity: parseFloat(donation.quantity) || 0,
          location: `${donation.pickup_address}, ${donation.pickup_city}`,
          status: donation.status,
          created_at: donation.created_at,
          pickup_time: donation.pickup_time || undefined,
          expiry_date: donation.expiry_date || undefined,
          volunteer_name: volunteerProfile?.full_name || undefined,
          donor_name: donorProfile?.full_name || undefined,
        }],
        logo: logo,
      });

      toast({
        title: "Success!",
        description: "Your donation receipt is ready to share.",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Premium Header Bar */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center justify-between max-w-4xl mx-auto px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-xl hover:bg-muted/80 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <div className="flex items-center gap-2">
            <Badge variant={
              donation.status === "delivered" ? "default" :
              donation.status === "in_transit" ? "secondary" :
              donation.status === "accepted" ? "outline" : "secondary"
            } className="rounded-full text-xs px-3 py-1">
              {donation.status.replace("_", " ").toUpperCase()}
            </Badge>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDownloadPDF}
              className="rounded-xl hover:bg-muted/80 transition-colors text-[#ff6b35] hover:text-[#ff8c42]"
              title="Download PDF Receipt"
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              className="rounded-xl hover:bg-muted/80 transition-colors"
              title="Share Link"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 pb-24">
        {/* Hero Section with Title and Main Info */}
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{donation.title}</h1>
              <div className="flex items-center gap-3 flex-wrap">
                <Badge variant={
                  donation.urgency === "urgent" ? "destructive" :
                  donation.urgency === "normal" ? "default" : "secondary"
                } className="rounded-full px-3 py-1">
                  {donation.urgency === "urgent" && <AlertCircle className="w-3 h-3 mr-1" />}
                  {donation.urgency}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Posted {new Date(donation.created_at || "").toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Info Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="p-4 bg-card/50 border-border/50 hover:bg-card/80 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <Package className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Food Type</p>
                <p className="font-semibold text-sm">{donation.food_type}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-card/50 border-border/50 hover:bg-card/80 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pickup Time</p>
                <p className="font-semibold text-sm">{donation.pickup_time}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-card/50 border-border/50 hover:bg-card/80 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Expires</p>
                <p className="font-semibold text-sm">{new Date(donation.expiry_date).toLocaleDateString()}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-card/50 border-border/50 hover:bg-card/80 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Gift className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Quantity</p>
                <p className="font-semibold text-sm">{donation.quantity}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Horizontal Timeline Stepper */}
        <Card className="p-6 border-border/50">
          <div className="flex items-center gap-2 mb-4">
            <Truck className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Delivery Progress</h3>
          </div>
          <HorizontalStepper
            status={donation.status}
            createdAt={donation.created_at || ""}
            pickedUpAt={donation.picked_up_at}
            deliveredAt={donation.delivered_at}
          />
        </Card>

        {/* Tabs for Details, Chat, Ratings */}
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3 rounded-2xl bg-muted/50 p-1 h-12">
            <TabsTrigger
              value="details"
              className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all flex items-center gap-2"
            >
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">Details</span>
            </TabsTrigger>
            <TabsTrigger
              value="chat"
              className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Chat</span>
            </TabsTrigger>
            <TabsTrigger
              value="ratings"
              className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all flex items-center gap-2"
            >
              <Star className="w-4 h-4" />
              <span className="hidden sm:inline">Ratings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 mt-6">
            {/* Description Card */}
            <Card className="p-6 border-border/50">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Package className="w-4 h-4 text-primary" />
                </div>
                <h3 className="font-semibold">Description</h3>
              </div>
              <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {donation.description.split('\n\n📍')[0]}
              </p>
            </Card>

            {/* Download PDF Card */}
            <Card className="p-6 border-2 border-[#ff6b35]/30 bg-gradient-to-br from-[#ff6b35]/5 via-purple-500/5 to-transparent">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#ff6b35] to-[#ff8c42] flex items-center justify-center shadow-lg">
                    <Download className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">Download Receipt</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Get a PDF copy of this donation</p>
                  </div>
                </div>
                <Button
                  onClick={handleDownloadPDF}
                  className="rounded-xl bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] hover:from-[#ff8c42] hover:to-[#ff6b35] text-white shadow-lg shadow-[#ff6b35]/30"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </Card>

            {/* Embedded Map Section */}
            <Card className="p-6 border-border/50">
              <EmbeddedMap
                latitude={donation.pickup_latitude}
                longitude={donation.pickup_longitude}
                address={donation.pickup_address}
                city={donation.pickup_city}
              />
            </Card>

            {/* People Involved */}
            <Card className="p-6 border-border/50">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <h3 className="font-semibold">People Involved</h3>
              </div>
              <div className="space-y-4">
                <div className="p-3 bg-muted/30 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center overflow-hidden">
                        {donorProfile?.avatar_url ? (
                          <img
                            src={donorProfile.avatar_url}
                            alt={donorProfile.full_name || "Donor"}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-semibold text-orange-500">
                            {donorProfile?.full_name?.charAt(0) || "D"}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{donorProfile?.full_name || "Unknown"}</p>
                        <p className="text-xs text-muted-foreground">Donor</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="rounded-full text-xs">Donor</Badge>
                  </div>
                  {donorProfile?.phone && donation.donor_id !== currentUser?.id && (
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <a
                        href={`tel:${donorProfile.phone}`}
                        className="flex-1 text-sm font-medium text-primary hover:underline"
                      >
                        {donorProfile.phone}
                      </a>
                      <Button
                        size="sm"
                        onClick={() => window.location.href = `tel:${donorProfile.phone}`}
                        className="rounded-full h-8 gap-2"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        Call Donor
                      </Button>
                    </div>
                  )}
                </div>

                {volunteerProfile && (
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center overflow-hidden">
                        {volunteerProfile.avatar_url ? (
                          <img
                            src={volunteerProfile.avatar_url}
                            alt={volunteerProfile.full_name || "Volunteer"}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-semibold text-blue-500">
                            {volunteerProfile.full_name?.charAt(0) || "V"}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{volunteerProfile.full_name}</p>
                        <p className="text-xs text-muted-foreground">Volunteer</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="rounded-full text-xs">Volunteer</Badge>
                  </div>
                )}
              </div>
            </Card>

            {/* Delivery Photos */}
            {deliveryProofs.length > 0 && (
              <Card className="p-6 border-border/50">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <ImageIcon className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="font-semibold">Delivery Photos</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {deliveryProofs.map((proof) => (
                    <div key={proof.id} className="relative group overflow-hidden rounded-xl">
                      <img
                        src={proof.image_url}
                        alt={`Delivery proof ${proof.proof_type}`}
                        className="w-full h-32 object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <Badge
                        variant="secondary"
                        className="absolute bottom-2 left-2 rounded-lg text-xs bg-background/80 backdrop-blur-sm"
                      >
                        {proof.proof_type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="chat" className="mt-6">
            {otherUser && otherUserId ? (
              <Card className="border-border/50 overflow-hidden">
                <DonationMessaging
                  donationId={donation.id}
                  currentUserId={currentUser.id}
                  otherUserId={otherUserId}
                  otherUserName={otherUser.full_name}
                />
              </Card>
            ) : (
              <Card className="p-8 text-center border-border/50 border-2 border-dashed">
                <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="font-semibold mb-2">Chat Not Available</h3>
                <p className="text-muted-foreground text-sm">
                  Chat will be available once a volunteer accepts this donation
                </p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="ratings" className="mt-6">
            <Card className="p-6 border-border/50">
              {canRate && (
                <div className="mb-6">
                  <Button
                    onClick={() => setShowRating(true)}
                    className="w-full rounded-xl h-12 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] hover:from-[#ff8c42] hover:to-[#ff6b35] text-white shadow-lg shadow-orange-500/20"
                  >
                    <Star className="w-4 h-4 mr-2" />
                    Rate {otherUser?.full_name}
                  </Button>
                </div>
              )}

              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                  <Star className="w-4 h-4 text-yellow-500" />
                </div>
                <h3 className="font-semibold">Reviews</h3>
              </div>

              {ratings.length === 0 ? (
                <div className="text-center py-8">
                  <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-30" />
                  <p className="text-muted-foreground text-sm">No ratings yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {ratings.map((rating) => (
                    <div key={rating.id} className="p-4 bg-muted/30 rounded-xl">
                      <div className="flex items-center gap-1 mb-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < rating.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground/30"
                            }`}
                          />
                        ))}
                        <span className="ml-2 text-sm font-medium">{rating.rating}/5</span>
                      </div>
                      {rating.feedback && (
                        <p className="text-sm text-muted-foreground leading-relaxed">{rating.feedback}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-3">
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

      {/* Fixed Bottom Action Bar for Volunteers */}
      {donation.status === "pending" && donation.donor_id !== currentUser?.id && (
        <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-xl border-t border-border/50 p-4 z-40">
          <div className="max-w-4xl mx-auto">
            <Button
              className="w-full h-12 rounded-xl bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] hover:from-[#ff8c42] hover:to-[#ff6b35] text-white shadow-lg shadow-orange-500/20 font-semibold"
            >
              Accept This Donation
            </Button>
          </div>
        </div>
      )}

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
