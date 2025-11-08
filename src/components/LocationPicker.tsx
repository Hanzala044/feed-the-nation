import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  currentAddress?: string;
}

export const LocationPicker = ({ onLocationSelect, currentAddress }: LocationPickerProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Not supported",
        description: "Geolocation is not supported by your browser",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Use reverse geocoding to get address
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          const address = data.display_name || "Unknown location";
          
          onLocationSelect(latitude, longitude, address);
          toast({
            title: "Location updated",
            description: "Your current location has been set",
          });
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to get address from coordinates",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        setLoading(false);
        toast({
          title: "Location access denied",
          description: "Please allow location access to use this feature",
          variant: "destructive",
        });
      }
    );
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Pickup Location</label>
      <div className="flex gap-2">
        <Input
          value={currentAddress || ""}
          placeholder="Address will appear here"
          readOnly
          className="flex-1 rounded-xl"
        />
        <Button
          type="button"
          onClick={getCurrentLocation}
          disabled={loading}
          variant="outline"
          className="rounded-xl"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <MapPin className="w-4 h-4" />
          )}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Click the location icon to use your current location
      </p>
    </div>
  );
};
