import { DeepseekSuggestion } from '../types';

export interface AIProvider {
  name: string;
  getSuggestions(category: string, existingCourses: string[], subCategory?: string): Promise<DeepseekSuggestion[]>;
}

// Perplexity AI Service (has web search capabilities)
export class PerplexityService implements AIProvider {
  name = 'Perplexity AI';
  private apiKey: string;
  private baseUrl = 'https://api.perplexity.ai/chat/completions';

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('Perplexity API key is required');
    }
    this.apiKey = apiKey;
  }

  async getSuggestions(category: string, existingCourses: string[] = [], subCategory?: string): Promise<DeepseekSuggestion[]> {
    try {
      const context = subCategory ? `${category} > ${subCategory}` : category;
      console.log(`PerplexityService: Getting web-based suggestions for ${context}`);
      
      const prompt = this.buildWebSearchPrompt(category, existingCourses, subCategory);
      
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-large-128k-online',
          messages: [
            {
              role: 'system',
              content: 'You are an expert course curator with access to current web information. Use your web search capabilities to find the latest trends, technologies, and market demands in the specified category. Provide course suggestions based on current industry needs and emerging technologies.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.8,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        throw new Error(`Perplexity API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No response content from Perplexity API');
      }

      return this.parseResponse(content, category, subCategory);
    } catch (error) {
      console.error('Error getting suggestions from Perplexity:', error);
      throw error;
    }
  }

  private buildWebSearchPrompt(category: string, existingCourses: string[], subCategory?: string): string {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    const searchContext = subCategory ? `"${category}" category, specifically in the "${subCategory}" subcategory` : `"${category}" category`;
    const suggestionContext = subCategory ? `${category} > ${subCategory}` : category;
    
    return `
      Search the web for the latest trends, technologies, and market demands in the ${searchContext} as of ${currentMonth} ${currentYear}.
      
      Based on your web search findings, suggest 5 innovative and highly relevant courses for the ${suggestionContext}.
      
      ${existingCourses.length > 0 ? `AVOID suggesting courses similar to these existing ones: ${existingCourses.join(', ')}` : ''}
      
      Focus on:
      - Latest industry trends and emerging technologies in ${searchContext} (${currentYear})
      - Current job market demands and skills gaps
      - New tools, frameworks, and methodologies
      - Industry certifications and standards that are trending
      - Technologies that companies are actively hiring for
      
      Search for information about:
      - Latest ${searchContext} job postings and required skills
      - Recent technology releases and updates
      - Industry reports and surveys from ${currentYear} related to ${searchContext}
      - Popular courses on major learning platforms in ${searchContext}
      - Trending topics in ${searchContext} communities and forums
      
      Return ONLY a valid JSON array with this structure:
      [
        {
          "course_name": "Course Title Based on Current Trends",
          "category": "${category}",
          "sub_category": "${subCategory || 'Relevant Current Subcategory'}",
          "course_overview": "Detailed description focusing on current market needs and latest technologies",
          "reasoning": "Explanation based on current web search findings about why this course is in demand"
        }
      ]
      
      Ensure all suggestions are based on current web information and market trends specifically related to ${suggestionContext}.
    `;
  }

  private parseResponse(content: string, category: string, subCategory?: string): DeepseekSuggestion[] {
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No valid JSON array found in response');
      }
      
      const suggestions = JSON.parse(jsonMatch[0]);
      
      if (!Array.isArray(suggestions)) {
        throw new Error('Response is not an array');
      }
      
      return suggestions.map(suggestion => ({
        course_name: suggestion.course_name || '',
        category: suggestion.category || category,
        sub_category: suggestion.sub_category || subCategory || '',
        course_overview: suggestion.course_overview || '',
        reasoning: suggestion.reasoning || ''
      }));
    } catch (error) {
      console.error('Error parsing Perplexity response:', error);
      throw new Error('Failed to parse AI response. Please try again.');
    }
  }
}

// OpenAI with Web Search (using GPT-4 with browsing)
export class OpenAIWebSearchService implements AIProvider {
  name = 'OpenAI with Web Search';
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1/chat/completions';

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('OpenAI API key is required');
    }
    this.apiKey = apiKey;
  }

  async getSuggestions(category: string, existingCourses: string[] = [], subCategory?: string): Promise<DeepseekSuggestion[]> {
    try {
      const context = subCategory ? `${category} > ${subCategory}` : category;
      console.log(`OpenAIWebSearchService: Getting web-based suggestions for ${context}`);
      
      const prompt = this.buildWebSearchPrompt(category, existingCourses, subCategory);
      
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: 'You are an expert course curator with access to current web information. Research the latest trends and market demands to provide highly relevant course suggestions based on current industry needs.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.8,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No response content from OpenAI API');
      }

      return this.parseResponse(content, category, subCategory);
    } catch (error) {
      console.error('Error getting suggestions from OpenAI:', error);
      throw error;
    }
  }

  private buildWebSearchPrompt(category: string, existingCourses: string[], subCategory?: string): string {
    const currentYear = new Date().getFullYear();
    const searchContext = subCategory ? `"${category}" category, specifically in the "${subCategory}" subcategory` : `"${category}" category`;
    const suggestionContext = subCategory ? `${category} > ${subCategory}` : category;
    
    return `
      Research the latest trends and market demands in the ${searchContext} for ${currentYear}.
      
      Based on current industry information, suggest 5 innovative courses for ${suggestionContext}.
      
      ${existingCourses.length > 0 ? `AVOID suggesting courses similar to: ${existingCourses.join(', ')}` : ''}
      
      Focus on:
      - Current job market trends and in-demand skills in ${searchContext}
      - Latest technology releases and updates
      - Emerging tools and frameworks
      - Industry certifications gaining popularity
      - Skills gaps identified in recent industry reports
      
      Return ONLY a valid JSON array:
      [
        {
          "course_name": "Course Title",
          "category": "${category}",
          "sub_category": "${subCategory || 'Subcategory'}",
          "course_overview": "Detailed description",
          "reasoning": "Why this course is currently in demand"
        }
      ]
    `;
  }

  private parseResponse(content: string, category: string, subCategory?: string): DeepseekSuggestion[] {
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No valid JSON array found in response');
      }
      
      const suggestions = JSON.parse(jsonMatch[0]);
      
      if (!Array.isArray(suggestions)) {
        throw new Error('Response is not an array');
      }
      
      return suggestions.map(suggestion => ({
        course_name: suggestion.course_name || '',
        category: suggestion.category || category,
        sub_category: suggestion.sub_category || subCategory || '',
        course_overview: suggestion.course_overview || '',
        reasoning: suggestion.reasoning || ''
      }));
    } catch (error) {
      console.error('Error parsing OpenAI response:', error);
      throw new Error('Failed to parse AI response. Please try again.');
    }
  }
}

// Fallback to original Deepseek service
export class DeepseekService implements AIProvider {
  name = 'Deepseek AI';
  private apiKey: string;
  private baseUrl = 'https://api.deepseek.com/v1/chat/completions';

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('Deepseek API key is required');
    }
    this.apiKey = apiKey;
  }

  async getSuggestions(category: string, existingCourses: string[] = [], subCategory?: string): Promise<DeepseekSuggestion[]> {
    try {
      const context = subCategory ? `${category} > ${subCategory}` : category;
      console.log(`DeepseekService: Getting suggestions for ${context}`);
      const prompt = this.buildPrompt(category, existingCourses, subCategory);
      
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: 'You are an expert course curator. Provide diverse and innovative course suggestions. Use creative thinking to suggest unique courses that don\'t overlap with existing ones.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.9, // Higher temperature for more creativity
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        throw new Error(`Deepseek API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No response content from Deepseek API');
      }

      return this.parseResponse(content, category, subCategory);
    } catch (error) {
      console.error('Error getting suggestions from Deepseek:', error);
      throw error;
    }
  }

  private buildPrompt(category: string, existingCourses: string[], subCategory?: string): string {
    const suggestionContext = subCategory ? `${category} > ${subCategory}` : category;
    
    return `
      Suggest 5 highly innovative and unique courses for ${suggestionContext}.
      
      ${existingCourses.length > 0 ? `COMPLETELY AVOID these existing courses: ${existingCourses.join(', ')}` : ''}
      
      Be extremely creative and suggest courses that:
      - Cover emerging and cutting-edge topics in ${suggestionContext}
      - Address future industry needs
      - Combine multiple disciplines
      - Focus on practical, hands-on skills
      - Are completely different from existing courses
      ${subCategory ? `- Are specifically relevant to the "${subCategory}" subcategory within "${category}"` : ''}
      
      Return ONLY a valid JSON array:
      [
        {
          "course_name": "Unique Course Title",
          "category": "${category}",
          "sub_category": "${subCategory || 'Innovative Subcategory'}",
          "course_overview": "Detailed description of unique learning outcomes",
          "reasoning": "Why this innovative course is valuable"
        }
      ]
    `;
  }

  private parseResponse(content: string, category: string, subCategory?: string): DeepseekSuggestion[] {
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No valid JSON array found in response');
      }
      
      const suggestions = JSON.parse(jsonMatch[0]);
      
      if (!Array.isArray(suggestions)) {
        throw new Error('Response is not an array');
      }
      
      return suggestions.map(suggestion => ({
        course_name: suggestion.course_name || '',
        category: suggestion.category || category,
        sub_category: suggestion.sub_category || subCategory || '',
        course_overview: suggestion.course_overview || '',
        reasoning: suggestion.reasoning || ''
      }));
    } catch (error) {
      console.error('Error parsing Deepseek response:', error);
      throw new Error('Failed to parse AI response. Please try again.');
    }
  }
}

// Main AI Recommendation Service that manages multiple providers
export class AIRecommendationService {
  private providers: AIProvider[] = [];
  private currentProviderIndex = 0;

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders() {
    // Initialize providers based on available API keys
    const perplexityKey = import.meta.env.VITE_PERPLEXITY_API_KEY;
    const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;
    const deepseekKey = import.meta.env.VITE_DEEPSEEK_API_KEY;

    if (perplexityKey) {
      this.providers.push(new PerplexityService(perplexityKey));
      console.log('Initialized Perplexity AI service with web search');
    }

    if (openaiKey) {
      this.providers.push(new OpenAIWebSearchService(openaiKey));
      console.log('Initialized OpenAI service with web search');
    }

    if (deepseekKey) {
      this.providers.push(new DeepseekService(deepseekKey));
      console.log('Initialized Deepseek AI service');
    }

    if (this.providers.length === 0) {
      throw new Error('No AI providers configured. Please set at least one API key: VITE_PERPLEXITY_API_KEY, VITE_OPENAI_API_KEY, or VITE_DEEPSEEK_API_KEY');
    }
  }

  async getSuggestions(category: string, existingCourses: string[] = [], subCategory?: string): Promise<{
    suggestions: DeepseekSuggestion[];
    provider: string;
  }> {
    if (this.providers.length === 0) {
      throw new Error('No AI providers available');
    }

    // Rotate through providers to get diverse suggestions
    const provider = this.providers[this.currentProviderIndex];
    this.currentProviderIndex = (this.currentProviderIndex + 1) % this.providers.length;

    console.log(`Using ${provider.name} for suggestions (provider ${this.currentProviderIndex + 1}/${this.providers.length})`);

    try {
      const suggestions = await provider.getSuggestions(category, existingCourses, subCategory);
      return {
        suggestions,
        provider: provider.name
      };
    } catch (error) {
      console.error(`Error with ${provider.name}:`, error);
      
      // Try next provider if current one fails
      if (this.providers.length > 1) {
        console.log(`Trying next provider...`);
        const nextProvider = this.providers[this.currentProviderIndex];
        const suggestions = await nextProvider.getSuggestions(category, existingCourses, subCategory);
        return {
          suggestions,
          provider: nextProvider.name
        };
      }
      
      throw error;
    }
  }

  getAvailableProviders(): string[] {
    return this.providers.map(p => p.name);
  }
}