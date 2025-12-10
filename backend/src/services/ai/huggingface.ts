import axios, { AxiosError, AxiosResponse } from 'axios';
import { AIProvider, AIGenerationResult } from '../../types/ai.js';
import { GENERATION_CONFIG, HUGGINGFACE_CONFIG, RETRY_CONFIG } from '../../config/ai.js';
import { env } from '../../config/env.js';
import logger from '../../utils/logger.js';

/**
 * HuggingFace provider implementation
 * 
 * Uses the new HuggingFace Router API with chat completions format.
 */
export class HuggingFaceProvider implements AIProvider {
  name = 'huggingface';
  
  private model = env.HUGGINGFACE_MODEL;
  private apiUrl = 'https://router.huggingface.co/v1/chat/completions';

  /**
   * Check if the provider is available
   * 
   * @returns True if the provider can be used
   */
  isAvailable(): boolean {
    return Boolean(env.HUGGINGFACE_API_KEY);
  }
  
  /**
   * Generate text
   * 
   * @param prompt - The generation prompt
   */
  async generate(prompt: string): Promise<AIGenerationResult> {
    const start = Date.now();
    const content = await this.callAPI(prompt);
    
    return {
      content,
      metadata: {
        model: this.model,
        provider: this.name,
        durationMs: Date.now() - start,
        temperature: GENERATION_CONFIG.temperature,
      }
    };
  }
  
  /**
   * Call the HuggingFace Router API with retry logic
   * 
   * @param prompt - The generation prompt
   * @param attempt - Current retry attempt
   * @returns Generated content
   */
  private async callAPI(prompt: string, attempt = 1): Promise<string> {

    // 1. Define a type for the successful response from the API call
    type HuggingFaceAPIResponse = AxiosResponse<{
      choices: { message: { content: string } }[];
      // ...
    }>;

    // 2. Define a helper function for the actual API call
    const postCall = () => axios.post<HuggingFaceAPIResponse['data']>(    // Use the generic for data type
      this.apiUrl,
      {
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        stream: false,
        max_tokens: GENERATION_CONFIG.maxTokens,
        temperature: GENERATION_CONFIG.temperature,
      },
      {
        headers: {
          'Authorization': `Bearer ${env.HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: GENERATION_CONFIG.timeout,
      }
    );

    // 3. Perform the call and handle errors
    const response = await postCall()
      .catch((error) => this.handleError(error, prompt, attempt));

    // 4. Check if the response is an AxiosResponse (i.e., not a string from a successful retry)
    if (typeof response === 'string') {
      return response;    // Successfully resolved from a retry in handleError
    }

    // 5. Extract the content from the response
    const content = response.data?.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('Invalid response from HuggingFace');
    }
    
    return content;
  }
  
  /**
   * Handle API errors with retry logic
   * 
   * @param error - Axios error
   * @param prompt - The generation prompt
   * @param attempt - Current retry attempt
   * @returns Generated content (string) or the original AxiosResponse for immediate failure
   */
  private async handleError(error: AxiosError, prompt: string, attempt: number): Promise<AxiosResponse<any, any> | string> {
    const status = error.response?.status;

    // Max retries
    if (attempt >= RETRY_CONFIG.maxRetries) {
      logger.error({ 
        err: error, 
        attempt,
        status,
      }, 'HuggingFace max retries exceeded');
      throw error;
    }
    
    // Model loading
    if (status === 503) {
      logger.warn({ 
        attempt,
        waitTime: HUGGINGFACE_CONFIG.coldStartWaitTime,
      }, 'Model loading (cold start), waiting...');
      
      await this.sleep(HUGGINGFACE_CONFIG.coldStartWaitTime);
      return this.callAPI(prompt, attempt + 1);
    }
    
    // Rate limit
    if (status === 429) {
      const delay = RETRY_CONFIG.initialDelay * Math.pow(RETRY_CONFIG.backoffMultiplier, attempt - 1);
      
      logger.warn({ 
        attempt,
        delay,
      }, 'Rate limited, retrying with backoff...');
      
      await this.sleep(delay);
      return this.callAPI(prompt, attempt + 1);
    }

    // Other errors
    logger.error({ 
      err: error,
      status,
      data: error.response?.data,
    }, 'HuggingFace API error (not retrying)');
    
    throw error;
  }
  
  /**
   * Sleep helper
   * 
   * @param ms - Number of milliseconds to sleep
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const huggingface = new HuggingFaceProvider();