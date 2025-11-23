import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { authClient } from "@/integrations/supabase/authClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LocationPicker } from "@/components/LocationPicker";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, UtensilsCrossed, Apple, Package as PackageIcon, Wheat, Cookie, Clock, Calendar, MapPin, Home, BarChart3, Plus, Users, User } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { z } from "zod";

const donationSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  foodType: z.string().min(2, "Food type is required"),
  quantity: z.string().min(1, "Quantity is required"),
  urgency: z.enum(["urgent", "normal", "flexible"]),
  expiryDate: z.string(),
  pickupAddress: z.string().min(5, "Address is required"),
  pickupCity: z.string().min(2, "City is required"),
  pickupTime: z.string(),
});

const CreateDonation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [anonymous, setAnonymous] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    foodType: "",
    quantity: "",
    urgency: "normal" as "urgent" | "normal" | "flexible",
    expiryDate: "",
    pickupAddress: "",
    pickupCity: "",
    pickupTime: "",
    pickupLatitude: null as number | null,
    pickupLongitude: null as number | null,
    mapLink: "",
  });

  const foodTypes = [
    { value: "cooked", label: "Cooked Food", icon: UtensilsCrossed },
    { value: "raw", label: "Raw Ingredients", icon: Wheat },
    { value: "packaged", label: "Packaged Food", icon: PackageIcon },
    { value: "fruits", label: "Fruits & Veggies", icon: Apple },
    { value: "bakery", label: "Bakery Items", icon: Cookie },
  ];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setAnonymous(params.get("anonymous") === "true");
  }, []);

  const handleLocationSelect = (lat: number, lng: number, address: string, mapLink: string) => {
    setFormData({
      ...formData,
      pickupLatitude: lat,
      pickupLongitude: lng,
      pickupAddress: address,
      mapLink: mapLink,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validation = donationSchema.safeParse(formData);
      if (!validation.success) {
        toast({
          title: "Validation Error",
          description: validation.error.errors[0].message,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const { data: { session } } = await authClient.auth.getSession();

      let donorId: string | null = session?.user?.id || null;
      if (!donorId && anonymous) {
        const ANON_ID = "00000000-0000-0000-0000-000000000000";
        donorId = ANON_ID;
        await supabase
          .from("profiles")
          .upsert({
            id: ANON_ID,
            full_name: "Anonymous",
            email: "anonymous@food4u.local",
            role: "donor",
          }, { onConflict: "id" });
      } else if (!donorId) {
        navigate("/auth");
        return;
      }

      // Check if profile is complete (non-anonymous users must have phone)
      if (!anonymous && donorId) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("phone, full_name")
          .eq("id", donorId)
          .single();

        if (!profileData?.phone || !profileData?.full_name) {
          toast({
            title: "Profile Incomplete",
            description: "Please complete your profile with phone number before creating a donation",
            variant: "destructive",
          });
          navigate("/donor/edit-profile");
          return;
        }
      }

      // Add map link to description if available
      const descriptionWithMap = formData.mapLink
        ? `${formData.description}\n\n📍 Location: ${formData.mapLink}`
        : formData.description;

      // Use today's date for pickup time (since we only collect time)
      const today = new Date().toISOString().split('T')[0];
      const pickupDateTime = formData.pickupTime
        ? `${today}T${formData.pickupTime}`
        : null;

      // Format expiry date as timestamp
      const expiryDateTime = formData.expiryDate
        ? `${formData.expiryDate}T23:59:59`
        : null;

      const { error } = await supabase.from("donations").insert({
        donor_id: anonymous ? null : donorId,
        is_anonymous: anonymous,
        title: anonymous ? `[Anonymous] ${formData.title}` : formData.title,
        description: descriptionWithMap,
        food_type: formData.foodType,
        quantity: formData.quantity,
        urgency: formData.urgency,
        expiry_date: expiryDateTime,
        pickup_address: formData.pickupAddress,
        pickup_city: formData.pickupCity,
        pickup_time: pickupDateTime,
        pickup_latitude: formData.pickupLatitude,
        pickup_longitude: formData.pickupLongitude,
        status: "pending",
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: anonymous ? "Anonymous donation created successfully" : "Donation created successfully",
      });

      navigate(anonymous ? "/feed" : "/donor/dashboard");
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-lg border-b border-slate-800/50">
        <div className="px-4 py-4 max-w-2xl mx-auto flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/donor/dashboard")}
            className="rounded-2xl hover:bg-slate-800 text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white">Create Donation</h1>
            <p className="text-xs text-slate-400">Help feed those in need</p>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="px-4 py-6 max-w-2xl mx-auto space-y-6 pb-24">
        {/* Anonymous Toggle Card */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-3xl p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white font-semibold text-base">Anonymous Donation</Label>
              <p className="text-xs text-slate-400 mt-1">Hide your identity from public</p>
            </div>
            <Switch
              checked={anonymous}
              onCheckedChange={(v) => setAnonymous(!!v)}
              className="data-[state=checked]:bg-orange-500"
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title Input */}
          <div className="space-y-3">
            <Label className="text-slate-300 font-semibold text-sm">Donation Title</Label>
            <Input
              placeholder="e.g., Fresh Vegetable Meals"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="h-14 rounded-2xl bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 focus:border-orange-500/50 focus:ring-orange-500/20"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-3">
            <Label className="text-slate-300 font-semibold text-sm">Description</Label>
            <Textarea
              placeholder="Describe the food items in detail..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="min-h-28 rounded-2xl bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 resize-none focus:border-orange-500/50 focus:ring-orange-500/20"
              required
            />
          </div>

          {/* Food Type Selection */}
          <div className="space-y-3">
            <Label className="text-slate-300 font-semibold text-sm">Food Type</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {foodTypes.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFormData({ ...formData, foodType: value })}
                  className={cn(
                    "h-24 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all duration-300 border-2",
                    formData.foodType === value
                      ? "bg-gradient-to-br from-orange-500 to-orange-600 border-orange-400 shadow-[0_8px_24px_rgba(251,146,60,0.4)] scale-[1.02]"
                      : "bg-slate-800/50 border-slate-700/50 hover:border-slate-600 hover:bg-slate-800"
                  )}
                >
                  <Icon className={cn(
                    "w-7 h-7",
                    formData.foodType === value ? "text-white" : "text-orange-400"
                  )} />
                  <span className={cn(
                    "text-xs font-semibold",
                    formData.foodType === value ? "text-white" : "text-slate-300"
                  )}>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Urgency Level */}
          <div className="space-y-3">
            <Label className="text-slate-300 font-semibold text-sm">Urgency Level</Label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: "urgent", label: "🔥 Urgent", gradient: "from-red-500 to-red-600", shadow: "rgba(239,68,68,0.4)" },
                { value: "normal", label: "⚡ Normal", gradient: "from-orange-500 to-orange-600", shadow: "rgba(251,146,60,0.4)" },
                { value: "flexible", label: "✨ Flexible", gradient: "from-blue-500 to-blue-600", shadow: "rgba(59,130,246,0.4)" },
              ].map(({ value, label, gradient, shadow }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFormData({ ...formData, urgency: value as any })}
                  className={cn(
                    "h-14 rounded-2xl font-semibold text-sm transition-all duration-300 border-2",
                    formData.urgency === value
                      ? `bg-gradient-to-br ${gradient} border-transparent shadow-[0_6px_20px_${shadow}] scale-[1.02] text-white`
                      : "bg-slate-800/50 border-slate-700/50 hover:border-slate-600 text-slate-300"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity & Expiry */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label className="text-slate-300 font-semibold text-sm">Quantity</Label>
              <Input
                placeholder="e.g., 10 servings"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="h-14 rounded-2xl bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 focus:border-orange-500/50 focus:ring-orange-500/20"
                required
              />
            </div>

            <div className="space-y-3">
              <Label className="text-slate-300 font-semibold text-sm flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-orange-400" />
                Expiry Date
              </Label>
              <Input
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                className="h-14 rounded-2xl bg-slate-800/50 border-slate-700/50 text-white focus:border-orange-500/50 focus:ring-orange-500/20"
                required
              />
            </div>
          </div>

          {/* Location Card */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-3xl p-5 space-y-4">
            <Label className="text-slate-300 font-semibold text-sm flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-orange-400" />
              Pickup Location
            </Label>

            <LocationPicker
              onLocationSelect={handleLocationSelect}
              currentAddress={formData.pickupAddress}
              currentMapLink={formData.mapLink}
            />

            <div className="space-y-3 pt-2">
              <Input
                placeholder="City name"
                value={formData.pickupCity}
                onChange={(e) => setFormData({ ...formData, pickupCity: e.target.value })}
                className="h-14 rounded-2xl bg-slate-900/50 border-slate-600/50 text-white placeholder:text-slate-500 focus:border-orange-500/50 focus:ring-orange-500/20"
                required
              />
            </div>
          </div>

          {/* Pickup Time */}
          <div className="space-y-3">
            <Label className="text-slate-300 font-semibold text-sm flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-orange-400" />
              Pickup Time (Today)
            </Label>
            <Input
              type="time"
              value={formData.pickupTime}
              onChange={(e) => setFormData({ ...formData, pickupTime: e.target.value })}
              className="h-14 rounded-2xl bg-slate-800/50 border-slate-700/50 text-white focus:border-orange-500/50 focus:ring-orange-500/20"
              required
            />
            <p className="text-xs text-slate-400 flex items-start gap-1.5">
              <span className="text-orange-400 mt-0.5">ℹ️</span>
              Select when volunteers can pick up the donation today
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-16 rounded-2xl text-base font-bold bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 hover:from-orange-600 hover:via-orange-700 hover:to-orange-800 shadow-[0_12px_40px_rgba(251,146,60,0.4)] text-white border-0 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                Creating...
              </div>
            ) : (
              "Create Donation"
            )}
          </Button>
        </form>
      </div>

      {/* Animated Glassmorphism Bottom Navigation - Mobile Optimized */}
      <div className="fixed bottom-0 inset-x-0 z-50 pointer-events-none">
        <div className="mx-auto max-w-md px-4 pb-3 pointer-events-auto">
          <div className="relative bg-slate-900/40 backdrop-blur-2xl rounded-[24px] shadow-[0_8px_32px_rgba(0,0,0,0.4)] border border-white/10">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-800/20 to-transparent rounded-[24px] pointer-events-none"></div>

            <div className="relative grid grid-cols-5 gap-0 p-2">
              {[
                { id: "home", icon: Home, label: "Home", path: "/donor/dashboard" },
                { id: "analytics", icon: BarChart3, label: "Stats", path: "/donor/dashboard" },
                { id: "new", icon: Plus, label: "", path: "/donor/create-donation", isSpecial: true },
                { id: "community", icon: Users, label: "Community", path: "/donor/dashboard" },
                { id: "profile", icon: User, label: "Profile", path: "/donor/edit-profile" },
              ].map((item) => {
                const isActive = item.id === "new";

                return (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.path)}
                    className="relative flex flex-col items-center justify-center transition-all duration-300 group"
                  >
                    {item.isSpecial ? (
                      <div className="relative">
                        <div className="absolute -inset-1.5 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full blur-lg opacity-60 group-hover:opacity-80 transition-opacity"></div>
                        <div className="relative w-12 h-12 -mt-6 bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 rounded-full flex items-center justify-center shadow-[0_8px_24px_rgba(251,146,60,0.5)] group-hover:scale-110 group-active:scale-95 transition-all duration-300">
                          <item.icon className="w-6 h-6 text-white stroke-[2.5]" />
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1 py-1.5 px-2">
                        <div className={`relative transition-all duration-300 ${
                          isActive ? "scale-110" : "scale-100 group-hover:scale-105"
                        }`}>
                          {isActive && (
                            <div className="absolute -inset-2 bg-orange-500/20 rounded-xl animate-pulse"></div>
                          )}
                          <item.icon className={`w-5 h-5 relative z-10 transition-all duration-300 ${
                            isActive
                              ? "text-orange-500 drop-shadow-[0_2px_8px_rgba(251,146,60,0.6)]"
                              : "text-slate-400 group-hover:text-slate-200"
                          }`} />
                        </div>
                        {item.label && (
                          <span className={`text-[9px] font-medium transition-all duration-300 ${
                            isActive ? "text-orange-400" : "text-slate-500 group-hover:text-slate-300"
                          }`}>
                            {item.label}
                          </span>
                        )}
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
  );
};

export default CreateDonation;
