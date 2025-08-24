import { supabase } from "@/integrations/supabase/client";

// Debug function to check current user data
export const debugCurrentUser = async () => {
  try {
    // Get current session
    const { data: session } = await supabase.auth.getSession();
    
    if (!session.session?.user) {
      console.log("No user logged in");
      return;
    }

    const user = session.session.user;
    console.log("=== CURRENT USER DEBUG ===");
    console.log("Auth User ID:", user.id);
    console.log("Email:", user.email);
    console.log("User Metadata:", user.user_metadata);
    console.log("Email Confirmed:", user.email_confirmed_at);
    console.log("Created At:", user.created_at);
    
    // Try to get profile data from profiles table
    console.log("🔍 Checking profiles table...");
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
      
    if (profileError) {
      console.log("❌ Profile Error:", profileError);
      console.log("Error Code:", profileError.code);
      console.log("Error Details:", profileError.details);
      
      // Try to manually create the profile
      console.log("🔧 Attempting to manually create profile...");
      const { data: insertResult, error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
          email: user.email || '',
          role: user.user_metadata?.role || 'team_member',
        } as any) // Type assertion for tables that may not be in TypeScript yet
        .select();
        
      if (insertError) {
        console.log("❌ Manual profile creation failed:", insertError);
      } else {
        console.log("✅ Profile manually created:", insertResult);
      }
    } else {
      console.log("✅ Profile Data:", profile);
    }
    
    // Check if user is admin
    const isAdmin = localStorage.getItem('adminAuthenticated') === 'true';
    const storedRole = localStorage.getItem('userRole');
    console.log("Is Admin (localStorage):", isAdmin);
    console.log("Stored Role (localStorage):", storedRole);
    
    console.log("=== END DEBUG ===");
    
  } catch (error) {
    console.error("Debug error:", error);
  }
};

// Function to view all users (admin only)
export const debugAllUsers = async () => {
  try {
    console.log("=== ALL USERS DEBUG ===");
    
    // This will only work if you've created the profiles table
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.log("Error fetching profiles:", error.message);
      console.log("Make sure you've run the SQL setup in Supabase");
    } else {
      console.log("All User Profiles:", profiles);
    }
    
    console.log("=== END ALL USERS DEBUG ===");
  } catch (error) {
    console.error("Debug error:", error);
  }
};
