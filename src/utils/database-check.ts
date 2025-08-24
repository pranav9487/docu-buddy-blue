import { supabase } from "@/integrations/supabase/client";

// Function to check if database tables exist and are properly set up
export const verifyDatabaseSetup = async () => {
  console.log("🔍 Checking database setup...");
  
  const checks = {
    profiles: false,
    teams: false,
    team_members: false,
    documents: false,
    trigger: false
  };

  try {
    // Check if profiles table exists and has data structure
    const { data: profilesTest, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, email, role')
      .limit(1);
    
    if (!profilesError) {
      checks.profiles = true;
      console.log("✅ Profiles table exists");
    } else {
      console.log("❌ Profiles table missing:", profilesError.message);
    }

    // Check if teams table exists
    const { data: teamsTest, error: teamsError } = await supabase
      .from('teams')
      .select('id, name, created_by')
      .limit(1);
    
    if (!teamsError) {
      checks.teams = true;
      console.log("✅ Teams table exists");
    } else {
      console.log("❌ Teams table missing:", teamsError.message);
    }

    // Check if team_members table exists
    const { data: membersTest, error: membersError } = await supabase
      .from('team_members')
      .select('id, team_id, user_id')
      .limit(1);
    
    if (!membersError) {
      checks.team_members = true;
      console.log("✅ Team members table exists");
    } else {
      console.log("❌ Team members table missing:", membersError.message);
    }

    // Check if documents table exists
    const { data: docsTest, error: docsError } = await supabase
      .from('documents')
      .select('id, filename, uploaded_by')
      .limit(1);
    
    if (!docsError) {
      checks.documents = true;
      console.log("✅ Documents table exists");
    } else {
      console.log("❌ Documents table missing:", docsError.message);
    }

    // Summary
    const allTablesExist = checks.profiles && checks.teams && checks.team_members && checks.documents;
    
    if (allTablesExist) {
      console.log("🎉 Database setup is complete!");
      return true;
    } else {
      console.log("⚠️  Database setup is incomplete. Please run the SQL setup script in your Supabase dashboard.");
      console.log("📝 Steps to fix:");
      console.log("1. Go to your Supabase dashboard");
      console.log("2. Navigate to SQL Editor");
      console.log("3. Copy and paste the content from supabase/setup.sql");
      console.log("4. Run the SQL script");
      return false;
    }

  } catch (error) {
    console.error("❌ Error checking database setup:", error);
    return false;
  }
};

// Function to test user signup flow
export const testSignupFlow = async () => {
  const { data } = await supabase.auth.getSession();
  if (!data.session?.user) {
    console.log("No user logged in - cannot test signup flow");
    return;
  }

  console.log("🧪 Testing user data flow...");
  
  const user = data.session.user;
  console.log("Auth User:", {
    id: user.id,
    email: user.email,
    metadata: user.user_metadata,
    created_at: user.created_at,
    email_confirmed_at: user.email_confirmed_at
  });

  // Try to get profile
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.log("❌ Profile not found in database:", error.message);
      return false;
    } else {
      console.log("✅ Profile found in database:", profile);
      return true;
    }
  } catch (error) {
    console.log("❌ Error accessing profiles table:", error);
    return false;
  }
};

// Function to fix missing profile for current user
export const fixCurrentUserProfile = async () => {
  const { data } = await supabase.auth.getSession();
  if (!data.session?.user) {
    console.log("No user logged in");
    return false;
  }

  const user = data.session.user;
  console.log("🔧 Fixing profile for user:", user.email);

  try {
    // First check if profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (existingProfile) {
      console.log("✅ Profile already exists:", existingProfile);
      return true;
    }

    // Create the profile
    const { data: newProfile, error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
        email: user.email || '',
        role: user.user_metadata?.role || 'team_member',
      } as any)
      .select()
      .single();

    if (insertError) {
      console.log("❌ Failed to create profile:", insertError);
      return false;
    } else {
      console.log("✅ Profile created successfully:", newProfile);
      return true;
    }

  } catch (error) {
    console.log("❌ Error fixing profile:", error);
    return false;
  }
};
