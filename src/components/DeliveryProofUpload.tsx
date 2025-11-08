import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, Camera, CheckCircle } from "lucide-react";

interface DeliveryProofUploadProps {
  donationId: string;
  userId: string;
  onSuccess?: () => void;
}

export const DeliveryProofUpload = ({
  donationId,
  userId,
  onSuccess,
}: DeliveryProofUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [proofType, setProofType] = useState<"before" | "after">("after");
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${donationId}/${Date.now()}_${proofType}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("delivery-proofs")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("delivery-proofs")
        .getPublicUrl(fileName);

      // Save to database
      const { error: dbError } = await supabase.from("delivery_proofs").insert({
        donation_id: donationId,
        uploaded_by: userId,
        image_url: publicUrl,
        proof_type: proofType,
      });

      if (dbError) throw dbError;

      toast({
        title: "Success!",
        description: "Delivery proof uploaded successfully",
      });

      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="p-6 bg-gradient-card backdrop-blur-xl border-2 border-glassBorder shadow-soft">
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <Camera className="w-6 h-6 text-primary" />
          <h3 className="font-semibold text-lg">Upload Delivery Proof</h3>
        </div>

        <div className="space-y-2">
          <Label>Photo Type</Label>
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              onClick={() => setProofType("before")}
              variant={proofType === "before" ? "default" : "outline"}
              className="h-12 rounded-2xl"
            >
              Before Pickup
            </Button>
            <Button
              type="button"
              onClick={() => setProofType("after")}
              variant={proofType === "after" ? "default" : "outline"}
              className="h-12 rounded-2xl"
            >
              After Delivery
            </Button>
          </div>
        </div>

        <div className="relative">
          <Input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
            id="proof-upload"
          />
          <Label
            htmlFor="proof-upload"
            className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-border rounded-2xl cursor-pointer hover:border-primary/50 hover:bg-accent/50 transition-all"
          >
            {uploading ? (
              <>
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-sm text-muted-foreground">Uploading...</p>
              </>
            ) : (
              <>
                <Upload className="w-10 h-10 text-muted-foreground mb-3" />
                <p className="text-sm font-medium mb-1">Click to upload photo</p>
                <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
              </>
            )}
          </Label>
        </div>

        <div className="flex items-start gap-2 p-4 bg-success/10 border border-success/20 rounded-2xl">
          <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">Why upload photos?</p>
            <ul className="text-xs space-y-1">
              <li>• Verify successful delivery</li>
              <li>• Build trust with donors</li>
              <li>• Increase your rating & badges</li>
            </ul>
          </div>
        </div>
      </div>
    </Card>
  );
};
