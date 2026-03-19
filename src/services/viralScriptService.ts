import { pb } from './pocketbase';

export interface ViralScript {
  id?: string;
  author?: string; // PocketBase relation field for user ID
  title: string;
  content: string;
  category?: string;
  tags?: string[];
  analysis_notes?: string;
  source_url?: string;
  performance_metrics?: any;
  is_public?: boolean;
  created?: string; // PocketBase uses 'created' instead of 'created_at'
  updated?: string;
}

export const viralScriptService = {
  saveViralScript: async (script: Partial<ViralScript>) => {
    try {
      // If we have an ID, update, otherwise create
      if (script.id) {
        const record = await pb.collection('viral_scripts').update<ViralScript>(script.id, script);
        return record;
      } else {
        // Ensure author is set to current user if not provided
        if (!script.author && pb.authStore.model) {
          script.author = pb.authStore.model.id;
        }
        const record = await pb.collection('viral_scripts').create<ViralScript>(script);
        return record;
      }
    } catch (error) {
      console.error('Error saving viral script:', error);
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
    } catch (error) {
      console.error('Error fetching viral scripts:', error);
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
    } catch (error) {
      console.warn("Search similar scripts failed:", error);
      return [];
    }
  },

  checkConnection: async () => {
    try {
      // Try to list 1 item to check connectivity
      await pb.collection('viral_scripts').getList(1, 1);
      return true;
    } catch (e) {
      console.error('PocketBase connection check failed:', e);
      return false;
    }
  }
};
