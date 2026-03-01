
-- Create loyalty points table
CREATE TABLE public.loyalty_points (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  points integer NOT NULL DEFAULT 0,
  description text NOT NULL DEFAULT '',
  booking_id uuid REFERENCES public.bookings(id),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.loyalty_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own points" ON public.loyalty_points
  FOR SELECT USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can insert points" ON public.loyalty_points
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage points" ON public.loyalty_points
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Index for fast lookups
CREATE INDEX idx_loyalty_points_user_id ON public.loyalty_points(user_id);
