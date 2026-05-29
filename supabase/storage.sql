-- Run this in Supabase SQL editor to set up storage for employer logos

INSERT INTO storage.buckets (id, name, public)
VALUES ('employer-logos', 'employer-logos', true)
ON CONFLICT DO NOTHING;

CREATE POLICY "Anyone can view employer logos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'employer-logos');

CREATE POLICY "Authenticated employers can upload logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'employer-logos');
