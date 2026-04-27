import { describe, it, expect, vi, beforeEach } from "vitest";
import { AIIntegrationService, AIProvider, AIMessage } from "./aiIntegration";

describe("AIIntegrationService", () => {
  let service: AIIntegrationService;

  beforeEach(() => {
    service = new AIIntegrationService();
  });

  describe("registerProvider", () => {
    it("should register a provider successfully", () => {
      service.registerProvider({ provider: "chatgpt", apiKey: "sk-test-key" });
      expect(service.isProviderConfigured("chatgpt")).toBe(true);
    });

    it("should register multiple providers independently", () => {
      service.registerProvider({ provider: "chatgpt", apiKey: "sk-openai" });
      service.registerProvider({ provider: "claude", apiKey: "sk-anthropic" });
      expect(service.isProviderConfigured("chatgpt")).toBe(true);
      expect(service.isProviderConfigured("claude")).toBe(true);
    });

    it("should overwrite an existing provider registration", () => {
      service.registerProvider({ provider: "chatgpt", apiKey: "old-key" });
      service.registerProvider({ provider: "chatgpt", apiKey: "new-key" });
      // Still configured, just with updated key
      expect(service.isProviderConfigured("chatgpt")).toBe(true);
    });

    it("should accept optional baseUrl and model", () => {
      service.registerProvider({
        provider: "deepseek",
        apiKey: "sk-deepseek",
        baseUrl: "https://custom.api.example.com",
        model: "deepseek-custom-model",
      });
      expect(service.isProviderConfigured("deepseek")).toBe(true);
    });
  });

  describe("isProviderConfigured", () => {
    it("should return false for an unregistered provider", () => {
      expect(service.isProviderConfigured("chatgpt")).toBe(false);
    });

    it("should return true for a registered provider", () => {
      service.registerProvider({ provider: "gemini", apiKey: "gemini-key" });
      expect(service.isProviderConfigured("gemini")).toBe(true);
    });

    it("should return false after checking a non-existent provider", () => {
      service.registerProvider({ provider: "claude", apiKey: "claude-key" });
      expect(service.isProviderConfigured("mistral")).toBe(false);
    });
  });

  describe("getConfiguredProviders", () => {
    it("should return an empty array when no providers are configured", () => {
      expect(service.getConfiguredProviders()).toHaveLength(0);
    });

    it("should return configured providers", () => {
      service.registerProvider({ provider: "chatgpt", apiKey: "key1" });
      service.registerProvider({ provider: "claude", apiKey: "key2" });
      const providers = service.getConfiguredProviders();
      expect(providers).toHaveLength(2);
      expect(providers).toContain("chatgpt");
      expect(providers).toContain("claude");
    });

    it("should not contain duplicates after re-registering the same provider", () => {
      service.registerProvider({ provider: "chatgpt", apiKey: "key1" });
      service.registerProvider({ provider: "chatgpt", apiKey: "key2" });
      const providers = service.getConfiguredProviders();
      expect(providers.filter((p) => p === "chatgpt")).toHaveLength(1);
    });

    it("should list all supported provider types", () => {
      const allProviders: AIProvider[] = [
        "chatgpt", "claude", "deepseek", "nemotron", "gemini",
        "meta", "mistral", "perplexity", "hermes",
      ];
      for (const provider of allProviders) {
        service.registerProvider({ provider, apiKey: "test-key" });
      }
      const configured = service.getConfiguredProviders();
      expect(configured).toHaveLength(allProviders.length);
    });
  });

  describe("callAI", () => {
    it("should throw when provider is not configured", async () => {
      const messages: AIMessage[] = [{ role: "user", content: "Hello" }];
      await expect(service.callAI("chatgpt", messages)).rejects.toThrow(
        "AI provider chatgpt not configured"
      );
    });

    it("should call the provider endpoint and return a response", async () => {
      const mockResponse = {
        choices: [{ message: { content: "Hello from AI" } }],
        usage: { prompt_tokens: 5, completion_tokens: 10 },
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as unknown as Response);

      service.registerProvider({ provider: "chatgpt", apiKey: "sk-test" });
      const messages: AIMessage[] = [{ role: "user", content: "Hello" }];
      const result = await service.callAI("chatgpt", messages);

      expect(result.provider).toBe("chatgpt");
      expect(result.content).toBe("Hello from AI");
    });

    it("should include system prompt in messages when provided", async () => {
      const mockResponse = {
        choices: [{ message: { content: "Response" } }],
        usage: { prompt_tokens: 10, completion_tokens: 5 },
      };

      const fetchMock = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as unknown as Response);
      global.fetch = fetchMock;

      service.registerProvider({ provider: "claude", apiKey: "sk-claude" });
      const messages: AIMessage[] = [{ role: "user", content: "Test" }];
      await service.callAI("claude", messages, "You are a security expert.");

      const callBody = JSON.parse(fetchMock.mock.calls[0][1].body as string);
      expect(callBody.messages[0].role).toBe("system");
      expect(callBody.messages[0].content).toBe("You are a security expert.");
    });

    it("should throw when the API returns a non-ok response", async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        statusText: "Unauthorized",
      } as unknown as Response);

      service.registerProvider({ provider: "chatgpt", apiKey: "bad-key" });
      const messages: AIMessage[] = [{ role: "user", content: "Hello" }];
      await expect(service.callAI("chatgpt", messages)).rejects.toThrow(
        "Failed to call chatgpt"
      );
    });

    it("should use custom baseUrl when provided", async () => {
      const mockResponse = {
        choices: [{ message: { content: "Custom response" } }],
        usage: {},
      };

      const fetchMock = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as unknown as Response);
      global.fetch = fetchMock;

      service.registerProvider({
        provider: "chatgpt",
        apiKey: "sk-test",
        baseUrl: "https://custom.api.example.com/v1",
      });

      const messages: AIMessage[] = [{ role: "user", content: "Hello" }];
      await service.callAI("chatgpt", messages);

      expect(fetchMock.mock.calls[0][0]).toContain("https://custom.api.example.com/v1");
    });

    it("should use custom model when provided", async () => {
      const mockResponse = {
        choices: [{ message: { content: "Custom model response" } }],
        usage: {},
      };

      const fetchMock = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as unknown as Response);
      global.fetch = fetchMock;

      service.registerProvider({
        provider: "chatgpt",
        apiKey: "sk-test",
        model: "gpt-3.5-turbo",
      });

      const messages: AIMessage[] = [{ role: "user", content: "Hello" }];
      await service.callAI("chatgpt", messages);

      const callBody = JSON.parse(fetchMock.mock.calls[0][1].body as string);
      expect(callBody.model).toBe("gpt-3.5-turbo");
    });

    it("should include Authorization header with Bearer token", async () => {
      const mockResponse = {
        choices: [{ message: { content: "Response" } }],
        usage: {},
      };

      const fetchMock = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as unknown as Response);
      global.fetch = fetchMock;

      service.registerProvider({ provider: "chatgpt", apiKey: "sk-secret" });
      const messages: AIMessage[] = [{ role: "user", content: "Hello" }];
      await service.callAI("chatgpt", messages);

      const callHeaders = fetchMock.mock.calls[0][1].headers;
      expect(callHeaders.Authorization).toBe("Bearer sk-secret");
    });
  });
});
