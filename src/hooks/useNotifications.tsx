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

  const sendNotification = (title: string, body: string) => {
    if (notificationsEnabled && Notification.permission === "granted") {
      new Notification(title, {
        body,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
      });
    }
  };

  return {
    notificationsEnabled,
    requestPermission,
    sendNotification,
  };
};
