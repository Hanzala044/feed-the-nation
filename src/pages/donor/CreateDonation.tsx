import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LocationPicker } from "@/components/LocationPicker";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, UtensilsCrossed, Apple, Package as PackageIcon, Wheat, Cookie } from "lucide-react";
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

  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    setFormData({
      ...formData,
      pickupLatitude: lat,
      pickupLongitude: lng,
      pickupAddress: address,
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

      const { data: { session } } = await supabase.auth.getSession();

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

      const { error } = await supabase.from("donations").insert({
        donor_id: anonymous ? null : donorId,
        is_anonymous: anonymous,
        title: anonymous ? `[Anonymous] ${formData.title}` : formData.title,
        description: formData.description,
        food_type: formData.foodType,
        quantity: formData.quantity,
        urgency: formData.urgency,
        expiry_date: formData.expiryDate,
        pickup_address: formData.pickupAddress,
        pickup_city: formData.pickupCity,
        pickup_time: formData.pickupTime,
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
    <div className="min-h-screen bg-background">
      <div className="px-6 py-8 max-w-2xl mx-auto">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/donor/dashboard")}
          className="mb-6 rounded-xl"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>

        <h1 className="text-3xl font-bold mb-2">Create Donation</h1>
        <p className="text-muted-foreground mb-8">
          Share your leftover food to help those in need
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center justify-between">
            <Label>Anonymous Donation</Label>
            <Switch checked={anonymous} onCheckedChange={(v) => setAnonymous(!!v)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="e.g., Fresh Vegetable Meals"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="h-12 rounded-xl"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the food items..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="min-h-24 rounded-xl resize-none"
              required
            />
          </div>

          {/* Food Type Buttons */}
          <div className="space-y-2">
            <Label>Food Type</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {foodTypes.map(({ value, label, icon: Icon }) => (
                <Button
                  key={value}
                  type="button"
                  variant={formData.foodType === value ? "default" : "outline"}
                  onClick={() => setFormData({ ...formData, foodType: value })}
                  className={cn(
                    "h-20 flex-col gap-2 rounded-xl",
                    formData.foodType === value && "shadow-[0_4px_16px_hsla(16,100%,66%,0.2)]"
                  )}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-xs">{label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Urgency Level */}
          <div className="space-y-2">
            <Label>Urgency Level</Label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: "urgent", label: "Urgent", color: "destructive" },
                { value: "normal", label: "Normal", color: "default" },
                { value: "flexible", label: "Flexible", color: "secondary" },
              ].map(({ value, label }) => (
                <Button
                  key={value}
                  type="button"
                  variant={formData.urgency === value ? "default" : "outline"}
                  onClick={() => setFormData({ ...formData, urgency: value as any })}
                  className="h-12 rounded-xl"
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                placeholder="e.g., 10 servings"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="h-12 rounded-xl"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input
                id="expiryDate"
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                className="h-12 rounded-xl"
                required
              />
            </div>
          </div>

          {/* Location Picker */}
          <LocationPicker
            onLocationSelect={handleLocationSelect}
            currentAddress={formData.pickupAddress}
          />

          <div className="space-y-2">
            <Label htmlFor="pickupCity">City</Label>
            <Input
              id="pickupCity"
              placeholder="City name"
              value={formData.pickupCity}
              onChange={(e) => setFormData({ ...formData, pickupCity: e.target.value })}
              className="h-12 rounded-xl"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pickupTime">Pickup Time</Label>
            <Input
              id="pickupTime"
              type="time"
              value={formData.pickupTime}
              onChange={(e) => setFormData({ ...formData, pickupTime: e.target.value })}
              className="h-12 rounded-xl"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl text-base font-semibold shadow-[0_8px_32px_hsla(16,100%,66%,0.25)]"
          >
            {loading ? "Creating..." : "Create Donation"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CreateDonation;
