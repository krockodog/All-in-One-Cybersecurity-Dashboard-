import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ENV } from "./env";
import { invokeLLM, OLLAMA_UNREACHABLE_MESSAGE, resolveOllamaChatUrl } from "./llm";

const okResponse = {
  id: "chatcmpl-1",
  created: 0,
  model: "qwen2.5",
  choices: [
    {
      index: 0,
      message: { role: "assistant", content: "Hallo" },
      finish_reason: "stop",
    },
  ],
};

const originalEnv = { ...ENV };

function mockFetchOk(body: unknown = okResponse) {
  const fetchMock = vi.fn(async () =>
    new Response(JSON.stringify(body), {
      status: 200,
      headers: { "content-type": "application/json" },
    })
  );
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function lastCall(fetchMock: ReturnType<typeof vi.fn>) {
  const [url, init] = fetchMock.mock.calls.at(-1) as [string, RequestInit];
  return {
    url,
    init,
    headers: init.headers as Record<string, string>,
    body: JSON.parse(String(init.body)) as Record<string, unknown>,
  };
}

describe("invokeLLM (Ollama)", () => {
  beforeEach(() => {
    Object.assign(ENV, {
      ollamaUrl: "http://localhost:11434",
      ollamaModel: "qwen2.5",
      ollamaApiKey: "",
      ollamaMaxTokens: 4096,
      ollamaTimeoutMs: 5000,
      forgeApiUrl: "",
      forgeApiKey: "",
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    Object.assign(ENV, originalEnv);
  });

  it("posts to ${OLLAMA_URL}/v1/chat/completions with the configured model", async () => {
    const fetchMock = mockFetchOk();
    const result = await invokeLLM({ messages: [{ role: "user", content: "Hi" }] });

    const { url, init, headers, body } = lastCall(fetchMock);
    expect(url).toBe("http://localhost:11434/v1/chat/completions");
    expect(init.method).toBe("POST");
    expect(body.model).toBe("qwen2.5");
    expect(body.max_tokens).toBe(4096);
    expect(body.stream).toBe(false);
    expect(body).not.toHaveProperty("thinking");
    expect(JSON.stringify(body)).not.toContain("gemini");
    expect(headers).not.toHaveProperty("authorization");
    expect(result.choices[0].message.content).toBe("Hallo");
  });

  it("uses OLLAMA_URL / OLLAMA_MODEL / OLLAMA_MAX_TOKENS overrides and optional API key", async () => {
    Object.assign(ENV, {
      ollamaUrl: "http://gpu-box:11434/v1/",
      ollamaModel: "qwen2.5:14b",
      ollamaMaxTokens: 1024,
      ollamaApiKey: "proxy-token",
    });
    const fetchMock = mockFetchOk();
    await invokeLLM({ messages: [{ role: "user", content: "Hi" }] });

    const { url, headers, body } = lastCall(fetchMock);
    expect(url).toBe("http://gpu-box:11434/v1/chat/completions");
    expect(body.model).toBe("qwen2.5:14b");
    expect(body.max_tokens).toBe(1024);
    expect(headers.authorization).toBe("Bearer proxy-token");
  });

  it("does not require BUILT_IN_FORGE_API_KEY and never calls Manus Forge", async () => {
    Object.assign(ENV, { forgeApiUrl: "https://forge.manus.im", forgeApiKey: "paid-key" });
    const fetchMock = mockFetchOk();
    await invokeLLM({ messages: [{ role: "user", content: "Hi" }] });

    const { url, headers } = lastCall(fetchMock);
    expect(url).not.toContain("manus");
    expect(url.startsWith("http://localhost:11434/")).toBe(true);
    expect(JSON.stringify(headers)).not.toContain("paid-key");
  });

  it("keeps response_format json_schema and tools in the payload", async () => {
    const fetchMock = mockFetchOk();
    await invokeLLM({
      messages: [{ role: "user", content: "Hi" }],
      outputSchema: { name: "result", schema: { type: "object" }, strict: true },
      tools: [{ type: "function", function: { name: "lookup", parameters: { type: "object" } } }],
      toolChoice: "required",
    });

    const { body } = lastCall(fetchMock);
    expect(body.response_format).toEqual({
      type: "json_schema",
      json_schema: { name: "result", schema: { type: "object" }, strict: true },
    });
    expect(body.tools).toHaveLength(1);
    expect(body.tool_choice).toEqual({ type: "function", function: { name: "lookup" } });
  });

  it("throws a clear German error when Ollama is unreachable and does not fall back", async () => {
    const fetchMock = vi.fn(async () => {
      throw new TypeError("fetch failed");
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      invokeLLM({ messages: [{ role: "user", content: "Hi" }] })
    ).rejects.toMatchObject({
      code: "SERVICE_UNAVAILABLE",
      message: expect.stringContaining(OLLAMA_UNREACHABLE_MESSAGE),
    });
    // Exactly one attempt, only against Ollama – no second (paid) endpoint.
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(String((fetchMock.mock.calls[0] as unknown[])[0])).toBe(
      "http://localhost:11434/v1/chat/completions"
    );
  });

  it("reports a missing model with a German hint", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response('{"error":"model \\"qwen2.5\\" not found"}', { status: 404 }))
    );
    await expect(
      invokeLLM({ messages: [{ role: "user", content: "Hi" }] })
    ).rejects.toThrow(/ollama pull qwen2\.5/);
  });

  it("defaults to localhost when OLLAMA_URL is empty and rejects paid hosts", () => {
    expect(resolveOllamaChatUrl("")).toBe("http://localhost:11434/v1/chat/completions");
    expect(() => resolveOllamaChatUrl("https://forge.manus.im")).toThrow(/kostenpflichtig/);
  });

  it("only accepts self-hosted or explicitly allowed Ollama hosts", () => {
    expect(() => resolveOllamaChatUrl("https://api.openai.com", { allowedHosts: [] })).toThrow(
      /kostenpflichtig/
    );
    expect(() =>
      resolveOllamaChatUrl("https://api.openai.com", { allowedHosts: ["api.openai.com"] })
    ).toThrow(/kostenpflichtig/);
    expect(() => resolveOllamaChatUrl("https://llm.example.org", { allowedHosts: [] })).toThrow(
      /OLLAMA_ALLOWED_HOSTS/
    );
    expect(
      resolveOllamaChatUrl("https://llm.example.org", { allowedHosts: ["llm.example.org"] })
    ).toBe("https://llm.example.org/v1/chat/completions");
    expect(resolveOllamaChatUrl("http://192.168.1.20:11434", { allowedHosts: [] })).toBe(
      "http://192.168.1.20:11434/v1/chat/completions"
    );
    expect(resolveOllamaChatUrl("http://ollama:11434", { allowedHosts: [] })).toBe(
      "http://ollama:11434/v1/chat/completions"
    );
  });

  it("refuses to send the API key over plain HTTP to a remote host", () => {
    expect(() =>
      resolveOllamaChatUrl("http://llm.example.org", {
        apiKey: "secret",
        allowedHosts: ["llm.example.org"],
      })
    ).toThrow(/HTTPS/);
    expect(
      resolveOllamaChatUrl("https://llm.example.org", {
        apiKey: "secret",
        allowedHosts: ["llm.example.org"],
      })
    ).toBe("https://llm.example.org/v1/chat/completions");
    expect(resolveOllamaChatUrl("http://localhost:11434", { apiKey: "secret" })).toBe(
      "http://localhost:11434/v1/chat/completions"
    );
  });
});
