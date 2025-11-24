import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { authClient } from "@/integrations/supabase/authClient";
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
  Users,
  User,
  Share2
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
import { AchievementsGrid } from "@/components/AchievementsGrid";
import { DonationMessaging } from "@/components/DonationMessaging";
import { UnlockedBadges } from "@/components/UnlockedBadges";
import { ReferralCard } from "@/components/ReferralCard";
import type { Database } from "@/integrations/supabase/types";
import logo from "@/assets/logo.jpeg";

type Donation = Database["public"]["Tables"]["donations"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

const DonorDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [filteredDonations, setFilteredDonations] = useState<Donation[]>([]);
  const [pastDonations, setPastDonations] = useState<Donation[]>([]);
  const [referralsCount, setReferralsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [showReferralDialog, setShowReferralDialog] = useState(false);
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

        // Fetch referrals count
        const { count } = await supabase
          .from("referrals")
          .select("*", { count: 'exact', head: true })
          .eq("referrer_id", session.user.id);

        setReferralsCount(count || 0);
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
    await authClient.auth.signOut();
    navigate("/");
  };

  const handleShareApp = () => {
    setShowReferralDialog(true);
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
    <Card className="relative overflow-hidden rounded-3xl border-2 border-slate-200/50 dark:border-orange-500/30 hover:border-orange-300 dark:hover:border-orange-400/60 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm shadow-[0_8px_30px_rgb(0,0,0,0.15)] hover:shadow-[0_20px_60px_rgba(251,146,60,0.3)] transition-all duration-500 group">
      {/* Modern Card Header with Large Icon */}
      <div className="relative p-6 pb-4">
        {/* Decorative Background Gradient */}
        <div className={`absolute top-0 left-0 right-0 h-32 opacity-10 ${
          donation.urgency === "urgent"
            ? "bg-gradient-to-br from-red-400 via-red-300 to-transparent"
            : donation.status === "in_transit"
              ? "bg-gradient-to-br from-blue-400 via-blue-300 to-transparent"
              : donation.status === "accepted"
                ? "bg-gradient-to-br from-purple-400 via-purple-300 to-transparent"
                : "bg-gradient-to-br from-orange-400 via-orange-300 to-transparent"
        }`}></div>

        <div className="relative flex gap-4">
          {/* Large Icon with Modern Shadow */}
          <div className={`flex-shrink-0 w-16 h-16 rounded-[20px] flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform duration-300 ${
            donation.urgency === "urgent"
              ? "bg-gradient-to-br from-red-500 via-red-600 to-red-700 shadow-red-500/50"
              : donation.status === "in_transit"
                ? "bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 shadow-blue-500/50"
                : donation.status === "accepted"
                  ? "bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 shadow-purple-500/50"
                  : "bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 shadow-orange-500/50"
          }`}>
            <Package className="w-8 h-8 text-white drop-shadow-lg" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2 leading-tight group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
              {donation.title}
            </h3>

            {/* Status Badges */}
            <div className="flex items-center gap-2 mb-3">
              <Badge
                variant={donation.status === "pending" ? "secondary" : "outline"}
                className={`rounded-xl px-3 py-1 text-xs font-bold uppercase tracking-wide ${
                  donation.status === "pending"
                    ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                    : donation.status === "accepted"
                      ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800"
                      : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                }`}
              >
                {donation.status.replace("_", " ")}
              </Badge>
              {donation.urgency === "urgent" && (
                <Badge className="rounded-xl px-3 py-1 text-xs font-bold bg-gradient-to-r from-red-500 to-red-600 text-white border-0 shadow-lg shadow-red-500/30">
                  🔥 URGENT
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="px-6 pb-4">
        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
          {donation.description}
        </p>

        {/* Modern Info Tags */}
        <div className="flex items-center gap-2 flex-wrap mb-4">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800/30">
            <Package className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
            <span className="text-xs font-semibold text-orange-700 dark:text-orange-300">{donation.food_type}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30">
            <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">{donation.pickup_city}</span>
          </div>
        </div>
      </div>

      <DonationTimeline
        status={donation.status}
        createdAt={donation.created_at || ""}
        pickedUpAt={donation.picked_up_at}
        deliveredAt={donation.delivered_at}
      />

      {/* Modern Action Buttons */}
      <div className="px-6 pb-6">
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/donation/${donation.id}`)}
            className="flex-1 rounded-2xl h-11 font-semibold border-2 border-slate-200 dark:border-slate-700 hover:bg-orange-500 hover:text-white hover:border-orange-500 dark:hover:border-orange-500 transition-all shadow-sm hover:shadow-lg hover:shadow-orange-500/20"
          >
            <Eye className="w-4 h-4 mr-2" />
            View Details
          </Button>
          {donation.volunteer_id && (
            <Button
              variant="outline"
              onClick={() => setSelectedDonation(donation)}
              className="flex-1 rounded-2xl h-11 font-semibold border-2 border-slate-200 dark:border-slate-700 hover:bg-blue-500 hover:text-white hover:border-blue-500 dark:hover:border-blue-500 transition-all shadow-sm hover:shadow-lg hover:shadow-blue-500/20"
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
                className="rounded-2xl h-11 w-11 border-2 border-slate-200 dark:border-slate-700 hover:bg-purple-500 hover:text-white hover:border-purple-500 dark:hover:border-purple-500 transition-all shadow-sm hover:shadow-lg hover:shadow-purple-500/20"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleDelete(donation.id)}
                className="rounded-2xl h-11 w-11 border-2 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500 dark:hover:border-red-500 transition-all shadow-sm hover:shadow-lg hover:shadow-red-500/20"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#c9a68a] via-[#c9a68a]/70 to-[#c9a68a]/50 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pb-20 relative overflow-hidden">
      {/* Geometric Pattern Background */}
      <div className="absolute inset-0 opacity-[0.08] dark:opacity-[0.15] pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            {/* Grid Pattern */}
            <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.2)" className="dark:stroke-[rgba(251,146,60,0.15)]" strokeWidth="0.5"/>
            </pattern>
            {/* Dots Pattern */}
            <pattern id="dots-pattern" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="rgba(255,255,255,0.25)" className="dark:fill-[rgba(251,146,60,0.2)]"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-pattern)"/>
          <rect width="100%" height="100%" fill="url(#dots-pattern)"/>
        </svg>
      </div>

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-400/10 via-transparent to-teal-500/10 dark:from-orange-500/5 dark:via-transparent dark:to-purple-500/5 pointer-events-none"></div>
      <div className="absolute top-0 left-0 w-96 h-96 bg-orange-400/15 dark:bg-orange-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-500/15 dark:bg-purple-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Content Wrapper */}
      <div className="relative z-10">
      {/* Clean Minimal Header */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-[#c9a68a]/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-white/20 dark:border-slate-800/50">
        <div className="px-4 py-3 max-w-md mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#c9a68a] flex items-center justify-center shadow-lg shadow-[#c9a68a]/30 overflow-hidden">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.full_name || "Profile"} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white font-bold text-lg">
                    {profile?.full_name?.charAt(0) || "D"}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-sm font-bold text-slate-900 dark:text-white">
                  {profile?.full_name?.split(" ")[0] || "Donor"}
                </h1>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Donor</p>
                  {profile?.id && <UnlockedBadges userId={profile.id} userRole="donor" maxDisplay={3} />}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleShareApp}
                className="rounded-lg h-8 w-8 hover:bg-[#c9a68a]/20 dark:hover:bg-slate-800 text-[#ff6b35] dark:text-[#ff8c42]"
                title="Share App & Referral Code"
              >
                <Share2 className="w-4 h-4" />
              </Button>
              {!notificationsEnabled && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={requestPermission}
                  className="rounded-lg h-8 w-8 hover:bg-[#c9a68a]/20 dark:hover:bg-slate-800"
                >
                  <Bell className="w-4 h-4" />
                </Button>
              )}
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                className="rounded-lg h-8 w-8 hover:bg-[#c9a68a]/20 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      {/* Spacer to offset fixed header height so content isn't hidden */}
      <div className="h-14" />

      <div className="px-4 py-6 max-w-md mx-auto space-y-6">
        {/* Modern Stats Grid with Glassmorphism */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="relative p-4 bg-gradient-to-br from-orange-500/15 via-orange-400/10 to-transparent border-2 border-orange-200/60 dark:border-orange-500/40 backdrop-blur-sm hover:shadow-lg hover:shadow-orange-500/30 transition-all duration-300 group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative text-center">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mx-auto mb-2 shadow-xl shadow-orange-500/40 group-hover:scale-110 transition-transform">
                <Package className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-extrabold bg-gradient-to-br from-orange-600 to-orange-700 dark:from-orange-400 dark:to-orange-500 bg-clip-text text-transparent">{donations.length}</p>
              <p className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Active</p>
            </div>
          </Card>
          <Card className="relative p-4 bg-gradient-to-br from-green-500/15 via-green-400/10 to-transparent border-2 border-green-200/60 dark:border-green-500/40 backdrop-blur-sm hover:shadow-lg hover:shadow-green-500/30 transition-all duration-300 group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative text-center">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mx-auto mb-2 shadow-xl shadow-green-500/40 group-hover:scale-110 transition-transform">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-extrabold bg-gradient-to-br from-green-600 to-green-700 dark:from-green-400 dark:to-green-500 bg-clip-text text-transparent">{pastDonations.length}</p>
              <p className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Completed</p>
            </div>
          </Card>
          <Card className="relative p-4 bg-gradient-to-br from-blue-500/15 via-blue-400/10 to-transparent border-2 border-blue-200/60 dark:border-blue-500/40 backdrop-blur-sm hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative text-center">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mx-auto mb-2 shadow-xl shadow-blue-500/40 group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-extrabold bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-400 dark:to-blue-500 bg-clip-text text-transparent">{donations.filter(d => d.volunteer_id).length}</p>
              <p className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Accepted</p>
            </div>
          </Card>
        </div>

        {/* Modern Create Button with Animation */}
        <Button
          onClick={() => navigate("/donor/create-donation")}
          className="w-full h-14 rounded-2xl bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 hover:from-orange-600 hover:via-orange-700 hover:to-orange-800 text-white shadow-2xl shadow-orange-500/40 font-bold text-base transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group"
          size="lg"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:animate-[shimmer_2s_infinite]"></div>
          <Plus className="w-5 h-5 mr-2 relative z-10" />
          <span className="relative z-10">Create New Donation</span>
        </Button>

        {/* Enhanced Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-5">
          <TabsList className="grid w-full grid-cols-4 rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-1.5 h-12 border border-slate-200/50 dark:border-slate-800/50 shadow-lg">
            <TabsTrigger value="active" className="rounded-xl text-xs font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all">
              Active
            </TabsTrigger>
            <TabsTrigger value="past" className="rounded-xl text-xs font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all">
              Past
            </TabsTrigger>
            <TabsTrigger value="analytics" className="rounded-xl text-xs font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all">
              <BarChart3 className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="community" className="rounded-xl text-xs font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all">
              Community
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            <DonationFilters filters={filters} onFiltersChange={setFilters} />

            {filteredDonations.length === 0 ? (
              <Card className="p-12 text-center rounded-3xl border-2 border-dashed border-orange-300/60 dark:border-orange-500/50 bg-gradient-to-br from-orange-50/50 via-white to-orange-50/30 dark:from-orange-950/20 dark:via-slate-800/80 dark:to-orange-950/10 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-2xl shadow-orange-500/30">
                    <Package className="w-10 h-10 text-white" />
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 font-semibold text-lg">
                    {donations.length === 0 ? "No active donations" : "No donations match your filters"}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
                    {donations.length === 0
                      ? "Start making a difference! Create your first donation and help feed those in need."
                      : "Try adjusting your filters to see more donations."}
                  </p>
                  {donations.length === 0 && (
                    <Button
                      onClick={() => navigate("/donor/create-donation")}
                      className="mt-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/30"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Donation
                    </Button>
                  )}
                </div>
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
              <Card className="p-12 text-center rounded-3xl border-2 border-dashed border-slate-300/60 dark:border-slate-600/50 bg-slate-50/50 dark:bg-slate-800/80 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <Package className="w-8 h-8 text-slate-400 dark:text-slate-600" />
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 font-medium">No past donations yet</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Your completed donations will appear here</p>
                </div>
              </Card>
            ) : (
              pastDonations.map((donation) => (
                <Card key={donation.id} className="relative overflow-hidden rounded-3xl border-2 border-slate-200/50 dark:border-green-500/30 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm shadow-[0_4px_20px_rgb(0,0,0,0.1)] hover:shadow-[0_8px_30px_rgba(34,197,94,0.2)] transition-all duration-300 group">
                  {/* Success Indicator */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 via-green-500 to-green-600"></div>

                  <div className="p-6">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/30">
                            <CheckCircle className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-base text-slate-900 dark:text-white">{donation.title}</h3>
                            <Badge className="mt-1 rounded-xl px-2 py-0.5 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800">
                              ✓ Completed
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2 leading-relaxed">
                          {donation.description}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                            <Package className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{donation.food_type}</span>
                          </div>
                          <span className="text-slate-300 dark:text-slate-700">•</span>
                          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{donation.quantity}</span>
                          <span className="text-slate-300 dark:text-slate-700">•</span>
                          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            {new Date(donation.delivered_at || "").toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => navigate(`/donation/${donation.id}`)}
                        className="rounded-2xl h-10 w-10 border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-all"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {profile?.referral_code && (
              <ReferralCard
                referralCode={profile.referral_code}
                referralPoints={profile.referral_points || 0}
                referralsCount={referralsCount}
              />
            )}
            <AnalyticsDashboard userId={profile?.id || ""} role="donor" />
            <AchievementsGrid userId={profile?.id || ""} userRole="donor" />
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

      {/* Animated Glassmorphism Bottom Navigation - Mobile Optimized */}
      <div className="fixed bottom-0 inset-x-0 z-50 pointer-events-none">
        <div className="mx-auto max-w-md px-4 pb-3 pointer-events-auto">
          {/* Glassmorphism Container */}
          <div className="relative bg-[#5a7a8a]/40 dark:bg-slate-900/40 backdrop-blur-2xl rounded-[24px] shadow-[0_8px_32px_rgba(0,0,0,0.3)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] border border-white/20 dark:border-white/10">
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-teal-800/20 dark:from-slate-800/20 to-transparent rounded-[24px] pointer-events-none"></div>

            {/* Navigation Items */}
            <div className="relative grid grid-cols-5 gap-0 p-2">
              {[
                { id: "active", icon: Home, label: "Home" },
                { id: "analytics", icon: BarChart3, label: "Stats" },
                { id: "new", icon: Plus, label: "", isNavigation: true, isSpecial: true },
                { id: "community", icon: Users, label: "Community" },
                { id: "profile", icon: User, label: "Profile", isNavigation: true },
              ].map((item, index) => {
                const isActive = activeTab === item.id && !item.isNavigation;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.id === "new") {
                        navigate("/donor/create-donation");
                      } else if (item.id === "profile") {
                        navigate("/donor/edit-profile");
                      } else {
                        setActiveTab(item.id);
                      }
                    }}
                    className="relative flex flex-col items-center justify-center transition-all duration-300 group"
                  >
                    {/* Special Center Button (Create) - Mobile Optimized */}
                    {item.isSpecial ? (
                      <div className="relative">
                        {/* Outer glow ring */}
                        <div className="absolute -inset-1.5 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full blur-lg opacity-60 group-hover:opacity-80 transition-opacity"></div>

                        {/* Main button - Smaller for mobile */}
                        <div className="relative w-12 h-12 -mt-6 bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 rounded-full flex items-center justify-center shadow-[0_8px_24px_rgba(251,146,60,0.5)] group-hover:scale-110 group-active:scale-95 transition-all duration-300">
                          <item.icon className="w-6 h-6 text-white stroke-[2.5]" />
                        </div>
                      </div>
                    ) : (
                      /* Regular Navigation Items - Compact */
                      <div className="flex flex-col items-center gap-1 py-1.5 px-2">
                        {/* Icon Container */}
                        <div className={`relative transition-all duration-300 ${
                          isActive ? "scale-110" : "scale-100 group-hover:scale-105"
                        }`}>
                          {/* Active indicator background */}
                          {isActive && (
                            <div className="absolute -inset-2 bg-orange-500/20 rounded-xl animate-pulse"></div>
                          )}

                          <item.icon className={`w-5 h-5 relative z-10 transition-all duration-300 ${
                            isActive
                              ? "text-orange-500 drop-shadow-[0_2px_8px_rgba(251,146,60,0.6)]"
                              : "text-slate-700 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200"
                          }`} />
                        </div>

                        {/* Label - Smaller text */}
                        {item.label && (
                          <span className={`text-[9px] font-bold transition-all duration-300 ${
                            isActive
                              ? "text-orange-500"
                              : "text-slate-700 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-slate-300"
                          }`}>
                            {item.label}
                          </span>
                        )}

                        {/* Active dot indicator */}
                        {isActive && (
                          <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-orange-500 shadow-[0_0_6px_rgba(251,146,60,0.8)] animate-pulse"></div>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Referral Share Dialog */}
      <Dialog open={showReferralDialog} onOpenChange={setShowReferralDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold">Share FOOD 4 U</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {profile?.referral_code && (
              <ReferralCard
                referralCode={profile.referral_code}
                referralPoints={profile.referral_points || 0}
                referralsCount={referralsCount}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DonorDashboard;
