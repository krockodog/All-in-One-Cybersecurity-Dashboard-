/**
 * AI Token Management Service
 * Centralized management of AI provider tokens and credentials
 */

export interface AIProvider {
  id: string;
  name: string;
  type: 'llm' | 'image' | 'speech' | 'embedding';
  status: 'active' | 'inactive' | 'error';
  tokenStatus: 'valid' | 'expired' | 'invalid';
  usageStats: UsageStats;
  config: ProviderConfig;
}

export interface ProviderConfig {
  apiKey?: string;
  apiUrl?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  rateLimit?: number;
  customSettings?: Record<string, any>;
}

export interface UsageStats {
  totalRequests: number;
  totalTokensUsed: number;
  totalCost: number;
  lastUsed: string;
  requestsThisMonth: number;
  tokensThisMonth: number;
  costThisMonth: number;
}

export interface TokenAlert {
  id: string;
  providerID: string;
  type: 'quota_exceeded' | 'rate_limit' | 'expiration' | 'error';
  severity: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: Date;
  resolved: boolean;
}

export class AITokenManager {
  private static providers: Map<string, AIProvider> = new Map();
  private static alerts: Map<string, TokenAlert> = new Map();

  /**
   * Register AI provider
   */
  static registerProvider(provider: AIProvider): void {
    this.providers.set(provider.id, provider);
    console.log(`[AI Token Manager] Registered provider: ${provider.name}`);
  }

  /**
   * Get all providers
   */
  static getAllProviders(): AIProvider[] {
    return Array.from(this.providers.values());
  }

  /**
   * Get provider by ID
   */
  static getProvider(id: string): AIProvider | undefined {
    return this.providers.get(id);
  }

  /**
   * Update provider config
   */
  static updateProvider(id: string, config: Partial<ProviderConfig>): void {
    const provider = this.providers.get(id);
    if (provider) {
      provider.config = { ...provider.config, ...config };
      this.validateProvider(id);
      console.log(`[AI Token Manager] Updated provider: ${id}`);
    }
  }

  /**
   * Validate provider token
   */
  static validateProvider(id: string): boolean {
    const provider = this.providers.get(id);
    if (!provider) return false;

    try {
      // Simulate token validation
      if (!provider.config.apiKey) {
        provider.tokenStatus = 'invalid';
        this.createAlert(id, 'error', 'Missing API key');
        return false;
      }

      provider.tokenStatus = 'valid';
      provider.status = 'active';
      return true;
    } catch (error) {
      provider.tokenStatus = 'invalid';
      provider.status = 'error';
      this.createAlert(id, 'error', String(error));
      return false;
    }
  }

  /**
   * Check usage quota
   */
  static checkUsageQuota(id: string): { available: boolean; remaining: number; percentUsed: number } {
    const provider = this.providers.get(id);
    if (!provider) {
      return { available: false, remaining: 0, percentUsed: 100 };
    }

    const maxTokens = provider.config.maxTokens || 1000000;
    const used = provider.usageStats.tokensThisMonth;
    const remaining = maxTokens - used;
    const percentUsed = (used / maxTokens) * 100;

    if (percentUsed > 90) {
      this.createAlert(id, 'quota_exceeded', `Usage at ${percentUsed.toFixed(1)}%`);
    }

    return {
      available: remaining > 0,
      remaining,
      percentUsed,
    };
  }

  /**
   * Record token usage
   */
  static recordUsage(id: string, tokensUsed: number, cost: number = 0): void {
    const provider = this.providers.get(id);
    if (provider) {
      provider.usageStats.totalRequests++;
      provider.usageStats.totalTokensUsed += tokensUsed;
      provider.usageStats.totalCost += cost;
      provider.usageStats.lastUsed = new Date().toISOString();
      provider.usageStats.requestsThisMonth++;
      provider.usageStats.tokensThisMonth += tokensUsed;
      provider.usageStats.costThisMonth += cost;

      this.checkUsageQuota(id);
    }
  }

  /**
   * Get token dashboard
   */
  static getTokenDashboard(): {
    providers: AIProvider[];
    alerts: TokenAlert[];
    summary: DashboardSummary;
  } {
    const providers = this.getAllProviders();
    const alerts = Array.from(this.alerts.values()).filter((a) => !a.resolved);

    const summary: DashboardSummary = {
      totalProviders: providers.length,
      activeProviders: providers.filter((p) => p.status === 'active').length,
      providersWithErrors: providers.filter((p) => p.status === 'error').length,
      totalTokensUsedThisMonth: providers.reduce((sum, p) => sum + p.usageStats.tokensThisMonth, 0),
      totalCostThisMonth: providers.reduce((sum, p) => sum + p.usageStats.costThisMonth, 0),
      activeAlerts: alerts.length,
      criticalAlerts: alerts.filter((a) => a.severity === 'critical').length,
    };

    return { providers, alerts, summary };
  }

  /**
   * Create alert
   */
  private static createAlert(
    providerID: string,
    type: 'quota_exceeded' | 'rate_limit' | 'expiration' | 'error',
    message: string
  ): void {
    const alertID = `alert-${Date.now()}`;
    const alert: TokenAlert = {
      id: alertID,
      providerID,
      type,
      severity: type === 'quota_exceeded' ? 'warning' : type === 'error' ? 'critical' : 'info',
      message,
      timestamp: new Date(),
      resolved: false,
    };

    this.alerts.set(alertID, alert);
    console.log(`[AI Token Manager] Alert created: ${message}`);
  }

  /**
   * Resolve alert
   */
  static resolveAlert(alertID: string): void {
    const alert = this.alerts.get(alertID);
    if (alert) {
      alert.resolved = true;
      console.log(`[AI Token Manager] Alert resolved: ${alertID}`);
    }
  }

  /**
   * Get default providers
   */
  static getDefaultProviders(): AIProvider[] {
    return [
      {
        id: 'openai',
        name: 'OpenAI GPT-4',
        type: 'llm',
        status: 'inactive',
        tokenStatus: 'invalid',
        usageStats: {
          totalRequests: 0,
          totalTokensUsed: 0,
          totalCost: 0,
          lastUsed: '',
          requestsThisMonth: 0,
          tokensThisMonth: 0,
          costThisMonth: 0,
        },
        config: {
          apiUrl: 'https://api.openai.com/v1',
          model: 'gpt-4',
          maxTokens: 8000,
          temperature: 0.7,
          rateLimit: 3500,
        },
      },
      {
        id: 'anthropic',
        name: 'Anthropic Claude',
        type: 'llm',
        status: 'inactive',
        tokenStatus: 'invalid',
        usageStats: {
          totalRequests: 0,
          totalTokensUsed: 0,
          totalCost: 0,
          lastUsed: '',
          requestsThisMonth: 0,
          tokensThisMonth: 0,
          costThisMonth: 0,
        },
        config: {
          apiUrl: 'https://api.anthropic.com/v1',
          model: 'claude-3-opus',
          maxTokens: 100000,
          temperature: 0.7,
          rateLimit: 5000,
        },
      },
      {
        id: 'google',
        name: 'Google Gemini',
        type: 'llm',
        status: 'inactive',
        tokenStatus: 'invalid',
        usageStats: {
          totalRequests: 0,
          totalTokensUsed: 0,
          totalCost: 0,
          lastUsed: '',
          requestsThisMonth: 0,
          tokensThisMonth: 0,
          costThisMonth: 0,
        },
        config: {
          apiUrl: 'https://generativelanguage.googleapis.com/v1beta',
          model: 'gemini-pro',
          maxTokens: 32000,
          temperature: 0.7,
          rateLimit: 2000,
        },
      },
      {
        id: 'deepseek',
        name: 'DeepSeek',
        type: 'llm',
        status: 'inactive',
        tokenStatus: 'invalid',
        usageStats: {
          totalRequests: 0,
          totalTokensUsed: 0,
          totalCost: 0,
          lastUsed: '',
          requestsThisMonth: 0,
          tokensThisMonth: 0,
          costThisMonth: 0,
        },
        config: {
          apiUrl: 'https://api.deepseek.com/v1',
          model: 'deepseek-chat',
          maxTokens: 4096,
          temperature: 0.7,
          rateLimit: 1000,
        },
      },
      {
        id: 'huggingface',
        name: 'Hugging Face',
        type: 'llm',
        status: 'inactive',
        tokenStatus: 'invalid',
        usageStats: {
          totalRequests: 0,
          totalTokensUsed: 0,
          totalCost: 0,
          lastUsed: '',
          requestsThisMonth: 0,
          tokensThisMonth: 0,
          costThisMonth: 0,
        },
        config: {
          apiUrl: 'https://api-inference.huggingface.co',
          model: 'meta-llama/Llama-2-7b-chat',
          maxTokens: 2048,
          temperature: 0.7,
          rateLimit: 500,
        },
      },
    ];
  }

  /**
   * Initialize default providers
   */
  static initializeDefaultProviders(): void {
    const defaultProviders = this.getDefaultProviders();
    defaultProviders.forEach((provider) => this.registerProvider(provider));
    console.log(`[AI Token Manager] Initialized ${defaultProviders.length} default providers`);
  }
}

export interface DashboardSummary {
  totalProviders: number;
  activeProviders: number;
  providersWithErrors: number;
  totalTokensUsedThisMonth: number;
  totalCostThisMonth: number;
  activeAlerts: number;
  criticalAlerts: number;
}

export const aiTokenManager = AITokenManager;
