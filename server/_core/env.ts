const parsePositiveInt = (value: string | undefined, fallback: number) => {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  // Legacy Manus Forge proxy (storage, notifications, image generation, voice,
  // maps, data API). NOT used for LLM calls. No default URL: features that
  // depend on it fail with a "not configured" error when unset.
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  // Self-hosted LLM via Ollama (OpenAI-compatible API). The only LLM backend.
  ollamaUrl: (process.env.OLLAMA_URL ?? "").trim() || "http://localhost:11434",
  ollamaModel: (process.env.OLLAMA_MODEL ?? "").trim() || "qwen2.5",
  ollamaApiKey: (process.env.OLLAMA_API_KEY ?? "").trim(),
  // Public hostnames of your OWN Ollama servers (comma-separated). Needed only if
  // OLLAMA_URL is not localhost / a private IP / a LAN or Docker-internal name.
  ollamaAllowedHosts: (process.env.OLLAMA_ALLOWED_HOSTS ?? "")
    .split(",")
    .map((h) => h.trim().toLowerCase())
    .filter(Boolean),
  ollamaMaxTokens: parsePositiveInt(process.env.OLLAMA_MAX_TOKENS, 4096),
  ollamaTimeoutMs: parsePositiveInt(process.env.OLLAMA_TIMEOUT_MS, 120_000),
};
