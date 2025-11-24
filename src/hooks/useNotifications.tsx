import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useNotifications = (userId: string | undefined) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!userId) return;

    // Check if notifications are supported
    if (!("Notification" in window)) {
      return;
    }

    // Check current permission
    setNotificationsEnabled(Notification.permission === "granted");
  }, [userId]);

  const requestPermission = async () => {
    if (!("Notification" in window)) {
      toast({
        title: "Not supported",
        description: "Push notifications are not supported in your browser",
        variant: "destructive",
      });
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      
      if (permission === "granted") {
        setNotificationsEnabled(true);
        
        // Update user preferences
        if (userId) {
          await supabase
            .from("profiles")
            .update({ notification_enabled: true })
            .eq("id", userId);
        }

        toast({
          title: "Notifications enabled",
          description: "You'll receive alerts for new donations",
        });
        
        return true;
      } else {
        toast({
          title: "Permission denied",
          description: "You can enable notifications in your browser settings",
        });
        return false;
      }
    } catch (error) {
      console.error("Notification permission error:", error);
      return false;
    }
  };

  const sendNotification = async (title: string, body: string) => {
    if (notificationsEnabled && Notification.permission === "granted") {
      // Use service worker notification if available (shows even when app is closed)
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        try {
          const registration = await navigator.serviceWorker.ready;
          await registration.showNotification(title, {
            body,
            icon: "/logo-192.png",
            badge: "/logo-192.png",
            vibrate: [200, 100, 200],
            tag: 'food4u-notification',
            requireInteraction: false,
          });
        } catch (error) {
          console.error('Service worker notification failed:', error);
          // Fallback to regular notification
          new Notification(title, {
            body,
            icon: "/logo-192.png",
            badge: "/logo-192.png",
          });
        }
      } else {
        // Fallback to regular notification
        new Notification(title, {
          body,
          icon: "/logo-192.png",
          badge: "/logo-192.png",
        });
      }
    }
  };

  return {
    notificationsEnabled,
    requestPermission,
    sendNotification,
  };
};
