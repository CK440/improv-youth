import { createClient } from '@supabase/supabase-js';

// ✅ Use optional chaining to handle missing environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables!');
  throw new Error('Missing Supabase environment variables');
}

// ✅ Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);
