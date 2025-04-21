// utils/supabaseClient.js or wherever your file is located
import { createClient } from '@supabase/supabase-js';

// Make sure these environment variables are correctly set in your project
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// For debugging, log these values (remove in production)
console.log("Supabase URL:", supabaseUrl);
console.log("Supabase Anon Key exists:", !!supabaseAnonKey);

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);