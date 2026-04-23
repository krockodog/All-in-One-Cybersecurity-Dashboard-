import { z } from "zod";

export type AIProvider = "chatgpt" | "claude" | "deepseek" | "nemotron" | "gemini" | "meta" | "mistral" | "perplexity" | "hermes";

export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  baseUrl?: string;
  model?: string;
}

export interface AIMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface AIResponse {
  provider: AIProvider;
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
  };
}

const providerConfigs: Record<AIProvider, { baseUrl: string; defaultModel: string }> = {
  chatgpt: {
    baseUrl: "https://api.openai.com/v1",
    defaultModel: "gpt-4-turbo",
  },
  claude: {
    baseUrl: "https://api.anthropic.com",
    defaultModel: "claude-3-opus-20240229",
  },
  deepseek: {
    baseUrl: "https://api.deepseek.com",
    defaultModel: "deepseek-chat",
  },
  nemotron: {
    baseUrl: "https://api.nvidia.com/v1",
    defaultModel: "nvidia/nemotron-4-340b-instruct",
  },
  gemini: {
    baseUrl: "https://generativelanguage.googleapis.com/v1beta",
    defaultModel: "gemini-pro",
  },
  meta: {
    baseUrl: "https://api.meta.com/v1",
    defaultModel: "llama-2-70b-chat",
  },
  mistral: {
    baseUrl: "https://api.mistral.ai/v1",
    defaultModel: "mistral-large-latest",
  },
  perplexity: {
    baseUrl: "https://api.perplexity.ai",
    defaultModel: "pplx-70b-online",
  },
  hermes: {
    baseUrl: "https://api.hermes.ai/v1",
    defaultModel: "hermes-2-pro",
  },
};

export class AIIntegrationService {
  private configs: Map<AIProvider, AIConfig> = new Map();

  registerProvider(config: AIConfig) {
    this.configs.set(config.provider, config);
  }

  async callAI(provider: AIProvider, messages: AIMessage[], systemPrompt?: string): Promise<AIResponse> {
    const config = this.configs.get(provider);
    if (!config) {
      throw new Error(`AI provider ${provider} not configured`);
    }

    const providerConfig = providerConfigs[provider];
    const model = config.model || providerConfig.defaultModel;
    const baseUrl = config.baseUrl || providerConfig.baseUrl;

    try {
      const response = await this.callProvider(provider, baseUrl, model, config.apiKey, messages, systemPrompt);
      return response;
    } catch (error) {
      throw new Error(`Failed to call ${provider}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async callProvider(
    provider: AIProvider,
    baseUrl: string,
    model: string,
    apiKey: string,
    messages: AIMessage[],
    systemPrompt?: string,
  ): Promise<AIResponse> {
    // Generic implementation for OpenAI-compatible APIs
    const fullMessages = systemPrompt
      ? [{ role: "system" as const, content: systemPrompt }, ...messages]
      : messages;

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: fullMessages,
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      provider,
      content: data.choices[0].message.content,
      usage: data.usage,
    };
  }

  getConfiguredProviders(): AIProvider[] {
    return Array.from(this.configs.keys());
  }

  isProviderConfigured(provider: AIProvider): boolean {
    return this.configs.has(provider);
  }
}

export const aiService = new AIIntegrationService();
