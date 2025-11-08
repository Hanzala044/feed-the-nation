import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type Message = Database["public"]["Tables"]["messages"]["Row"];

interface DonationMessagingProps {
  donationId: string;
  currentUserId: string;
  otherUserId: string;
  otherUserName: string;
}

export const DonationMessaging = ({
  donationId,
  currentUserId,
  otherUserId,
  otherUserName,
}: DonationMessagingProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchMessages();

    const channel = supabase
      .channel(`messages-${donationId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `donation_id=eq.${donationId}`,
        },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [donationId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchMessages = async () => {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("donation_id", donationId)
      .order("created_at", { ascending: true });

    if (data) {
      setMessages(data);
      markAsRead(data);
    }
  };

  const markAsRead = async (msgs: Message[]) => {
    const unreadIds = msgs
      .filter((m) => m.receiver_id === currentUserId && !m.is_read)
      .map((m) => m.id);

    if (unreadIds.length > 0) {
      await supabase
        .from("messages")
        .update({ is_read: true })
        .in("id", unreadIds);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase.from("messages").insert({
        donation_id: donationId,
        sender_id: currentUserId,
        receiver_id: otherUserId,
        message: newMessage.trim(),
      });

      if (error) throw error;

      setNewMessage("");
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
    <Card className="flex flex-col h-[400px]">
      <div className="p-4 border-b flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Chat with {otherUserName}</h3>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-8">
              No messages yet. Start the conversation!
            </p>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender_id === currentUserId
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                    message.sender_id === currentUserId
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm">{message.message}</p>
                  <p className="text-[10px] opacity-70 mt-1">
                    {new Date(message.created_at || "").toLocaleTimeString(
                      "en-US",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t flex gap-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
          className="flex-1"
          disabled={loading}
        />
        <Button
          onClick={sendMessage}
          disabled={loading || !newMessage.trim()}
          size="icon"
          className="rounded-xl"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
};
