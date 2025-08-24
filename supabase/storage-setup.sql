-- Storage setup for document uploads
-- Run this in your Supabase SQL Editor after running setup.sql

-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can upload to own folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can view allowed documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;

-- Create storage policies for the documents bucket

-- Allow authenticated users to upload files to their own folder
CREATE POLICY "Users can upload to own folder" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'documents' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow authenticated users to view their own files and files shared with their teams
CREATE POLICY "Users can view allowed documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'documents' 
    AND (
      -- User can view their own uploads
      auth.uid()::text = (storage.foldername(name))[1]
      OR
      -- User can view files uploaded by team members in their teams
      EXISTS (
        SELECT 1 FROM documents d
        JOIN team_members tm ON d.team_id = tm.team_id
        WHERE d.file_path = name
        AND tm.user_id = auth.uid()
      )
      OR
      -- Admins can view all files
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
      )
    )
  );

-- Allow users to update their own files
CREATE POLICY "Users can update own files" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'documents' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to delete their own files
CREATE POLICY "Users can delete own files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'documents' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow authenticated users to view their own files and files shared with their teams
CREATE POLICY "Users can view allowed documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'documents' 
    AND (
      -- User can view their own uploads
      auth.uid()::text = (storage.foldername(name))[1]
      OR
      -- User can view files uploaded by team members in their teams
      EXISTS (
        SELECT 1 FROM documents d
        JOIN team_members tm ON d.team_id = tm.team_id
        WHERE d.file_path = name
        AND tm.user_id = auth.uid()
      )
      OR
      -- Admins can view all files
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
      )
    )
  );

-- Allow users to update their own files
CREATE POLICY "Users can update own files" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'documents' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to delete their own files
CREATE POLICY "Users can delete own files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'documents' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
