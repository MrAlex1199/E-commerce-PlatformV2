import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

// Create singleton Supabase client
export const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);