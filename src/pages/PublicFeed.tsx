import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Clock,
  MapPin,
  Package,
  ArrowRight,
  Heart,
  ArrowLeft,
  Newspaper,
  AlertTriangle,
  Globe,
  RefreshCw,
  ExternalLink,
  TrendingUp,
  Users,
  Utensils
} from "lucide-react";

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

interface NewsItem {
  id: string;
  title: string;
  description: string;
  source: string;
  url: string;
  publishedAt: string;
  category: "crisis" | "awareness" | "solution";
  imageUrl?: string;
}

// Mock news data - In production, this would come from a news API
const mockNewsData: NewsItem[] = [
  {
    id: "1",
    title: "Global Food Crisis: 783 Million People Face Hunger",
    description: "The UN reports that food insecurity has reached unprecedented levels, with climate change and conflicts driving the crisis.",
    source: "UN World Food Programme",
    url: "https://www.wfp.org",
    publishedAt: new Date().toISOString(),
    category: "crisis",
  },
  {
    id: "2",
    title: "Food Waste Reduction: How Communities Are Making a Difference",
    description: "Local initiatives across the country are successfully redirecting surplus food to those in need, preventing millions of pounds of waste.",
    source: "Food Recovery Network",
    url: "https://www.foodrecoverynetwork.org",
    publishedAt: new Date(Date.now() - 3600000).toISOString(),
    category: "solution",
  },
  {
    id: "3",
    title: "Rising Food Prices Impact Low-Income Families",
    description: "Inflation continues to affect food accessibility, with staple items seeing significant price increases over the past year.",
    source: "USDA Economic Research",
    url: "https://www.ers.usda.gov",
    publishedAt: new Date(Date.now() - 7200000).toISOString(),
    category: "crisis",
  },
  {
    id: "4",
    title: "School Meal Programs Expand to Combat Child Hunger",
    description: "New federal initiatives aim to provide free meals to more students, addressing food insecurity among children.",
    source: "USDA Food & Nutrition",
    url: "https://www.fns.usda.gov",
    publishedAt: new Date(Date.now() - 14400000).toISOString(),
    category: "solution",
  },
  {
    id: "5",
    title: "Climate Change Threatens Global Food Production",
    description: "Scientists warn that extreme weather events are increasingly disrupting agricultural systems worldwide.",
    source: "FAO",
    url: "https://www.fao.org",
    publishedAt: new Date(Date.now() - 28800000).toISOString(),
    category: "awareness",
  },
  {
    id: "6",
    title: "Tech Solutions for Food Distribution Efficiency",
    description: "New apps and platforms are connecting food donors with recipients faster than ever, reducing spoilage and waste.",
    source: "Food Tech Weekly",
    url: "https://www.foodtech.com",
    publishedAt: new Date(Date.now() - 43200000).toISOString(),
    category: "solution",
  },
];

const PublicFeed = () => {
  const navigate = useNavigate();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [news, setNews] = useState<NewsItem[]>(mockNewsData);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("news");

  useEffect(() => {
    fetchPublicDonations();
  }, []);

  const fetchPublicDonations = async () => {
    try {
      const { data } = await supabase
        .from("donations")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (data) {
        setDonations(data);
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshNews = async () => {
    setRefreshing(true);
    // Simulate API call - In production, fetch from actual news API
    await new Promise(resolve => setTimeout(resolve, 1500));
    // Shuffle news to simulate new content
    setNews([...mockNewsData].sort(() => Math.random() - 0.5));
    setRefreshing(false);
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "urgent":
        return "bg-red-500/10 text-red-600 border-red-200 dark:border-red-800";
      case "high":
        return "bg-orange-500/10 text-orange-600 border-orange-200 dark:border-orange-800";
      default:
        return "bg-green-500/10 text-green-600 border-green-200 dark:border-green-800";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "crisis":
        return <AlertTriangle className="w-4 h-4" />;
      case "solution":
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "crisis":
        return "bg-red-500/10 text-red-600 border-red-200 dark:border-red-800";
      case "solution":
        return "bg-green-500/10 text-green-600 border-green-200 dark:border-green-800";
      default:
        return "bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-800";
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] flex items-center justify-center mx-auto mb-4 animate-pulse shadow-xl shadow-orange-500/20">
            <Newspaper className="w-8 h-8 text-white" />
          </div>
          <p className="text-muted-foreground font-medium">Loading news feed...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="rounded-xl hover:bg-muted/80 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-lg font-bold">News Hub</h1>
                <p className="text-xs text-muted-foreground">Food Crisis & Updates</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshNews}
              disabled={refreshing}
              className="rounded-xl gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats Banner */}
      <div className="bg-gradient-to-r from-[#ff6b35]/10 via-purple-500/10 to-blue-500/10 border-b border-border/50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="text-lg font-bold">783M</span>
              </div>
              <p className="text-[10px] text-muted-foreground">People Hungry</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Utensils className="w-4 h-4 text-orange-500" />
                <span className="text-lg font-bold">1/3</span>
              </div>
              <p className="text-[10px] text-muted-foreground">Food Wasted</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Users className="w-4 h-4 text-green-500" />
                <span className="text-lg font-bold">{donations.length}</span>
              </div>
              <p className="text-[10px] text-muted-foreground">Active Donations</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 rounded-2xl bg-muted/50 p-1 h-12 mb-6">
            <TabsTrigger
              value="news"
              className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all flex items-center gap-2"
            >
              <Newspaper className="w-4 h-4" />
              News & Crisis
            </TabsTrigger>
            <TabsTrigger
              value="donations"
              className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all flex items-center gap-2"
            >
              <Heart className="w-4 h-4" />
              Donations
            </TabsTrigger>
          </TabsList>

          {/* News Tab */}
          <TabsContent value="news" className="space-y-4 mt-0">
            {news.map((item) => (
              <Card
                key={item.id}
                className="p-4 border-border/50 hover:shadow-lg hover:shadow-primary/5 transition-all cursor-pointer group"
                onClick={() => window.open(item.url, '_blank')}
              >
                <div className="flex gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <Badge
                        variant="outline"
                        className={`rounded-full text-xs px-2 py-0.5 flex items-center gap-1 ${getCategoryColor(item.category)}`}
                      >
                        {getCategoryIcon(item.category)}
                        {item.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatTimeAgo(item.publishedAt)}
                      </span>
                    </div>

                    <h3 className="font-semibold text-sm leading-tight group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>

                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {item.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Globe className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{item.source}</span>
                      </div>
                      <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            {/* Call to Action */}
            <Card className="p-6 bg-gradient-to-br from-[#ff6b35]/10 to-[#ff8c42]/5 border-[#ff6b35]/20">
              <div className="text-center space-y-4">
                <Heart className="w-12 h-12 mx-auto text-[#ff6b35] animate-pulse" />
                <h3 className="font-bold text-lg">Make a Difference Today</h3>
                <p className="text-sm text-muted-foreground">
                  Join thousands of volunteers fighting food waste and hunger in your community.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={() => navigate("/auth?mode=signup")}
                    className="rounded-xl bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] hover:from-[#ff8c42] hover:to-[#ff6b35] text-white shadow-lg shadow-orange-500/20"
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Become a Volunteer
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate("/auth?mode=signup")}
                    className="rounded-xl"
                  >
                    Donate Food
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Donations Tab */}
          <TabsContent value="donations" className="space-y-4 mt-0">
            {donations.length > 0 ? (
              donations.map((donation) => (
                <Card
                  key={donation.id}
                  className="p-4 border-border/50 hover:shadow-lg hover:shadow-primary/5 transition-all cursor-pointer group"
                  onClick={() => navigate(`/donation/${donation.id}`)}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">
                        {donation.title}
                      </h3>
                      <Badge
                        variant="outline"
                        className={`rounded-full text-xs ${getUrgencyColor(donation.urgency)}`}
                      >
                        {donation.urgency}
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {donation.description}
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Package className="w-3 h-3 text-orange-500" />
                        {donation.food_type}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-3 h-3 text-blue-500" />
                        {donation.pickup_city}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(donation.created_at)}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-xl text-xs h-8 px-3 group-hover:bg-primary group-hover:text-white transition-all"
                      >
                        View Details
                        <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-0.5 transition-transform" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-8 text-center border-2 border-dashed border-border/50">
                <Heart className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="font-semibold mb-2">No donations available</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Check back soon or sign up to donate food
                </p>
                <Button
                  onClick={() => navigate("/auth")}
                  className="rounded-xl bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] hover:from-[#ff8c42] hover:to-[#ff6b35] text-white"
                >
                  Get Started
                </Button>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PublicFeed;
