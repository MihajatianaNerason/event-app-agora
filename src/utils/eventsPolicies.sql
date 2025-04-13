-- Events Table Policies

-- Enable read access for all users
ALTER POLICY IF EXISTS "Enable read access for all users"
ON public.events FOR SELECT USING (true);

-- Enable insert for authenticated users
ALTER POLICY IF EXISTS "Enable insert for authenticated users only"
ON public.events FOR INSERT TO authenticated
WITH CHECK (true);

-- Enable update for owners
ALTER POLICY IF EXISTS "Enable update for event owners"
ON public.events FOR UPDATE TO authenticated
USING (auth.uid()::text = created_by::text);

-- Enable delete for owners
ALTER POLICY IF EXISTS "Enable delete for event owners"
ON public.events FOR DELETE TO authenticated
USING (auth.uid()::text = created_by::text);

-- Storage Policies for events bucket

-- Enable read access for all users (authenticated and anonymous)
CREATE POLICY IF NOT EXISTS "Give public read access to events"
ON storage.objects FOR SELECT
USING (bucket_id = 'events');

-- Enable insert/upload capabilities for authenticated users only
CREATE POLICY IF NOT EXISTS "Allow authenticated users to upload to events"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'events');

-- Enable update for owners
CREATE POLICY IF NOT EXISTS "Allow update for events objects owners"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'events' AND auth.uid()::text = owner::text);

-- Enable delete for owners
CREATE POLICY IF NOT EXISTS "Allow delete for events objects owners"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'events' AND auth.uid()::text = owner::text); 