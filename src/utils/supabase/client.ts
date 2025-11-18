import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { supabaseUrl, supabaseAnonKey } from './config';

export const createClient = () => {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    }
  });
};

// 싱글톤 클라이언트
let supabaseInstance: ReturnType<typeof createSupabaseClient> | null = null;

export const getSupabase = () => {
  if (!supabaseInstance) {
    supabaseInstance = createClient();
    console.log('🔧 Supabase client created');
  }
  return supabaseInstance;
};