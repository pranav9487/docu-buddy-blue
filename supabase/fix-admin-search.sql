-- Fix for admin user search - Add policy to allow admins to view all profiles
-- Run this in your Supabase SQL Editor

-- Drop the policy if it exists first
DROP POLICY IF EXISTS "Admins can view all profiles for user search" ON profiles;

-- Add policy to allow admins to view all profiles for user search
CREATE POLICY "Admins can view all profiles for user search" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles admin_profile
      WHERE admin_profile.id = auth.uid() 
      AND admin_profile.role = 'admin'
    )
  );
