-- Drop the view and create a function instead
DROP VIEW IF EXISTS public.donation_analytics;

-- Create function to get donation analytics (only for admins)
CREATE OR REPLACE FUNCTION public.get_donation_analytics()
RETURNS TABLE (
  area TEXT,
  total_donations BIGINT,
  completed_donations BIGINT,
  in_transit_donations BIGINT,
  pending_donations BIGINT,
  unique_donors BIGINT,
  unique_volunteers BIGINT
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    d.pickup_city as area,
    COUNT(*) as total_donations,
    COUNT(CASE WHEN d.status = 'completed' THEN 1 END) as completed_donations,
    COUNT(CASE WHEN d.status = 'in_transit' THEN 1 END) as in_transit_donations,
    COUNT(CASE WHEN d.status = 'pending' THEN 1 END) as pending_donations,
    COUNT(DISTINCT d.donor_id) as unique_donors,
    COUNT(DISTINCT d.volunteer_id) as unique_volunteers
  FROM public.donations d
  WHERE public.has_role(auth.uid(), 'admin')
  GROUP BY d.pickup_city
$$;