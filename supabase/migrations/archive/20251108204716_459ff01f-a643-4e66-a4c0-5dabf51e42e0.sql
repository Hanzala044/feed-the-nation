-- Create storage bucket for delivery proofs
INSERT INTO storage.buckets (id, name, public) 
VALUES ('delivery-proofs', 'delivery-proofs', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for delivery proofs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Anyone can view delivery proofs'
  ) THEN
    CREATE POLICY "Anyone can view delivery proofs"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'delivery-proofs');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Volunteers can upload delivery proofs'
  ) THEN
    CREATE POLICY "Volunteers can upload delivery proofs"
      ON storage.objects FOR INSERT
      WITH CHECK (
        bucket_id = 'delivery-proofs' AND
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid() AND profiles.role = 'volunteer'
        )
      );
  END IF;
END $$;

-- Enable realtime for messages table
DO $$
BEGIN
  EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.messages';
EXCEPTION
  WHEN duplicate_object THEN
    -- Table already added to publication
    NULL;
END $$;