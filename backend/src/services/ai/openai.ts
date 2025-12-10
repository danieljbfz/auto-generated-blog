import { AIProvider, AIGenerationResult } from '../../types/ai.js';
// import OpenAI from 'openai';

export class OpenAIProvider implements AIProvider {
  name = 'openai';
  
  isAvailable(): boolean {
    return Boolean(process.env.OPENAI_API_KEY);
  }

  async generate(_prompt: string): Promise<AIGenerationResult> {
    // Implementation here
    return {} as AIGenerationResult;
  }
}

export const openai = new OpenAIProvider();