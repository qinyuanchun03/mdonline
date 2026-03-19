import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ViralScript } from './viralScriptService';

let supabaseInstance: SupabaseClient | null = null;

export const getSupabase = (url?: string, key?: string) => {
  if (supabaseInstance && !url && !key) return supabaseInstance;
  
  const finalUrl = url || import.meta.env.VITE_SUPABASE_URL;
  const finalKey = key || import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  if (!finalUrl || !finalKey) return null;
  
  supabaseInstance = createClient(finalUrl, finalKey);
  return supabaseInstance;
};

export const supabaseService = {
  saveViralScript: async (script: Partial<ViralScript>, url?: string, key?: string) => {
    const supabase = getSupabase(url, key);
    if (!supabase) throw new Error('Supabase is not configured.');
    
    const data: any = {
      title: script.title || 'Untitled',
      content: script.content || '',
      category: script.category || '',
      likes_count: script.likes_count || 0,
      collects_count: script.collects_count || 0,
    };

    if (script.id) {
      const { data: updatedData, error } = await supabase
        .from('viral_scripts')
        .update(data)
        .eq('id', script.id)
        .select();
      if (error) throw error;
      return updatedData[0];
    } else {
      const { data: insertedData, error } = await supabase
        .from('viral_scripts')
        .insert([data])
        .select();
      if (error) throw error;
      return insertedData[0];
    }
  },

  savePost: async (script: Partial<ViralScript>, url?: string, key?: string) => {
    const supabase = getSupabase(url, key);
    if (!supabase) throw new Error('Supabase is not configured.');
    
    const data: any = {
      title: script.title || 'Untitled',
      content: script.content || '',
      category: script.category || '',
      likes_count: 0, // 默认不记录点赞
      collects_count: 0, // 默认不记录收藏
    };

    if (script.id) {
      const { data: updatedData, error } = await supabase
        .from('posts')
        .update(data)
        .eq('id', script.id)
        .select();
      if (error) throw error;
      return updatedData[0];
    } else {
      const { data: insertedData, error } = await supabase
        .from('posts')
        .insert([data])
        .select();
      if (error) throw error;
      return insertedData[0];
    }
  }
};
