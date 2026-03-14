
import { GoogleGenAI } from "@google/genai";
import { AIResponse } from "../types";

export const aiService = {
  generateContent: async (
    prompt: string, 
    apiKey?: string, 
    systemInstruction?: string
  ): Promise<AIResponse> => {
    // Priority: User provided key > Env key
    const finalApiKey = apiKey || process.env.GEMINI_API_KEY;
    
    if (!finalApiKey) {
      throw new Error("No API Key provided. Please set it in Settings.");
    }

    const ai = new GoogleGenAI({ apiKey: finalApiKey });
    
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          systemInstruction: systemInstruction || "You are a helpful writing assistant and expert document designer.",
        },
      });

      return {
        text: response.text || "",
        // Placeholder for future layout suggestion extraction
        layoutSuggestions: [] 
      };
    } catch (error) {
      console.error("AI Generation Error:", error);
      throw error;
    }
  },

  // Specific "Layout-First" mode placeholder
  optimizeLayout: async (content: string, apiKey?: string): Promise<AIResponse> => {
    const systemInstruction = `
      Analyze the following Markdown content and suggest structural improvements.
      Focus on:
      1. Hierarchy (H1-H3 distribution)
      2. Visual clarity (using callouts, tables, lists)
      3. Readability
      Return the optimized Markdown.
    `;
    
    return aiService.generateContent(content, apiKey, systemInstruction);
  }
};
