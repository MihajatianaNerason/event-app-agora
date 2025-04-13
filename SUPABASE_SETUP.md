# Supabase Setup Instructions

This document provides instructions for setting up the required Supabase policies and buckets for the Agora application.

## Storage Bucket Setup

The application requires the following storage buckets:

1. `account-picture` - For user profile pictures
2. `events` - For event images

The application will attempt to create these buckets automatically on startup, but you may need to set up the policies manually.

## Row-Level Security (RLS) Policies

### Events Table Policies

Apply the following policies to the `events` table in the Supabase SQL Editor:

```sql
-- Enable read access for all users
CREATE POLICY "Enable read access for all users"
ON public.events FOR SELECT USING (true);

-- Enable insert for authenticated users
CREATE POLICY "Enable insert for authenticated users only"
ON public.events FOR INSERT TO authenticated
WITH CHECK (true);

-- Enable update for owners
CREATE POLICY "Enable update for event owners"
ON public.events FOR UPDATE TO authenticated
USING (auth.uid()::text = created_by::text);

-- Enable delete for owners
CREATE POLICY "Enable delete for event owners"
ON public.events FOR DELETE TO authenticated
USING (auth.uid()::text = created_by::text);
```

### Storage Policies for the Events Bucket

Apply the following policies to the storage objects in the Supabase SQL Editor:

```sql
-- Enable read access for all users (authenticated and anonymous)
CREATE POLICY "Give public read access to events"
ON storage.objects FOR SELECT
USING (bucket_id = 'events');

-- Enable insert/upload capabilities for authenticated users only
CREATE POLICY "Allow authenticated users to upload to events"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'events');

-- Enable update for owners
CREATE POLICY "Allow update for events objects owners"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'events' AND auth.uid()::text = owner::text);

-- Enable delete for owners
CREATE POLICY "Allow delete for events objects owners"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'events' AND auth.uid()::text = owner::text);
```

## Applying Policies

You can apply all policies at once by copying the content of the `src/utils/eventsPolicies.sql` file and executing it in the Supabase SQL Editor.

## Troubleshooting

If you encounter permissions errors like:

```
Error uploading event image: Object { statusCode: "403", error: "Unauthorized", message: "new row violates row-level security policy" }
```

It means that the storage bucket or its policies are not properly set up. Follow the instructions above to fix the issue.

## Checking Current Policies

You can check the current policies with the following SQL commands:

```sql
-- Check table policies
SELECT * FROM pg_policies WHERE tablename = 'events';

-- Check storage policies
SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';
```
