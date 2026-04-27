import { useState, useCallback } from "react";
import { AppFrame, SectionBadge } from "@/components/cyber/CyberShell";
import { AIChatBox, type Message } from "@/components/AIChatBox";
import { Bot, Key, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const AI_PROVIDERS = [
  { id: "chatgpt", name: "ChatGPT", icon: "🤖", model: "gpt-4-turbo", baseUrl: "https://api.openai.com/v1" },
  { id: "claude", name: "Claude", icon: "🧠", model: "claude-3-5-sonnet-20241022", baseUrl: "https://api.anthropic.com/v1" },
  { id: "deepseek", name: "DeepSeek", icon: "🔍", model: "deepseek-chat", baseUrl: "https://api.deepseek.com/v1" },
  { id: "kimi", name: "Kimi", icon: "🌙", model: "moonshot-v1-8k", baseUrl: "https://api.moonshot.cn/v1" },
  { id: "gemini", name: "Gemini", icon: "✨", model: "gemini-1.5-flash", baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai" },
  { id: "mistral", name: "Mistral", icon: "🌪️", model: "mistral-large-latest", baseUrl: "https://api.mistral.ai/v1" },
  { id: "perplexity", name: "Perplexity", icon: "🔮", model: "llama-3.1-sonar-large-128k-online", baseUrl: "https://api.perplexity.ai" },
  { id: "meta", name: "Meta Llama", icon: "🦙", model: "meta-llama/Llama-3.3-70B-Instruct-Turbo", baseUrl: "https://api.together.xyz/v1" },
  { id: "nemotron", name: "Nemotron", icon: "⚡", model: "nvidia/llama-3.1-nemotron-70b-instruct", baseUrl: "https://integrate.api.nvidia.com/v1" },
  { id: "hermes", name: "Hermes", icon: "💫", model: "NousResearch/Hermes-3-Llama-3.1-405B-Turbo", baseUrl: "https://api.together.xyz/v1" },
];

const SYSTEM_PROMPT = `Du bist ein erfahrener Cybersecurity-Advisor im CyberDash Framework.
Du hilfst bei OSINT-Recherchen, Pentest-Planung, Schwachstellenanalyse, Tool-Auswahl und Sicherheitskonzepten.
Antworte präzise, technisch korrekt und auf Deutsch oder Englisch je nach Sprache des Nutzers.
Weise darauf hin, wenn Aktionen nur auf autorisierten Systemen durchgeführt werden dürfen.`;

function loadApiKeys(): Record<string, string> {
  try {
    const raw = localStorage.getItem("ai-api-keys");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

async function callAI(
  providerId: string,
  messages: Message[],
  apiKey: string,
): Promise<string> {
  const provider = AI_PROVIDERS.find((p) => p.id === providerId);
  if (!provider) throw new Error("Unbekannter Provider");

  const payload = {
    model: provider.model,
    messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages.filter((m) => m.role !== "system")],
    max_tokens: 2000,
    temperature: 0.7,
  };

  const res = await fetch(`${provider.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`${provider.name} API Fehler ${res.status}: ${err.slice(0, 200)}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "Keine Antwort erhalten.";
}

export default function AIChatPage() {
  const apiKeys = loadApiKeys();
  const configuredProviders = AI_PROVIDERS.filter((p) => apiKeys[p.id]);

  const [selectedProvider, setSelectedProvider] = useState(
    configuredProviders[0]?.id ?? "",
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSend = useCallback(
    async (content: string) => {
      if (!selectedProvider) return;
      const apiKey = apiKeys[selectedProvider];
      if (!apiKey) return;

      setError("");
      const newMessages: Message[] = [...messages, { role: "user", content }];
      setMessages(newMessages);
      setIsLoading(true);

      try {
        const reply = await callAI(selectedProvider, newMessages, apiKey);
        setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unbekannter Fehler";
        setError(msg);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `[Fehler] ${msg}` },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [selectedProvider, messages, apiKeys],
  );

  const activeProvider = AI_PROVIDERS.find((p) => p.id === selectedProvider);

  if (configuredProviders.length === 0) {
    return (
      <AppFrame
        eyebrow="AI Assistant"
        title="AI Chat"
        action={<SectionBadge icon={<Bot className="h-3.5 w-3.5" />} label="Kein Provider konfiguriert" />}
      >
        <div className="glass-panel flex flex-col items-center gap-6 px-6 py-16 text-center">
          <Key className="h-12 w-12 text-cyan-300/60" />
          <div>
            <h2 className="font-display text-2xl text-white">Kein AI-Provider konfiguriert</h2>
            <p className="mt-3 max-w-md text-sm leading-7 text-slate-300">
              Füge zunächst mindestens einen API-Key in den AI-Einstellungen hinzu, um den Chat zu nutzen.
            </p>
          </div>
          <Link
            to="/ai-settings"
            className="inline-flex items-center gap-2 rounded-full bg-cyan-400/90 px-5 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-cyan-300"
          >
            <Key className="h-4 w-4" />
            AI Settings öffnen
          </Link>
        </div>
      </AppFrame>
    );
  }

  return (
    <AppFrame
      eyebrow="AI Assistant"
      title="AI Chat"
      action={
        <>
          <SectionBadge icon={<Sparkles className="h-3.5 w-3.5" />} label="Cybersecurity Advisor" />
          <SectionBadge icon={<Bot className="h-3.5 w-3.5" />} label={activeProvider ? `${activeProvider.icon} ${activeProvider.name}` : "–"} />
        </>
      }
    >
      <div className="flex flex-col gap-5">
        {/* Provider selector */}
        <div className="glass-panel flex flex-wrap items-center gap-3 px-5 py-4">
          <span className="font-mono text-[0.72rem] uppercase tracking-[0.32em] text-cyan-300/75">Provider</span>
          <div className="flex flex-wrap gap-2">
            {configuredProviders.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setSelectedProvider(p.id);
                  setMessages([]);
                  setError("");
                }}
                className={`rounded-full border px-3 py-1.5 text-sm transition ${
                  selectedProvider === p.id
                    ? "border-cyan-400/40 bg-cyan-400/15 text-white"
                    : "border-white/8 bg-white/[0.03] text-slate-300 hover:border-cyan-400/20 hover:text-white"
                }`}
              >
                {p.icon} {p.name}
              </button>
            ))}
          </div>
          <Link
            to="/ai-settings"
            className="ml-auto rounded-full border border-white/8 px-3 py-1.5 font-mono text-[0.68rem] uppercase tracking-[0.22em] text-slate-400 transition hover:border-cyan-400/20 hover:text-white"
          >
            + Provider
          </Link>
        </div>

        {error && (
          <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        )}

        {/* Chat box */}
        <AIChatBox
          messages={messages}
          onSendMessage={handleSend}
          isLoading={isLoading}
          height="calc(100vh - 340px)"
          placeholder={`Frage ${activeProvider?.name ?? "AI"} etwas zur Cybersecurity…`}
          emptyStateMessage={`${activeProvider?.icon ?? "🤖"} ${activeProvider?.name ?? "AI"} ist bereit. Stelle deine Cybersecurity-Frage.`}
          suggestedPrompts={[
            "Erkläre den Unterschied zwischen OSINT und aktivem Recon",
            "Welche Nmap-Optionen eignen sich für einen Stealth-Scan?",
            "Wie erstelle ich einen professionellen Pentest-Report?",
            "Was sind die Top-10 OWASP-Schwachstellen 2024?",
          ]}
          className="min-h-[400px] border-white/8 bg-[rgba(4,8,12,0.85)]"
        />
      </div>
    </AppFrame>
  );
}
