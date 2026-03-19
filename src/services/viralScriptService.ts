import { pb, getPocketBase } from './pocketbase';

export interface ViralScript {
  id?: string;
  title: string;
  content: string;
  category?: string; // 用户可能用这个存“开头”或其他分类信息
  likes_count?: number;
  collects_count?: number;
  created?: string;
  updated?: string;
}

export const viralScriptService = {
  saveViralScript: async (script: Partial<ViralScript>, customUrl?: string) => {
    try {
      const client = customUrl ? getPocketBase(customUrl) : pb;
      
      const data: any = {
        title: script.title || 'Untitled',
        content: script.content || '',
        category: script.category || '',
        likes_count: script.likes_count || 0,
        collects_count: script.collects_count || 0,
      };

      if (script.id) {
        return await client.collection('viral_scripts').update<ViralScript>(script.id, data);
      } else {
        return await client.collection('viral_scripts').create<ViralScript>(data);
      }
    } catch (error: any) {
      if (error.response?.data) {
        console.error('PocketBase validation error:', JSON.stringify(error.response.data, null, 2));
      }
      throw error;
    }
  },

  getViralScripts: async (category?: string) => {
    try {
      const options: any = {
        sort: '-created',
      };
      
      if (category) {
        options.filter = `category = "${category}"`;
      }

      const records = await pb.collection('viral_scripts').getFullList<ViralScript>(options);
      return records;
    } catch (error: any) {
      if (error.isAbort) return [];
      console.error('Error fetching viral scripts:', error);
      throw error;
    }
  },

  getViralScriptById: async (id: string, customUrl?: string) => {
    try {
      const client = customUrl ? getPocketBase(customUrl) : pb;
      return await client.collection('viral_scripts').getOne<ViralScript>(id);
    } catch (error: any) {
      console.error('Error fetching viral script by id:', error);
      throw error;
    }
  },

  searchSimilarScripts: async (queryText: string, limit = 3) => {
    try {
      // PocketBase filter syntax: title ~ "query" || content ~ "query"
      const filter = `title ~ "${queryText}" || content ~ "${queryText}"`;
      const records = await pb.collection('viral_scripts').getList<ViralScript>(1, limit, {
        filter: filter,
        sort: '-created',
      });
      return records.items;
    } catch (error: any) {
      if (error.isAbort) return [];
      console.warn("Search similar scripts failed:", error);
      return [];
    }
  },

  savePost: async (script: Partial<ViralScript>, customUrl?: string) => {
    try {
      const client = customUrl ? getPocketBase(customUrl) : pb;
      
      const data: any = {
        title: script.title || 'Untitled',
        content: script.content || '',
        category: script.category || '',
        likes_count: 0, // 默认不记录点赞
        collects_count: 0, // 默认不记录收藏
      };

      if (script.id) {
        return await client.collection('posts').update<ViralScript>(script.id, data);
      } else {
        return await client.collection('posts').create<ViralScript>(data);
      }
    } catch (error: any) {
      if (error.response?.data) {
        console.error('PocketBase validation error (posts):', JSON.stringify(error.response.data, null, 2));
      }
      throw error;
    }
  },

  getPosts: async () => {
    try {
      const records = await pb.collection('posts').getFullList<ViralScript>({
        sort: '-created',
      });
      return records;
    } catch (error: any) {
      if (error.isAbort) return [];
      console.error('Error fetching posts:', error);
      throw error;
    }
  },

  checkConnection: async () => {
    try {
      // Try to list 1 item to check connectivity
      // Disable auto-cancellation for this specific request to avoid "request was aborted" errors
      await pb.collection('viral_scripts').getList(1, 1, { requestKey: null });
      return true;
    } catch (e: any) {
      // Ignore cancellation errors as they are expected during rapid setting changes
      if (e.isAbort) return false;
      
      console.error('PocketBase connection check failed:', e);
      return false;
    }
  }
};
