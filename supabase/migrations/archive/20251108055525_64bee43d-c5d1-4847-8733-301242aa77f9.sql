-- Create messages table for in-app chat
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donation_id UUID NOT NULL REFERENCES public.donations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create achievements table for gamification
CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL,
  achievement_name TEXT NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB
);

-- Create delivery_proofs table for photo uploads
CREATE TABLE public.delivery_proofs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donation_id UUID NOT NULL REFERENCES public.donations(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  proof_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add columns to donations for tracking
ALTER TABLE public.donations ADD COLUMN urgency TEXT DEFAULT 'normal';
ALTER TABLE public.donations ADD COLUMN picked_up_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.donations ADD COLUMN delivered_at TIMESTAMP WITH TIME ZONE;

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_proofs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for messages
CREATE POLICY "Users can view their own messages"
ON public.messages FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages"
ON public.messages FOR INSERT
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their received messages"
ON public.messages FOR UPDATE
USING (auth.uid() = receiver_id);

-- RLS Policies for achievements
CREATE POLICY "Users can view all achievements"
ON public.achievements FOR SELECT
USING (true);

CREATE POLICY "System can insert achievements"
ON public.achievements FOR INSERT
WITH CHECK (true);

-- RLS Policies for delivery_proofs
CREATE POLICY "Anyone can view delivery proofs"
ON public.delivery_proofs FOR SELECT
USING (true);

CREATE POLICY "Users can upload delivery proofs"
ON public.delivery_proofs FOR INSERT
WITH CHECK (auth.uid() = uploaded_by);

-- Create indexes for performance
CREATE INDEX idx_messages_donation ON public.messages(donation_id);
CREATE INDEX idx_messages_sender ON public.messages(sender_id);
CREATE INDEX idx_messages_receiver ON public.messages(receiver_id);
CREATE INDEX idx_achievements_user ON public.achievements(user_id);
CREATE INDEX idx_delivery_proofs_donation ON public.delivery_proofs(donation_id);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Create trigger for updated_at on messages
CREATE TRIGGER update_messages_updated_at
BEFORE UPDATE ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();