import { supabase } from "@/integrations/supabase/client";

export const useEmailNotifications = () => {
  const sendNotification = async (
    to: string,
    subject: string,
    donationTitle: string,
    message: string,
    actionUrl?: string
  ) => {
    try {
      const { data, error } = await supabase.functions.invoke("send-notification-email", {
        body: {
          to,
          subject,
          donationTitle,
          message,
          actionUrl,
        },
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      console.error("Failed to send notification:", error);
      return { success: false, error: error.message };
    }
  };

  return { sendNotification };
};
