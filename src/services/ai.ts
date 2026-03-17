
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

  generateMovieReview: async (content: string, apiKey?: string, baseUrl?: string, modelId?: string, searchContext?: string, viralContext?: string): Promise<AIResponse> => {
    const systemInstruction = `
      你是一位【说书型幽默影评人】和资深短视频解说专家。
      你的解说风格：风趣幽默、绘声绘色、像说书一样引人入胜，擅长用接地气的比喻和犀利的吐槽。
      
      你的任务是根据提供的参考资料和爆款库案例，为指定的电影创作一份高质量、长篇幅的电影解说文案。
      
      【核心原则】：
      1. **说书人风格**：开篇要有气势，中间要有包袱，结尾要有余韵。多用“话说”、“您各位瞧好了”、“咱就说”等口语化表达。
      2. **篇幅充实**：不要吝啬笔墨，尽量多写，把故事讲透，把道理讲深。
      3. **爆款摸底与独特视角**：
         - 如果提供了“爆款库参考”，请分析其成功的基调（是悬疑感强、还是情感共鸣深）。
         - **关键**：在保持爆款基调的基础上，必须寻找一个【独特的角度】进行切入。不要完全照搬，要给观众新鲜感。
      4. **优先参考**：优先使用提供的“搜索参考资料”中的事实信息。
      5. **标注引用**：在引用参考资料的具体观点或事实时，请在文中使用 [1], [2] 这种格式进行标注。
      
      【文案结构】：
      文案必须严格遵循以下结构，并保持极佳的节奏感：
      1. 【惊艳开场】：用一个幽默的段子或一个极具冲击力的独特视角瞬间抓住观众，定下全篇基调。
      2. 【深度剧情拆解】：重点。大幅扩展剧情描述。写细节、写冲突、写人物的微表情。用说书的方式串联，注意埋伏笔和抖包袱。
      3. 【灵魂升华】：结尾处进行深度升华。多写一些对人性、社会或生活的感悟。用感性且富有哲理的语言，让观众在笑完之后能心里“咯噔”一下。
      
      注意：直接输出解说文案内容，使用 Markdown 格式。
    `;
    
    let userPrompt = "";
    if (viralContext) {
      userPrompt += `【爆款库参考（用于风格摸底）】：\n${viralContext}\n\n`;
    }
    if (searchContext) {
      userPrompt += `【搜索参考资料（用于事实依据）】：\n${searchContext}\n\n`;
    }
    userPrompt += `请结合以上资料，为电影《${content}》创作一份专业、幽默且视角独特的长篇说书式解说文案。`;
    
    return aiService.generateContent(userPrompt, apiKey, baseUrl, modelId, systemInstruction);
  }
};
