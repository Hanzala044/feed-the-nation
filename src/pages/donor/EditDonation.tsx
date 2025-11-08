import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { z } from "zod";

const donationSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  foodType: z.string().min(2, "Food type is required"),
  quantity: z.string().min(1, "Quantity is required"),
  expiryDate: z.string(),
  pickupAddress: z.string().min(5, "Address is required"),
  pickupCity: z.string().min(2, "City is required"),
  pickupTime: z.string(),
});

const EditDonation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    foodType: "",
    quantity: "",
    expiryDate: "",
    pickupAddress: "",
    pickupCity: "",
    pickupTime: "",
  });

  useEffect(() => {
    const fetchDonation = async () => {
      if (!id) return;

      const { data, error } = await supabase
        .from("donations")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        toast({
          title: "Error",
          description: "Failed to load donation",
          variant: "destructive",
        });
        navigate("/donor/dashboard");
        return;
      }

      setFormData({
        title: data.title,
        description: data.description,
        foodType: data.food_type,
        quantity: data.quantity,
        expiryDate: data.expiry_date,
        pickupAddress: data.pickup_address,
        pickupCity: data.pickup_city,
        pickupTime: data.pickup_time,
      });
    };

    fetchDonation();
  }, [id, navigate, toast]);

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

      const { error } = await supabase
        .from("donations")
        .update({
          title: formData.title,
          description: formData.description,
          food_type: formData.foodType,
          quantity: formData.quantity,
          expiry_date: formData.expiryDate,
          pickup_address: formData.pickupAddress,
          pickup_city: formData.pickupCity,
          pickup_time: formData.pickupTime,
        })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Donation updated successfully",
      });

      navigate("/donor/dashboard");
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
      <div className="px-6 py-8 max-w-md mx-auto">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/donor/dashboard")}
          className="mb-6 rounded-xl"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>

        <h1 className="text-3xl font-bold mb-2">Edit Donation</h1>
        <p className="text-muted-foreground mb-8">
          Update your donation details
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
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
              className="min-h-24 rounded-xl"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="foodType">Food Type</Label>
              <Input
                id="foodType"
                placeholder="e.g., Cooked"
                value={formData.foodType}
                onChange={(e) => setFormData({ ...formData, foodType: e.target.value })}
                className="h-12 rounded-xl"
                required
              />
            </div>

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
          </div>

          <div className="grid grid-cols-2 gap-4">
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="pickupAddress">Pickup Address</Label>
            <Input
              id="pickupAddress"
              placeholder="Street address"
              value={formData.pickupAddress}
              onChange={(e) => setFormData({ ...formData, pickupAddress: e.target.value })}
              className="h-12 rounded-xl"
              required
            />
          </div>

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

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl text-base font-semibold shadow-[0_8px_32px_hsla(16,100%,66%,0.25)]"
          >
            {loading ? "Updating..." : "Update Donation"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default EditDonation;
