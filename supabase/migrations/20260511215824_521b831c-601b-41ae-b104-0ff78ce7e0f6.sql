
-- Drop old policies
DROP POLICY IF EXISTS "Users can create parcels" ON public.parcels;
DROP POLICY IF EXISTS "Users can update own parcels" ON public.parcels;
DROP POLICY IF EXISTS "Users can view own parcels" ON public.parcels;

-- Only admins can insert parcels
CREATE POLICY "Admins can create parcels"
ON public.parcels
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can update parcels
CREATE POLICY "Admins can update parcels"
ON public.parcels
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Keep public tracking (already exists: "Anyone can track parcels")
