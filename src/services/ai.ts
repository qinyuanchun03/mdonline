
import { GoogleGenAI } from "@google/genai";
import { AIResponse } from "../types";

export const aiService = {
  generateContent: async (
    prompt: string, 
    apiKey?: string, 
    baseUrl?: string,
    modelId?: string,
    systemInstruction?: string
  ): Promise<AIResponse> => {
    // Priority: User provided key > Env key
    const finalApiKey = apiKey || process.env.GEMINI_API_KEY;
    
    if (!finalApiKey) {
      throw new Error("No API Key provided. Please set it in Settings.");
    }

    const ai = new GoogleGenAI({ 
      apiKey: finalApiKey,
      baseUrl: baseUrl || undefined
    } as any);
    
    try {
      const response = await ai.models.generateContent({
        model: modelId || "gemini-3-flash-preview",
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
  optimizeLayout: async (content: string, apiKey?: string, baseUrl?: string, modelId?: string): Promise<AIResponse> => {
    const systemInstruction = `
      Analyze the following Markdown content and suggest structural improvements.
      Focus on:
      1. Hierarchy (H1-H3 distribution)
      2. Visual clarity (using callouts, tables, lists)
      3. Readability
      Return the optimized Markdown.
    `;
    
    return aiService.generateContent(content, apiKey, baseUrl, modelId, systemInstruction);
  },

  generateMovieReview: async (content: string, apiKey?: string, baseUrl?: string, modelId?: string): Promise<AIResponse> => {
    const systemInstruction = `
      你是一位资深的电影评论家和短视频解说文案专家。
      请根据用户提供的电影信息或内容，创作一份电影解说文案。
      文案必须严格遵循以下结构：
      1. 【抛出观点】：开篇用一句话或一段话抓住观众，提出一个深刻、新颖或引人深思的观点。
      2. 【叙述剧情】：详细且有节奏地描述电影的核心剧情，注意悬念的设置和情感的起伏。
      3. 【升华主题】：在结尾处对电影的主题进行升华，联系现实生活或人类情感，给观众留下思考的空间。
      
      此外，请在文案之后提供【创作指导】，针对该文案的剪辑风格、配乐建议、语气语调等给出专业建议。
      使用 Markdown 格式输出。
    `;
    
    return aiService.generateContent(`请为以下内容创作电影解说：\n\n${content}`, apiKey, baseUrl, modelId, systemInstruction);
  }
};
