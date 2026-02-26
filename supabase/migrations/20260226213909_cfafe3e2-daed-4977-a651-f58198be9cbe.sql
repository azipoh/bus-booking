
-- Create parcels table
CREATE TABLE public.parcels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL,
  tracking_code TEXT NOT NULL UNIQUE,
  sender_name TEXT NOT NULL,
  sender_phone TEXT NOT NULL DEFAULT '',
  recipient_name TEXT NOT NULL,
  recipient_phone TEXT NOT NULL DEFAULT '',
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  weight_kg NUMERIC NOT NULL DEFAULT 0,
  fare NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  schedule_id UUID REFERENCES public.schedules(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.parcels ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can create parcels"
ON public.parcels FOR INSERT
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can view own parcels"
ON public.parcels FOR SELECT
USING (auth.uid() = sender_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can update own parcels"
ON public.parcels FOR UPDATE
USING (auth.uid() = sender_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete parcels"
ON public.parcels FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Anyone can track a parcel by tracking code (public read for tracking)
CREATE POLICY "Anyone can track parcels"
ON public.parcels FOR SELECT
USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_parcels_updated_at
BEFORE UPDATE ON public.parcels
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();
