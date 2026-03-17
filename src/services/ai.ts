
import { AIResponse } from "../types";

export const aiService = {
  generateContent: async (
    prompt: string, 
    apiKey?: string, 
    baseUrl?: string,
    modelId?: string,
    systemInstruction?: string
  ): Promise<AIResponse> => {
    // Use user-provided key exclusively
    const finalApiKey = apiKey;
    
    if (!finalApiKey) {
      throw new Error("请在设置中配置 API Key。 (API Key is required in Settings)");
    }

    // Default to OpenAI official API if no base URL provided
    const finalBaseUrl = baseUrl?.replace(/\/$/, '') || "https://api.openai.com/v1";
    const finalModelId = modelId || "gpt-3.5-turbo";
    
    try {
      const response = await fetch(`${finalBaseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${finalApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: finalModelId,
          messages: [
            { 
              role: 'system', 
              content: systemInstruction || "You are a helpful writing assistant and expert document designer." 
            },
            { 
              role: 'user', 
              content: prompt 
            }
          ],
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `API 请求失败: ${response.status}`);
      }

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content || "";

      return {
        text,
        layoutSuggestions: [] 
      };
    } catch (error: any) {
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

  generateMovieReview: async (content: string, apiKey?: string, baseUrl?: string, modelId?: string, searchContext?: string): Promise<AIResponse> => {
    const systemInstruction = `
      你是一位资深的电影评论家和短视频解说文案专家。
      你的任务是根据提供的参考资料，为指定的电影创作一份高质量的电影解说文案。
      
      【核心原则】：
      1. 优先使用提供的“参考资料”中的信息。如果资料中包含剧情细节、评价或背景，请务必采纳。
      2. 避免与参考资料冲突。如果参考资料与你的预训练知识有出入，请以参考资料为准。
      3. 保持客观与专业，同时兼具短视频解说的趣味性和节奏感。
      
      【文案结构】：
      文案必须严格遵循以下【三段式】结构：
      1. 【抛出观点】：开篇用一句话或一段话抓住观众，提出一个深刻、新颖或引人深思的观点。
      2. 【叙述剧情】：详细且有节奏地描述电影的核心剧情，注意悬念的设置和情感的起伏。
      3. 【升华主题】：在结尾处对电影的主题进行升华，联系现实生活或人类情感，给观众留下思考的空间。
      
      注意：直接输出解说文案内容，不需要提供任何额外的创作建议或指导。
      使用 Markdown 格式输出。
    `;
    
    const userPrompt = searchContext 
      ? `以下是关于电影《${content}》的最新搜索参考资料（共计最多10篇）：\n\n${searchContext}\n\n请结合以上参考资料，为电影《${content}》创作一份专业的三段式解说文案。`
      : `请为以下内容创作电影解说：\n\n${content}`;
    
    return aiService.generateContent(userPrompt, apiKey, baseUrl, modelId, systemInstruction);
  }
};
