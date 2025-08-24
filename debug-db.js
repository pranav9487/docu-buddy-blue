import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ufpcrpapqluwfyyfmtus.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmcGNycGFwcWx1d2Z5eWZtdHVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwMzEyOTksImV4cCI6MjA3MTYwNzI5OX0.86msSLKf0SL-X9AsDznmXRQRmrdffoCwdYuI44TPzJA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProfiles() {
  console.log('Testing profiles table access...');
  
  // First, let's try to query all profiles
  const { data: allProfiles, error: allError } = await supabase
    .from('profiles')
    .select('*')
    .limit(5);
    
  console.log('All profiles query:');
  console.log('Data:', allProfiles);
  console.log('Error:', allError);
  
  // Now try the specific email query
  const { data: specificProfile, error: specificError } = await supabase
    .from('profiles')
    .select('id, email, full_name')
    .eq('email', 'akshithmarepally111@gmail.com');
    
  console.log('Specific email query:');
  console.log('Data:', specificProfile);
  console.log('Error:', specificError);
  
  // Try a more permissive query
  const { data: likeProfile, error: likeError } = await supabase
    .from('profiles')
    .select('id, email, full_name')
    .ilike('email', '%akshithmarepally111%');
    
  console.log('ILIKE email query:');
  console.log('Data:', likeProfile);
  console.log('Error:', likeError);
}

checkProfiles().catch(console.error);
