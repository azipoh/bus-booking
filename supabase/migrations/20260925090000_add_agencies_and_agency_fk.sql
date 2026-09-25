-- 1. Create agencies table
CREATE TABLE IF NOT EXISTS public.agencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    contact_email TEXT,
    contact_phone TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- 2. Add agency_id to buses (optional) so buses can belong to agencies
ALTER TABLE public.buses
ADD COLUMN IF NOT EXISTS agency_id UUID REFERENCES public.agencies(id) ON DELETE
SET NULL;
-- 3. Add agency_id to schedules so schedules can be tied to an agency
ALTER TABLE public.schedules
ADD COLUMN IF NOT EXISTS agency_id UUID REFERENCES public.agencies(id) ON DELETE
SET NULL;
-- 4. Add agency_id to bookings to record which agency the booking was for
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS agency_id UUID REFERENCES public.agencies(id) ON DELETE
SET NULL;
-- 5. Update triggers to refresh updated_at when agencies change
CREATE TRIGGER IF NOT EXISTS update_agencies_updated_at BEFORE
UPDATE ON public.agencies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
-- 6. Expose agencies to anon/authenticated users via RLS
ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view agencies" ON public.agencies FOR
SELECT TO anon USING (active = true);
CREATE POLICY "Admins can manage agencies" ON public.agencies FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
-- 7. Seed example agencies (idempotent)
INSERT INTO public.agencies (name, code, contact_email, contact_phone, active)
VALUES (
        'Moghamo Transport',
        'MOG',
        'ops@moghamo.com',
        '+10000000001',
        true
    ),
    (
        'BlueLine Travels',
        'BLU',
        'info@blueline.com',
        '+10000000002',
        true
    ),
    (
        'Greenway Lines',
        'GRN',
        'contact@greenway.com',
        '+10000000003',
        true
    ) ON CONFLICT (code) DO NOTHING;