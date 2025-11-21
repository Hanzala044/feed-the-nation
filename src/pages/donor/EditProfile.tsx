import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { authClient } from "@/integrations/supabase/authClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, User, Mail, Phone, MapPin, FileText, Camera, Upload } from "lucide-react";

export default function EditDonorProfile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    address: "",
    bio: "",
    avatar_url: "",
  });
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 2MB",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);

      // Convert image to base64 and store directly in database
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        setFormData({ ...formData, avatar_url: base64String });

        toast({
          title: "Photo uploaded!",
          description: "Your profile photo has been uploaded successfully",
        });
        setUploading(false);
      };

      reader.onerror = () => {
        toast({
          title: "Upload failed",
          description: "Failed to read the image file",
          variant: "destructive",
        });
        setUploading(false);
      };

      reader.readAsDataURL(file);
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
      setUploading(false);
    }
  };

  const loadProfile = async () => {
    try {
      const { data: { session } } = await authClient.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      setUserId(session.user.id);

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error) throw error;

      if (profile) {
        setFormData({
          full_name: profile.full_name || "",
          email: profile.email || "",
          phone: profile.phone || "",
          address: profile.address || "",
          bio: profile.bio || "",
          avatar_url: profile.avatar_url || "",
        });
        if (profile.avatar_url) {
          setImagePreview(profile.avatar_url);
        }
      }
    } catch (error: any) {
      toast({
        title: "Error loading profile",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    try {
      setLoading(true);

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          address: formData.address,
          bio: formData.bio,
          avatar_url: formData.avatar_url,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) throw error;

      toast({
        title: "Profile Updated!",
        description: "Your profile has been successfully updated.",
      });

      navigate("/donor/dashboard");
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <Button
          onClick={() => navigate("/donor/dashboard")}
          variant="ghost"
          className="mb-6 hover:bg-orange-100 dark:hover:bg-gray-700"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <Card className="p-8 shadow-2xl border-orange-200 dark:border-gray-700">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Edit Your Profile
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Update your personal information and contact details
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Photo Upload */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-xl border-4 border-white dark:border-gray-700">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-16 h-16 text-white" />
                  )}
                </div>
                <label
                  htmlFor="photo-upload"
                  className="absolute bottom-0 right-0 w-10 h-10 bg-orange-500 hover:bg-orange-600 rounded-full flex items-center justify-center cursor-pointer shadow-lg transition-all group-hover:scale-110"
                >
                  <Camera className="w-5 h-5 text-white" />
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 text-center">
                {uploading ? "Uploading..." : "Click camera to upload photo (max 2MB)"}
              </p>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <User className="inline-block w-4 h-4 mr-2" />
                Full Name
              </label>
              <Input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
                className="w-full"
              />
            </div>

            {/* Email (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Mail className="inline-block w-4 h-4 mr-2" />
                Email Address
              </label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                disabled
                className="w-full bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Email cannot be changed
              </p>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Phone className="inline-block w-4 h-4 mr-2" />
                Phone Number
              </label>
              <Input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
                className="w-full"
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <MapPin className="inline-block w-4 h-4 mr-2" />
                Address
              </label>
              <Input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter your complete address"
                className="w-full"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <FileText className="inline-block w-4 h-4 mr-2" />
                Bio / About You
              </label>
              <Textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell us a little about yourself and why you want to donate food..."
                rows={5}
                className="w-full resize-none"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                This helps volunteers know more about you
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 rounded-xl shadow-lg"
              >
                <Save className="mr-2 h-4 w-4" />
                {loading ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/donor/dashboard")}
                className="px-8"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
