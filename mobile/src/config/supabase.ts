import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// Type for environment variables
interface SupabaseConfig {
  url: string;
  anonKey: string;
}

// Get environment variables
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || '';
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database types will be generated later
export type Database = any; // TODO: Generate types from Supabase