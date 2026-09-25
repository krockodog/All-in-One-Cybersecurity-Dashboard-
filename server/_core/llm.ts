import { TRPCError } from "@trpc/server";
import { ENV } from "./env";

export type Role = "system" | "user" | "assistant" | "tool" | "function";

export type TextContent = {
  type: "text";
  text: string;
};

export type ImageContent = {
  type: "image_url";
  image_url: {
    url: string;
    detail?: "auto" | "low" | "high";
  };
};

export type FileContent = {
  type: "file_url";
  file_url: {
    url: string;
    mime_type?: "audio/mpeg" | "audio/wav" | "application/pdf" | "audio/mp4" | "video/mp4" ;
  };
};

export type MessageContent = string | TextContent | ImageContent | FileContent;

export type Message = {
  role: Role;
  content: MessageContent | MessageContent[];
  name?: string;
  tool_call_id?: string;
};

export type Tool = {
  type: "function";
  function: {
    name: string;
    description?: string;
    parameters?: Record<string, unknown>;
  };
};

export type ToolChoicePrimitive = "none" | "auto" | "required";
export type ToolChoiceByName = { name: string };
export type ToolChoiceExplicit = {
  type: "function";
  function: {
    name: string;
  };
};

export type ToolChoice =
  | ToolChoicePrimitive
  | ToolChoiceByName
  | ToolChoiceExplicit;

export type InvokeParams = {
  messages: Message[];
  tools?: Tool[];
  toolChoice?: ToolChoice;
  tool_choice?: ToolChoice;
  maxTokens?: number;
  max_tokens?: number;
  outputSchema?: OutputSchema;
  output_schema?: OutputSchema;
  responseFormat?: ResponseFormat;
  response_format?: ResponseFormat;
};

export type ToolCall = {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
};

export type InvokeResult = {
  id: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: Role;
      content: string | Array<TextContent | ImageContent | FileContent>;
      tool_calls?: ToolCall[];
    };
    finish_reason: string | null;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
};

export type JsonSchema = {
  name: string;
  schema: Record<string, unknown>;
  strict?: boolean;
};

export type OutputSchema = JsonSchema;

export type ResponseFormat =
  | { type: "text" }
  | { type: "json_object" }
  | { type: "json_schema"; json_schema: JsonSchema };

const ensureArray = (
  value: MessageContent | MessageContent[]
): MessageContent[] => (Array.isArray(value) ? value : [value]);

const normalizeContentPart = (
  part: MessageContent
): TextContent | ImageContent | FileContent => {
  if (typeof part === "string") {
    return { type: "text", text: part };
  }

  if (part.type === "text") {
    return part;
  }

  if (part.type === "image_url") {
    return part;
  }

  if (part.type === "file_url") {
    return part;
  }

  throw new Error("Unsupported message content part");
};

const normalizeMessage = (message: Message) => {
  const { role, name, tool_call_id } = message;

  if (role === "tool" || role === "function") {
    const content = ensureArray(message.content)
      .map(part => (typeof part === "string" ? part : JSON.stringify(part)))
      .join("\n");

    return {
      role,
      name,
      tool_call_id,
      content,
    };
  }

  const contentParts = ensureArray(message.content).map(normalizeContentPart);

  // If there's only text content, collapse to a single string for compatibility
  if (contentParts.length === 1 && contentParts[0].type === "text") {
    return {
      role,
      name,
      content: contentParts[0].text,
    };
  }

  return {
    role,
    name,
    content: contentParts,
  };
};

const normalizeToolChoice = (
  toolChoice: ToolChoice | undefined,
  tools: Tool[] | undefined
): "none" | "auto" | ToolChoiceExplicit | undefined => {
  if (!toolChoice) return undefined;

  if (toolChoice === "none" || toolChoice === "auto") {
    return toolChoice;
  }

  if (toolChoice === "required") {
    if (!tools || tools.length === 0) {
      throw new Error(
        "tool_choice 'required' was provided but no tools were configured"
      );
    }

    if (tools.length > 1) {
      throw new Error(
        "tool_choice 'required' needs a single tool or specify the tool name explicitly"
      );
    }

    return {
      type: "function",
      function: { name: tools[0].function.name },
    };
  }

  if ("name" in toolChoice) {
    return {
      type: "function",
      function: { name: toolChoice.name },
    };
  }

  return toolChoice;
};

/**
 * LLM backend: self-hosted Ollama via its OpenAI-compatible API.
 * There is deliberately NO fallback to any hosted/paid endpoint (e.g. Manus
 * Forge). If Ollama is unreachable, calls fail with a clear German error.
 */
export const OLLAMA_UNREACHABLE_MESSAGE = "KI-Dienst (Ollama) nicht erreichbar";

// Hosted/paid LLM APIs that must never be used, even if listed in
// OLLAMA_ALLOWED_HOSTS (defence in depth for the "only own Ollama" policy).
const FORBIDDEN_LLM_HOSTS = [
  /(^|\.)manus\.(im|space|computer)$/i,
  /(^|\.)butterfly-effect\.dev$/i,
  /(^|\.)openai\.com$/i,
  /(^|\.)openai\.azure\.com$/i,
  /(^|\.)anthropic\.com$/i,
  /(^|\.)googleapis\.com$/i,
  /(^|\.)mistral\.ai$/i,
  /(^|\.)deepseek\.com$/i,
  /(^|\.)groq\.com$/i,
  /(^|\.)together\.(ai|xyz)$/i,
  /(^|\.)openrouter\.ai$/i,
  /(^|\.)x\.ai$/i,
  /(^|\.)cohere\.(ai|com)$/i,
  /(^|\.)perplexity\.ai$/i,
  /(^|\.)fireworks\.ai$/i,
  /(^|\.)huggingface\.co$/i,
];

/**
 * Hosts that are self-hosted by construction: loopback, private/link-local IPs,
 * single-label names (e.g. a Docker service "ollama" or "gpu-box") and LAN /
 * Docker-internal suffixes. Anything else is a public endpoint and must be
 * explicitly declared as your own server via OLLAMA_ALLOWED_HOSTS.
 */
const isSelfHostedHost = (host: string): boolean => {
  const h = host.toLowerCase().replace(/^\[|\]$/g, "");
  if (h === "localhost" || h === "host.docker.internal") return true;
  if (!h.includes(".") && !h.includes(":")) return true; // single-label
  if (/\.(local|lan|internal|home\.arpa|localhost)$/.test(h)) return true;
  if (/^127\./.test(h) || /^10\./.test(h) || /^192\.168\./.test(h)) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(h) || /^169\.254\./.test(h)) return true;
  if (/^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./.test(h)) return true; // CGNAT/Tailscale
  if (h === "::1" || /^f[cd][0-9a-f]{2}:/.test(h) || /^fe80:/.test(h)) return true;
  return false;
};

const configError = (message: string) =>
  new TRPCError({ code: "INTERNAL_SERVER_ERROR", message });

export const resolveOllamaChatUrl = (
  baseUrl: string = ENV.ollamaUrl,
  opts: { apiKey?: string; allowedHosts?: string[] } = {},
): string => {
  const apiKey = opts.apiKey ?? ENV.ollamaApiKey;
  const allowedHosts = opts.allowedHosts ?? ENV.ollamaAllowedHosts;
  const trimmed = (baseUrl || "").trim() || "http://localhost:11434";
  // Accept both "http://host:11434" and "http://host:11434/v1".
  const base = trimmed.replace(/\/+$/, "").replace(/\/v1$/, "");
  let parsed: URL;
  try {
    parsed = new URL(base);
  } catch {
    throw configError(`KI-Dienst (Ollama) nicht konfiguriert: ungültige OLLAMA_URL "${trimmed}"`);
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw configError(`KI-Dienst (Ollama) nicht konfiguriert: OLLAMA_URL muss http(s) sein.`);
  }
  const host = parsed.hostname.toLowerCase();
  if (FORBIDDEN_LLM_HOSTS.some(re => re.test(host))) {
    throw configError(
      `OLLAMA_URL zeigt auf einen kostenpflichtigen Dienst (${host}) – nur ein eigener Ollama-Server ist erlaubt.`,
    );
  }
  const selfHosted = isSelfHostedHost(host);
  if (!selfHosted && !allowedHosts.includes(host)) {
    throw configError(
      `OLLAMA_URL (${host}) ist kein lokaler/privater Host. Nur eigene Ollama-Server sind erlaubt – ` +
        `trage den Host in OLLAMA_ALLOWED_HOSTS ein, wenn es dein eigener Server ist.`,
    );
  }
  // Never send the bearer token in cleartext over the public internet.
  if (apiKey && !selfHosted && parsed.protocol !== "https:") {
    throw configError(
      `OLLAMA_API_KEY ist gesetzt, aber OLLAMA_URL (${host}) nutzt kein HTTPS – Token würde im Klartext übertragen.`,
    );
  }
  return `${base}/v1/chat/completions`;
};

const normalizeResponseFormat = ({
  responseFormat,
  response_format,
  outputSchema,
  output_schema,
}: {
  responseFormat?: ResponseFormat;
  response_format?: ResponseFormat;
  outputSchema?: OutputSchema;
  output_schema?: OutputSchema;
}):
  | { type: "json_schema"; json_schema: JsonSchema }
  | { type: "text" }
  | { type: "json_object" }
  | undefined => {
  const explicitFormat = responseFormat || response_format;
  if (explicitFormat) {
    if (
      explicitFormat.type === "json_schema" &&
      !explicitFormat.json_schema?.schema
    ) {
      throw new Error(
        "responseFormat json_schema requires a defined schema object"
      );
    }
    return explicitFormat;
  }

  const schema = outputSchema || output_schema;
  if (!schema) return undefined;

  if (!schema.name || !schema.schema) {
    throw new Error("outputSchema requires both name and schema");
  }

  return {
    type: "json_schema",
    json_schema: {
      name: schema.name,
      schema: schema.schema,
      ...(typeof schema.strict === "boolean" ? { strict: schema.strict } : {}),
    },
  };
};

export async function invokeLLM(params: InvokeParams): Promise<InvokeResult> {
  const {
    messages,
    tools,
    toolChoice,
    tool_choice,
    maxTokens,
    max_tokens,
    outputSchema,
    output_schema,
    responseFormat,
    response_format,
  } = params;

  const url = resolveOllamaChatUrl();
  const model = ENV.ollamaModel;

  const payload: Record<string, unknown> = {
    model,
    messages: messages.map(normalizeMessage),
    stream: false,
  };

  if (tools && tools.length > 0) {
    payload.tools = tools;
  }

  const normalizedToolChoice = normalizeToolChoice(
    toolChoice || tool_choice,
    tools
  );
  if (normalizedToolChoice) {
    payload.tool_choice = normalizedToolChoice;
  }

  payload.max_tokens = maxTokens ?? max_tokens ?? ENV.ollamaMaxTokens;

  const normalizedResponseFormat = normalizeResponseFormat({
    responseFormat,
    response_format,
    outputSchema,
    output_schema,
  });

  if (normalizedResponseFormat) {
    payload.response_format = normalizedResponseFormat;
  }

  const headers: Record<string, string> = {
    "content-type": "application/json",
  };
  if (ENV.ollamaApiKey) {
    headers.authorization = `Bearer ${ENV.ollamaApiKey}`;
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(ENV.ollamaTimeoutMs),
    });
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    console.warn(`[LLM] Ollama request to ${url} failed: ${reason}`);
    throw new TRPCError({
      code: "SERVICE_UNAVAILABLE",
      message: `${OLLAMA_UNREACHABLE_MESSAGE} (${url}). Läuft \`ollama serve\` und ist das Modell "${model}" installiert?`,
      cause: error,
    });
  }

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    console.warn(
      `[LLM] Ollama responded ${response.status} ${response.statusText}: ${errorText}`
    );
    if (response.status === 404 && /model/i.test(errorText)) {
      throw new TRPCError({
        code: "SERVICE_UNAVAILABLE",
        message: `KI-Modell "${model}" ist in Ollama nicht installiert. Bitte \`ollama pull ${model}\` ausführen.`,
      });
    }
    throw new TRPCError({
      code: "BAD_GATEWAY",
      message: `KI-Dienst (Ollama) Fehler: ${response.status} ${response.statusText}`.trim(),
    });
  }

  return (await response.json()) as InvokeResult;
}
