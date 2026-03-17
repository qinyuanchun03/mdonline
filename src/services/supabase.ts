import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

export const getSupabase = () => {
  if (supabaseInstance) return supabaseInstance;

  const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
  const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.');
    return null;
  }

  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  return supabaseInstance;
};

export interface ViralScript {
  id?: string;
  creator_id?: string;
  title: string;
  content: string;
  category?: string;
  tags?: string[];
  analysis_notes?: string;
  source_url?: string;
  performance_metrics?: any;
  is_public?: boolean;
  created_at?: string;
}

export const viralScriptService = {
  saveViralScript: async (script: ViralScript) => {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your secrets.');

    const { data, error } = await supabase
      .from('viral_scripts')
      .insert([script])
      .select();
    
    if (error) throw error;
    return data;
  },

  getViralScripts: async (category?: string) => {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your secrets.');

    let query = supabase.from('viral_scripts').select('*').order('created_at', { ascending: false });
    if (category) {
      query = query.eq('category', category);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  checkConnection: async () => {
    const supabase = getSupabase();
    if (!supabase) return false;

    try {
      // Try a simple query to check connectivity and RLS
      // We use a limit(0) to minimize data transfer
      const { error } = await supabase.from('viral_scripts').select('id').limit(0);
      return !error;
    } catch (e) {
      return false;
    }
  }
};
