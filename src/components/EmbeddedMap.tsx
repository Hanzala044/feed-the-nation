import { MapPin, ExternalLink, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmbeddedMapProps {
  latitude: number | null;
  longitude: number | null;
  address: string;
  city: string;
}

export const EmbeddedMap = ({ latitude, longitude, address, city }: EmbeddedMapProps) => {
  if (!latitude || !longitude) {
    return (
      <div className="w-full h-64 bg-muted rounded-xl flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Location not available</p>
        </div>
      </div>
    );
  }

  // Google Maps embed URL (works without API key)
  const embedUrl = `https://maps.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`;

  // Direct Google Maps link for opening in app/browser
  const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}&z=17`;

  // Directions link (opens directions from user's current location)
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Pickup Location</h3>
        </div>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary hover:underline flex items-center gap-1"
        >
          Open in Maps
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Address Display */}
      <div className="p-4 bg-muted/50 rounded-xl border border-primary/10">
        <p className="text-sm font-medium">{address}</p>
        <p className="text-xs text-muted-foreground mt-1">{city}</p>
      </div>

      {/* Embedded Interactive Map */}
      <div className="relative w-full h-80 md:h-96 rounded-xl overflow-hidden border-2 border-primary/20 shadow-xl">
        <iframe
          src={embedUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Pickup Location Map"
          className="rounded-xl"
        />
        {/* Gradient overlay for better appearance */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/5 to-transparent" />
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Button
          variant="outline"
          onClick={() => window.open(mapsUrl, '_blank')}
          className="rounded-xl flex items-center justify-center gap-2 h-12"
        >
          <MapPin className="w-4 h-4" />
          View Full Map
        </Button>
        <Button
          onClick={() => window.open(directionsUrl, '_blank')}
          className="rounded-xl flex items-center justify-center gap-2 h-12 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] hover:from-[#ff8c42] hover:to-[#ff6b35] text-white shadow-lg"
        >
          <Navigation className="w-4 h-4" />
          Get Directions
        </Button>
      </div>

      {/* Distance Information Helper */}
      <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl">
        <p className="text-xs text-blue-800 dark:text-blue-200">
          💡 <strong>Tip:</strong> Click "Get Directions" to calculate the distance from your current location
          and get turn-by-turn navigation to the pickup point.
        </p>
      </div>

      {/* Coordinates (for debugging/technical users) */}
      <details className="text-xs text-muted-foreground">
        <summary className="cursor-pointer hover:text-foreground transition-colors py-1">
          Show coordinates
        </summary>
        <div className="mt-2 p-3 bg-muted rounded-lg font-mono text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-muted-foreground">Latitude:</span>
              <div className="font-semibold">{latitude.toFixed(6)}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Longitude:</span>
              <div className="font-semibold">{longitude.toFixed(6)}</div>
            </div>
          </div>
        </div>
      </details>
    </div>
  );
};
