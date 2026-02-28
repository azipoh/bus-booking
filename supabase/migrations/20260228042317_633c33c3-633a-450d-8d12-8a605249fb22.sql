
-- Add image_url column to buses
ALTER TABLE public.buses ADD COLUMN IF NOT EXISTS image_url text DEFAULT '';

-- Create storage bucket for bus images
INSERT INTO storage.buckets (id, name, public) VALUES ('bus-images', 'bus-images', true)
ON CONFLICT (id) DO NOTHING;

-- Public read access for bus images
CREATE POLICY "Public can view bus images"
ON storage.objects FOR SELECT
USING (bucket_id = 'bus-images');

-- Admins can upload bus images
CREATE POLICY "Admins can upload bus images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'bus-images' AND public.has_role(auth.uid(), 'admin'));

-- Admins can update bus images
CREATE POLICY "Admins can update bus images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'bus-images' AND public.has_role(auth.uid(), 'admin'));

-- Admins can delete bus images
CREATE POLICY "Admins can delete bus images"
ON storage.objects FOR DELETE
USING (bucket_id = 'bus-images' AND public.has_role(auth.uid(), 'admin'));
