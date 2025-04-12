-- Enable read access for all users (authenticated and anonymous)
CREATE POLICY "Give public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'account-picture');

-- Enable insert/upload capabilities for authenticated users only
CREATE POLICY "Allow authenticated users to upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'account-picture');

-- Enable update for owners
CREATE POLICY "Allow update for owners"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'account-picture' AND auth.uid() = owner); 