
export interface SearchResult {
  title: string;
  snippet: string;
  url: string;
}

export const searchService = {
  searchBing: async (query: string, apiKey: string): Promise<SearchResult[]> => {
    try {
      const response = await fetch(`https://api.bing.microsoft.com/v7.0/search?q=${encodeURIComponent(query)}&count=10`, {
        headers: {
          'Ocp-Apim-Subscription-Key': apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`Bing Search API error: ${response.status}`);
      }

      const data = await response.json();
      const results = data.webPages?.value || [];
      
      return results.map((r: any) => ({
        title: r.name,
        snippet: r.snippet,
        url: r.url
      }));
    } catch (error) {
      console.error("Bing Search Error:", error);
      throw error;
    }
  },

  searchTavily: async (query: string, apiKey: string): Promise<SearchResult[]> => {
    try {
      const response = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          api_key: apiKey,
          query: query,
          search_depth: "basic",
          max_results: 10
        })
      });

      if (!response.ok) {
        throw new Error(`Tavily Search API error: ${response.status}`);
      }

      const data = await response.json();
      const results = data.results || [];
      
      return results.map((r: any) => ({
        title: r.title,
        snippet: r.content,
        url: r.url
      }));
    } catch (error) {
      console.error("Tavily Search Error:", error);
      throw error;
    }
  }
};
