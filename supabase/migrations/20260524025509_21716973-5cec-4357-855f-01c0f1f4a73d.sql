
-- 1) PARCELS: remove public read; allow owners + admins; provide safe public tracking RPC
DROP POLICY IF EXISTS "Anyone can track parcels" ON public.parcels;

CREATE POLICY "Senders can view own parcels"
  ON public.parcels FOR SELECT
  TO authenticated
  USING (auth.uid() = sender_id OR has_role(auth.uid(), 'admin'::app_role));

-- Safe tracking function: returns only non-sensitive fields by tracking code
CREATE OR REPLACE FUNCTION public.track_parcel(_tracking_code text)
RETURNS TABLE (
  tracking_code text,
  status text,
  origin text,
  destination text,
  weight_kg numeric,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tracking_code, status, origin, destination, weight_kg, created_at, updated_at
  FROM public.parcels
  WHERE tracking_code = upper(trim(_tracking_code))
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.track_parcel(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.track_parcel(text) TO anon, authenticated;

-- 2) SEAT_LOCKS: hide expired locks
DROP POLICY IF EXISTS "Anyone can view seat locks" ON public.seat_locks;
DROP POLICY IF EXISTS "Public can view seat locks" ON public.seat_locks;

CREATE POLICY "Anyone can view active seat locks"
  ON public.seat_locks FOR SELECT
  TO authenticated
  USING (expires_at > now());

CREATE POLICY "Public can view active seat locks"
  ON public.seat_locks FOR SELECT
  TO anon
  USING (expires_at > now());

-- 3) Tighten SECURITY DEFINER function executability
-- Trigger-only functions: revoke from anon/authenticated
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at() FROM PUBLIC, anon, authenticated;
-- has_role is used inside RLS; revoke from anon since anon never needs to call it directly,
-- keep for authenticated so RLS evaluations work
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;

-- 4) STORAGE: restrict listing on bus-images bucket to admins.
-- Public URLs continue to work because public buckets serve files directly via CDN.
DROP POLICY IF EXISTS "Public can view bus images" ON storage.objects;

CREATE POLICY "Admins can list bus images"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'bus-images' AND has_role(auth.uid(), 'admin'::app_role));
